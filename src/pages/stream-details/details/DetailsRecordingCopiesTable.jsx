import React, {useState} from "react";
import {observer} from "mobx-react";
import {DataTable} from "mantine-datatable";
import {ActionIcon, Box, Group, Text} from "@mantine/core";
import {DateFormat, SortTable} from "Stores/helpers/Misc";
import {editStore} from "Stores";
import {IconExternalLink, IconTrash} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import ConfirmModal from "Components/ConfirmModal";

const DetailsRecordingCopiesTable = observer(({liveRecordingCopies}) => {
  const [showDeleteModal, {open, close}] = useDisclosure(false);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "title",
    direction: "asc"
  });

  const records = Object.values(liveRecordingCopies || {})
    .sort(SortTable({sortStatus}));

  return (
    <Box mb="24px" maw="85%">
      <div className="form__section-header">Live Recording Copies</div>
      <DataTable
        idAccessor="_id"
        noRecordsText="No live recording copies found"
        minHeight={records ? 150 : 75}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          {
            accessor: "title",
            title: "Title",
            sortable: true,
            render: record => (
              <div className="table__multi-line">
                <Text>{record.title}</Text>
                <Text c="dimmed" fz="xs">{record._id}</Text>
              </div>
            )
          },
          {
            accessor: "startTime",
            title: "Start Time",
            render: record => (
              <Text>
                {
                  record.startTime ?
                    DateFormat({time: record.startTime, format: "sec"}) : ""
                }
              </Text>
            )
          },
          {
            accessor: "endTime",
            title: "End Time",
            render: record => (
              <Text>
                {
                  record.endTime ?
                    DateFormat({time: record.endTime, format: "sec"}) : ""
                }
              </Text>
            )
          },
          {
            accessor: "create_time",
            title: "Date Added",
            sortable: true,
            render: record => (
              <Text>
                {
                  record.create_time ?
                    DateFormat({time: record.create_time, format: "ms"}) : ""
                }
              </Text>
            )
          },
          {
            accessor: "actions",
            title: "",
            render: record => (
              <Group>
                <ActionIcon
                  title="Open in Fabric Browser"
                  variant="subtle"
                  color="gray.6"
                  onClick={() => editStore.client.SendMessage({
                    options: {
                      operation: "OpenLink",
                      objectId: record._id
                    },
                    noResponse: true
                  })}
                >
                  <IconExternalLink />
                </ActionIcon>
                <ActionIcon
                  title="Delete Live Recording Copy"
                  variant="subtle"
                  color="gray.6"
                  onClick={open}
                >
                  <IconTrash />
                </ActionIcon>
              </Group>
            )
          }
        ]}
        records={records}
      />
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Live Recording Copy"
        confirmText="Delete"
        message="Are you sure you want to delete the live recording copy? This action cannot be undone."
        ConfirmCallback={() => {}}
        CloseCallback={close}
      />
    </Box>
  );
});

export default DetailsRecordingCopiesTable;
