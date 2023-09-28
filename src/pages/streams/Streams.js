import React, {useState} from "react";
import {observer} from "mobx-react";
import {dataStore, editStore, streamStore} from "Stores";
import Modal from "Components/Modal";

import {DataTable} from "mantine-datatable";
import {Text, ActionIcon, Group, TextInput} from "@mantine/core";
import {Link} from "react-router-dom";

import {
  IconPlayerPlay,
  IconPlayerStop,
  IconTrash,
  IconExternalLink,
  IconDeviceAnalytics,
  IconListCheck
} from "@tabler/icons-react";
import {useDebouncedValue} from "@mantine/hooks";

const STATUS_MAP = {
  UNCONFIGURED: "unconfigured",
  UNINITIALIZED: "uninitialized",
  INACTIVE: "inactive",
  STOPPED: "stopped",
  STARTING: "starting",
  RUNNING: "running",
  STALLED: "stalled",
};

const STATUS_TEXT = {
  unconfigured: "Not Configured",
  uninitialized: "Uninitialized",
  inactive: "Inactive",
  stopped: "Stopped",
  starting: "Starting",
  running: "Running",
  stalled: "Stalled"
};

const StreamModal = observer(({
  open,
  onOpenChange,
  ConfirmCallback,
  title,
  description,
  loadingText
}) => {
  if(!open) { return null; }

  return (
    <Modal
      title={title}
      description={description}
      loadingText={loadingText}
      open={open}
      onOpenChange={onOpenChange}
      ConfirmCallback={ConfirmCallback}
    />
  );
});

export const SortTable = ({sortStatus, AdditionalCondition}) => {
  return (a, b) => {
    if(AdditionalCondition && typeof AdditionalCondition(a, b) !== "undefined") {
      return AdditionalCondition(a, b);
    }

    a = a[sortStatus.columnAccessor];
    b = b[sortStatus.columnAccessor];

    if(typeof a === "number") {
      a = a || 0;
      b = b || 0;
    } else {
      a = a?.toLowerCase?.() || a || "";
      b = b?.toLowerCase?.() || b || "";
    }

    return (a < b ? -1 : 1) * (sortStatus.direction === "asc" ? 1 : -1);
  };
};

const Streams = observer(() => {
  const [sortStatus, setSortStatus] = useState({columnAccessor: "title", direction: "asc"});
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const ResetModal = () => {
    setModalData({
      showModal: false,
      title: "",
      description: "",
      objectId: "",
      ConfirmCallback: null
    });
  };

  const [modalData, setModalData] = useState({
    showModal: false,
    title: "",
    description: "",
    loadingText: "",
    objectId: "",
    ConfirmCallback: null,
    CloseCallback: null
  });

  const records = Object.values(streamStore.streams || {})
    .filter(record => !debouncedFilter || record.title.toLowerCase().includes(debouncedFilter.toLowerCase()))
    .sort(SortTable({sortStatus}));

  return (
    <>
      <div className="streams">
        <div className="page-header">Streams</div>
        <TextInput
          maw={400}
          placeholder="Filter"
          mb="md"
          value={filter}
          onChange={event => setFilter(event.target.value)}
        />
        <DataTable
          withBorder
          highlightOnHover
          idAccessor="objectId"
          minHeight={!records || records.length === 0 ? 150 : 75}
          fetching={dataStore.tenantId && !streamStore.streams}
          records={records}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          columns={[
            { accessor: "title", title: "Name", sortable: true, render: record => <Text fw={600}>{record.title}</Text> },
            { accessor: "objectId", title: "Object ID", render: record => <Text color="dimmed" fz="xs">{record.objectId}</Text> },
            { accessor: "status", title: "Status", sortable: true, render: record => !record.status ? null : <Text fz="sm">{STATUS_TEXT[record.status]}</Text> },
            {
              accessor: "actions",
              title: "",
              render: record => {
                return (
                  <Group spacing={5} align="top" position="right">
                    {
                      record.status !== STATUS_MAP.UNINITIALIZED ? null :
                        <ActionIcon
                          title="Check Stream"
                          onClick={async () => {
                            const url = await streamStore.client.ContentObjectMetadata({
                              libraryId: await streamStore.client.ContentObjectLibraryId({objectId: record.objectId}),
                              objectId: record.objectId,
                              metadataSubtree: "live_recording_config/url"
                            });

                            setModalData({
                              objectId: record.objectId,
                              showModal: true,
                              title: "Check Stream",
                              description: "Are you sure you want to check the stream?",
                              loadingText: `Please send your stream to ${url}.`,
                              ConfirmCallback: async () => {
                                await streamStore.ConfigureStream({
                                  objectId: record.objectId,
                                  slug: record.slug
                                });
                              },
                              CloseCallback: () => ResetModal()
                            });
                          }}
                        >
                          <IconListCheck />
                        </ActionIcon>
                    }
                    {
                      !record.status || ![STATUS_MAP.INACTIVE, STATUS_MAP.STOPPED].includes(record.status) ? null :
                        <ActionIcon
                          title="Start Stream"
                          onClick={() => {
                            setModalData({
                              objectId: record.objectId,
                              showModal: true,
                              title: "Start Stream",
                              description: "Are you sure you want to start the stream?",
                              ConfirmCallback: async () => {
                                await streamStore.StartStream({slug: record.slug});
                              },
                              CloseCallback: () => ResetModal()
                            });
                          }}
                        >
                          <IconPlayerPlay />
                        </ActionIcon>
                    }
                    {
                      !record.status || ![STATUS_MAP.STARTING, STATUS_MAP.RUNNING, STATUS_MAP.STALLED].includes(record.status) ? null :
                        <>
                          <ActionIcon
                            component={Link}
                            to={`/streams/${record.objectId}`}
                            title="View Stream"
                          >
                            <IconDeviceAnalytics />
                          </ActionIcon>
                          <ActionIcon
                            title="Stop Stream"
                            onClick={() => {
                              setModalData({
                                objectId: record.objectId,
                                showModal: true,
                                title: "Stop Stream",
                                description: "Are you sure you want to stop the stream?",
                                ConfirmCallback: async () => {
                                  await streamStore.OperateLRO({
                                    objectId: record.objectId,
                                    slug: record.slug,
                                    operation: "STOP"
                                  });
                                },
                                CloseCallback: () => ResetModal()
                              });
                            }}
                          >
                            <IconPlayerStop />
                          </ActionIcon>
                        </>
                    }
                    <ActionIcon
                      title="Open in Fabric Browser"
                      onClick={() => editStore.client.SendMessage({
                        options: {
                          operation: "OpenLink",
                          libraryId: record.libraryId,
                          objectId: record.objectId
                        },
                        noResponse: true
                      })}
                    >
                      <IconExternalLink />
                    </ActionIcon>
                    <ActionIcon
                      title="Delete Stream"
                      onClick={() => {
                        setModalData({
                          objectId: record.objectId,
                          showModal: true,
                          title: "Delete Stream",
                          description: "Are you sure you want to delete the stream? This action cannot be undone.",
                          ConfirmCallback: async () => {
                            await editStore.DeleteStream({objectId: record.objectId});
                          },
                          CloseCallback: () => ResetModal()
                        });
                      }}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                );
              }
            }
          ]}
        />
      </div>
      <StreamModal
        title={modalData.title}
        description={modalData.description}
        loadingText={modalData.loadingText}
        open={modalData.showModal}
        onOpenChange={modalData.CloseCallback}
        ConfirmCallback={modalData.ConfirmCallback}
      />
    </>
  );
});

export default Streams;
