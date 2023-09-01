import React, {useState} from "react";
import {observer} from "mobx-react";
import {streamStore} from "../../stores";
import Table from "Components/Table";
import TrashIcon from "Assets/icons/trash.svg";
import ExternalLinkIcon from "Assets/icons/external-link.svg";
import Modal from "Components/Modal";
import {toJS} from "mobx";

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
  const [modalData, setModalData] = useState({
    showModal: false,
    title: "",
    description: "",
    objectId: "",
    ConfirmCallback: null
  });

  const StatusText = () => {
    // Checking
    // Ready
    // Starting | Running
    // Stalled
    // Stream Check Failed
    return "Stream Check Failed";
  };

  const ResetModal = () => {
    setModalData({
      showModal: false,
      title: "",
      description: "",
      objectId: "",
      ConfirmCallback: null
    });
  };

  if(!streamStore.loaded) { return null; }
  console.log("", toJS(streamStore.streams));

  return (
    <div className="streams">
      <div className="page-header">Streams</div>
      {
        Object.keys(streamStore.streams || {}).length > 0 ?
          <div className="streams__list-items">
            <Table
              headers={[
                {label: "Title", id: "header-title"},
                {label: "Object ID", id: "header-id"},
                {label: "Status", id: "header-status"},
                {label: "", id: "header-view"},
                {label: "", id: "header-restart"},
                {label: "", id: "header-actions"}
              ]}
              rows={(Object.keys(streamStore.streams || {})).map(slug => (
                {
                  id: streamStore.streams[slug].objectId,
                  cells: [
                    {
                      label: streamStore.streams[slug].display_title || streamStore.streams[slug].title,
                      id: `${streamStore.streams[slug].objectId}-title`
                    },
                    {
                      label: streamStore.streams[slug].objectId || "",
                      id: `${streamStore.streams[slug].objectId}-id`
                    },
                    {
                      label: StatusText(streamStore.streams[slug]),
                      id: `${streamStore.streams[slug].objectId}-status`
                    },
                    {
                      type: "button",
                      id: `${streamStore.streams[slug].objectId}-view-button`,
                      label: "View",
                      onClick: () => {
                      }
                    },
                    {
                      type: "button",
                      id: `${streamStore.streams[slug].objectId}-stream-action`,
                      label: "Restart",
                      onClick: () => {
                      }
                    },
                    {
                      type: "iconButtonGroup",
                      id: `${streamStore.streams[slug].objectId}-actions`,
                      items: [
                        {
                          id: `${streamStore.streams[slug].objectId}-external-link-action`,
                          icon: ExternalLinkIcon,
                          label: "Open in Fabric Browser",
                          onClick: () => streamStore.client.SendMessage({
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
                          onClick: () => {
                            setModalData({
                              objectId: streamStore.streams[slug].objectId,
                              showModal: true,
                              title: "Delete Stream",
                              description: "Are you sure you want to delete the stream? This action cannot be undone.",
                              ConfirmCallback: () => {
                                streamStore.DeleteStream({objectId: streamStore.streams[slug].objectId});
                                ResetModal();
                              }
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
        onOpenChange={() => setShowDeleteModal(false)}
        ConfirmCallback={modalData.ConfirmCallback}
      />
    </div>
  );
});

export default Streams;
