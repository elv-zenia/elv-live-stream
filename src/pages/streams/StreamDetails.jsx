import React, {useState} from "react";
import PageHeader from "Components/header/PageHeader";
import {useNavigate, useParams} from "react-router-dom";
import {streamStore, editStore} from "Stores";
import {observer} from "mobx-react";
import {Flex, Loader, Modal, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

// TODO: Create ConfirmModal component and consolidate this with Modal
const StreamDeleteModal = ({show, close, Callback}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  return (
    <Modal
      opened={show}
      onClose={close}
      title="Delete Stream"
      padding="32px"
      radius="6px"
      size="lg"
      centered
    >
      <Text>Are you sure you want to delete the stream? This action cannot be undone.</Text>
      {
        !error ? null :
          <div className="modal__error">
            Error: { error }
          </div>
      }
      <Flex direction="row" align="center" className="modal__actions">
        <button type="button" className="button__secondary" onClick={close}>
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          className="button__primary"
          onClick={async () => {
            try {
              setError(undefined);
              setLoading(true);
              await Callback();
            } catch(error) {
              console.error(error);
              setError(error?.message || error.kind || error.toString());
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader loader="inline" className="modal__loader"/> : "Delete"}
        </button>
      </Flex>
    </Modal>
  );
};

const StreamDetails = observer(() => {
  const navigate = useNavigate();
  const params = useParams();
  let stream;
  const [showModal, {open, close}] = useDisclosure(false);

  if(params?.id && streamStore.streams) {
    const streamSlug = Object.keys(streamStore.streams || {}).find(slug => (
      streamStore.streams[slug].objectId === params.id
    ));
    stream = streamStore.streams[streamSlug];
    console.log("stream", stream);
  }

  if(!stream) {
    return <Loader/>;
  }

  return (
    <>
      <PageHeader
        title="Edit Livestream"
        status={stream?.status}
        actions={[
          {
            label: "Back",
            variant: "filled",
            uppercase: true,
            onClick: () => navigate(-1)
          },
          {
            label: "Delete",
            variant: "outline",
            uppercase: true,
            onClick: open
          }
        ]}
      />
      <StreamDeleteModal
        show={showModal}
        close={close}
        Callback={async () => await editStore.DeleteStream({objectId: stream.objectId})}
      />
    </>
  );
});

export default StreamDetails;
