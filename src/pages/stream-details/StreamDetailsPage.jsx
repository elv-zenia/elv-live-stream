import React, {useState} from "react";
import PageHeader from "Components/header/PageHeader";
import {useNavigate, useParams} from "react-router-dom";
import {streamStore, editStore} from "Stores";
import {observer} from "mobx-react";
import {Tabs, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {DETAILS_TABS, STATUS_MAP} from "Data/StreamData";
import classes from "Assets/stylesheets/modules/StreamDetails.module.css";
import {Loader} from "Components/Loader";
import ConfirmModal from "Components/ConfirmModal";

const StreamDetailsPage = observer(() => {
  const navigate = useNavigate();
  const params = useParams();
  let streamSlug, stream;
  const [showModal, {open, close}] = useDisclosure(false);
  const [modalData, setModalData] = useState({});
  const [pageVersion, setPageVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  streamSlug = Object.keys(streamStore.streams || {}).find(slug => (
    streamStore.streams[slug].objectId === params.id
  ));

  if(streamSlug) {
    stream = streamStore.streams[streamSlug];
  }

  if(!stream) {
    return <Loader />;
  }

  const actions = [
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
      disabled: streamStore.streams?.[streamSlug]?.status !== STATUS_MAP.INACTIVE,
      onClick: () => {
        setModalData({
          title: "Delete Stream",
          message: "Are you sure you want to delete the stream? This action cannot be undone.",
          confirmText: "Delete",
          ConfirmCallback: async () => await editStore.DeleteStream({objectId: stream.objectId})
        });
        open();
      }
    },
    {
      label: "Refresh",
      variant: "outline",
      onClick: () => setPageVersion(prev => prev + 1)
    }
  ];

  if([STATUS_MAP.INACTIVE, STATUS_MAP.STOPPED].includes(streamStore.streams?.[streamSlug]?.status)) {
    actions.push({
      label: "Start",
      variant: "outline",
      onClick: () => {
        setModalData({
          title: "Start Stream",
          message: "Are you sure you want to start the stream?",
          ConfirmCallback: async () => {
            await streamStore.StartStream({slug: streamSlug});
            close();
          }
        });
        open();
      }
    });
  }

  if([STATUS_MAP.STARTING, STATUS_MAP.RUNNING, STATUS_MAP.STALLED].includes(streamStore.streams?.[streamSlug]?.status)) {
    actions.push({
      label: "Stop",
      variant: "outline",
      onClick: () => {
        setModalData({
          title: "Stop Stream",
          message: "Are you sure you want to stop the stream?",
          ConfirmCallback: async () => {
            await streamStore.OperateLRO({
              objectId: stream.objectId,
              slug: streamSlug,
              operation: "STOP"
            });
            close();
          }
        });
        open();
      }
    });
  }

  return (
    <div key={`stream-details-${pageVersion}`}>
      <PageHeader
        title={`Edit ${stream.title || stream.objectId}`}
        subtitle={stream.objectId}
        status={streamStore.streams?.[streamSlug]?.status}
        quality={streamStore.streams?.[streamSlug]?.quality}
        actions={actions}
      />
      <Tabs className={classes.root} value={activeTab} onChange={setActiveTab}>
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
                url={stream.originUrl}
              />
            </Tabs.Panel>
          ))
        }
      </Tabs>
      <ConfirmModal
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        show={showModal}
        CloseCallback={close}
        ConfirmCallback={modalData.ConfirmCallback}
      />
    </div>
  );
});

export default StreamDetailsPage;
