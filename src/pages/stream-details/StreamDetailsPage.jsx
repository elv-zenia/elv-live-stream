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

  return (
    <div key={`stream-details-${pageVersion}`}>
      <PageHeader
        title={`Edit ${stream.title || stream.objectId}`}
        subtitle={stream.objectId}
        status={streamStore.streams?.[streamSlug]?.status}
        quality={streamStore.streams?.[streamSlug]?.quality}
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
            disabled: streamStore.streams?.[streamSlug]?.status !== STATUS_MAP.INACTIVE,
            onClick: open
          },
          {
            label: "Refresh",
            variant: "outline",
            onClick: () => setPageVersion(prev => prev + 1)
          }
        ]}
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
        title="Delete Stream"
        message="Are you sure you want to delete the stream? This action cannot be undone."
        confirmText="Delete"
        show={showModal}
        CloseCallback={close}
        ConfirmCallback={async () => await editStore.DeleteStream({objectId: stream.objectId})}
      />
    </div>
  );
});

export default StreamDetailsPage;
