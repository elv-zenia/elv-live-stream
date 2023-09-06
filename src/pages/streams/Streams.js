import React, {useState} from "react";
import {observer} from "mobx-react";
import {editStore, streamStore} from "Stores";
import Table from "Components/Table";
import TrashIcon from "Assets/icons/trash.svg";
import ExternalLinkIcon from "Assets/icons/external-link.svg";
import Modal from "Components/Modal";

const STATUS_KEYS = {
  created: "Initializing",
  checking: "Checking",
  ready: "Ready",
  starting: "Starting",
  stalled: "Stalled",
  checkFailed: "Stream Check Failed",
  inactive: "Inactive"
};

const StreamModal = observer(({
  open,
  onOpenChange,
  ConfirmCallback,
  title,
  description
}) => {
  return (
    <Modal
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      ConfirmCallback={ConfirmCallback}
    />
  );
});

const Streams = observer(() => {
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
    objectId: "",
    ConfirmCallback: null,
    CloseCallback: null
  });

  return (
    <div className="streams">
      <div className="page-header">Streams</div>
      {
        Object.keys(streamStore.streams || {}).length > 0 ?
          <div className="streams__list-items">
            <Table
              headers={[
                {label: "Name", id: "header-name"},
                {label: "Object ID", id: "header-id"},
                {label: "Status", id: "header-status"},
                {label: "", id: "header-stream-actions"},
                {label: "", id: "header-actions"}
              ]}
              rows={(Object.keys(streamStore.streams || {})).map(slug => (
                {
                  id: streamStore.streams[slug].objectId,
                  cells: [
                    {
                      label: streamStore.streams[slug].display_title || streamStore.streams[slug].title,
                      id: `${streamStore.streams[slug].objectId}-name`
                    },
                    {
                      label: streamStore.streams[slug].objectId || "",
                      id: `${streamStore.streams[slug].objectId}-id`
                    },
                    {
                      label: STATUS_KEYS[streamStore.streams[slug].status] || "--",
                      id: `${streamStore.streams[slug].objectId}-status`
                    },
                    {
                      type: "buttonGroup",
                      items: [
                        {
                          id: `${streamStore.streams[slug].objectId}-view-button`,
                          label: "View",
                          onClick: () => {
                          }
                        },
                        {
                          id: `${streamStore.streams[slug].objectId}-start-button`,
                          label: "Start",
                          hidden: streamStore.streams[slug].status !== "ready",
                          onClick: () => {
                            setModalData({
                              objectId: streamStore.streams[slug].objectId,
                              showModal: true,
                              title: "Start Stream",
                              description: "Are you sure you want to start the stream?",
                              ConfirmCallback: async () => {
                                await streamStore.StartStream({slug});
                              },
                              CloseCallback: () => ResetModal()
                            });
                          }
                        },
                        {
                          id: `${streamStore.streams[slug].objectId}-stop-button`,
                          label: "Stop",
                          hidden: !["starting", "running"].includes(streamStore.streams[slug].status),
                          onClick: () => {
                            setModalData({
                              objectId: streamStore.streams[slug].objectId,
                              showModal: true,
                              title: "Stop Stream",
                              description: "Are you sure you want to stop the stream?",
                              ConfirmCallback: async () => {
                                await streamStore.OperateLRO({
                                  objectId: streamStore.streams[slug].objectId,
                                  slug,
                                  operation: "STOP"
                                });
                              },
                              CloseCallback: () => ResetModal()
                            });
                          }
                        },
                        {
                          id: `${streamStore.streams[slug].objectId}-restart-button`,
                          label: "Restart",
                          hidden: streamStore.streams[slug].status !== "checkFailed",
                          onClick: () => {
                            setModalData({
                              objectId: streamStore.streams[slug].objectId,
                              showModal: true,
                              title: "Restart Stream",
                              description: "Are you sure you want to restart the stream?",
                              ConfirmCallback: async () => {
                                await streamStore.OperateLRO({
                                  objectId: streamStore.streams[slug].objectId,
                                  slug,
                                  operation: "RESET"
                                });
                              },
                              CloseCallback: () => ResetModal()
                            });
                          }
                        }
                      ]
                    },
                    {
                      type: "iconButtonGroup",
                      id: `${streamStore.streams[slug].objectId}-actions`,
                      items: [
                        {
                          id: `${streamStore.streams[slug].objectId}-external-link-action`,
                          icon: ExternalLinkIcon,
                          label: "Open in Fabric Browser",
                          onClick: () => editStore.client.SendMessage({
                            options: {
                              operation: "OpenLink",
                              libraryId: streamStore.streams[slug].libraryId,
                              objectId: streamStore.streams[slug].objectId
                            },
                            noResponse: true
                          })
                        },
                        {
                          id: `${streamStore.streams[slug].objectId}-delete-action`,
                          icon: TrashIcon,
                          label: "Delete Stream",
                          hidden: streamStore.streams[slug].status === "starting",
                          onClick: () => {
                            setModalData({
                              objectId: streamStore.streams[slug].objectId,
                              showModal: true,
                              title: "Delete Stream",
                              description: "Are you sure you want to delete the stream? This action cannot be undone.",
                              ConfirmCallback: async () => {
                                await editStore.DeleteStream({objectId: streamStore.streams[slug].objectId});
                              },
                              CloseCallback: () => ResetModal()
                            });
                          }
                        }
                      ],
                    }
                  ]
                }
              ))}
            />
          </div> : "No streams found."
      }
      <StreamModal
        title={modalData.title}
        description={modalData.description}
        open={modalData.showModal}
        onOpenChange={modalData.CloseCallback}
        ConfirmCallback={modalData.ConfirmCallback}
      />
    </div>
  );
});

export default Streams;
