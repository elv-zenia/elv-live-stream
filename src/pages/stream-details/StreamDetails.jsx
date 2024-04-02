import React, {useState} from "react";
import PageHeader from "Components/header/PageHeader";
import {useNavigate, useParams} from "react-router-dom";
import {streamStore, editStore} from "Stores";
import {observer} from "mobx-react";
import {Flex, Modal, Tabs, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {DETAILS_TABS} from "Data/StreamData";
import classes from "Assets/stylesheets/modules/StreamDetails.module.css";
import {Loader} from "Components/Loader";

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
  let streamSlug, stream;
  const [showModal, {open, close}] = useDisclosure(false);

  streamSlug = Object.keys(streamStore.streams || {}).find(slug => (
    streamStore.streams[slug].objectId === params.id
  ));

  if(streamSlug) {
    stream = streamStore.streams[streamSlug];
  }

  if(!stream) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader
        title={`Edit ${stream.title || stream.objectId}`}
        status={streamStore.streams?.[streamSlug]?.status}
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
      <Tabs className={classes.root} defaultValue="details">
        <Tabs.List className={classes.list}>
          {
            DETAILS_TABS.map(tab => (
              <Tabs.Tab value={tab.value} key={`details-tabs-${tab.value}`} className={classes.tab}>
                <Text fw="400" size="md">{tab.label}</Text>
              </Tabs.Tab>
            ))
          }
        </Tabs.List>
        {
          DETAILS_TABS.map(tab => (
            <Tabs.Panel value={tab.value} key={`details-panel-${tab.value}`}>
              <tab.Component
                status={stream.status}
                slug={stream.slug}
                currentDrm={stream.drm}
                simpleWatermark={stream.simpleWatermark}
                imageWatermark={stream.imageWatermark}
                title={stream.title}
                embedUrl={stream.embedUrl}
              />
            </Tabs.Panel>
          ))
        }
      </Tabs>
      <StreamDeleteModal
        show={showModal}
        close={close}
        Callback={async () => await editStore.DeleteStream({objectId: stream.objectId})}
      />
    </>
  );
});

export default StreamDetails;
