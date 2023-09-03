import React, {useState} from "react";
import {observer} from "mobx-react";
import {dataStore} from "../../stores";
import Table from "Components/Table";
import TrashIcon from "Assets/icons/trash.svg";
import ExternalLinkIcon from "Assets/icons/external-link.svg";
import Modal from "Components/Modal";

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

  return (
    <div className="streams">
      <div className="page-header">Streams</div>
      {
        Object.keys(dataStore.streams || {}).length > 0 ?
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
              rows={(Object.keys(dataStore.streams || {})).map(slug => (
                {
                  id: dataStore.streams[slug].objectId,
                  cells: [
                    {
                      label: dataStore.streams[slug].display_title || dataStore.streams[slug].title,
                      id: `${dataStore.streams[slug].objectId}-title`
                    },
                    {
                      label: dataStore.streams[slug].objectId || "",
                      id: `${dataStore.streams[slug].objectId}-id`
                    },
                    {
                      label: StatusText(dataStore.streams[slug]),
                      id: `${dataStore.streams[slug].objectId}-status`
                    },
                    {
                      type: "button",
                      id: `${dataStore.streams[slug].objectId}-view-button`,
                      label: "View",
                      onClick: () => {
                      }
                    },
                    {
                      type: "button",
                      id: `${dataStore.streams[slug].objectId}-stream-action`,
                      label: "Restart",
                      onClick: () => {
                      }
                    },
                    {
                      type: "iconButtonGroup",
                      id: `${dataStore.streams[slug].objectId}-actions`,
                      items: [
                        {
                          id: `${dataStore.streams[slug].objectId}-external-link-action`,
                          icon: ExternalLinkIcon,
                          label: "Open in Fabric Browser",
                          onClick: () => dataStore.client.SendMessage({
                            options: {
                              operation: "OpenLink",
                              libraryId: dataStore.streams[slug].libraryId,
                              objectId: dataStore.streams[slug].objectId
                            },
                            noResponse: true
                          })
                        },
                        {
                          id: `${dataStore.streams[slug].objectId}-delete-action`,
                          icon: TrashIcon,
                          label: "Delete Stream",
                          onClick: () => {
                            setModalData({
                              objectId: dataStore.streams[slug].objectId,
                              showModal: true,
                              title: "Delete Stream",
                              description: "Are you sure you want to delete the stream? This action cannot be undone.",
                              ConfirmCallback: () => {
                                dataStore.DeleteStream({objectId: dataStore.streams[slug].objectId});
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
