import React from "react";
import {observer} from "mobx-react";
import {rootStore, streamStore} from "Stores";
import {useParams, Link} from "react-router-dom";
import AppFrame from "Components/AppFrame";
import {ActionIcon} from "@mantine/core";

import {IconArrowBackUp} from "@tabler/icons-react";
import {Loader} from "Components/Loader";

const StreamPreview = observer(() => {
  const {id} = useParams();
  const streamSlug = Object.keys(streamStore.streams || {}).find(slug => (
    streamStore.streams[slug].objectId === id
  ));
  const streamObject = streamStore.streams?.[streamSlug];

  if(!streamObject) {
    return (
      <div
        style={{
          display: "flex",
          height: "500px",
          width: "100%",
          alignItems: "center"
        }}
        className="stream-preview"
      >
        <Loader />
      </div>
    );
  }

  const libraryId = streamStore.streams[streamSlug].libraryId;
  const queryParams = {
    contentSpaceId: rootStore.contentSpaceId,
    libraryId,
    objectId: id,
    action: "display",
    playerProfile: "live"
  };

  return (
    <div className="stream-preview">
      <div className="page-header">
        <ActionIcon component={Link} to="/streams" title="Back to Streams">
          <IconArrowBackUp />
        </ActionIcon>
        Preview { streamObject.display_title || streamObject.title || streamObject.objectId }
      </div>
      <AppFrame
        className="display-frame"
        appUrl={EluvioConfiguration.displayAppUrl}
        queryParams={queryParams}
        onComplete={() => this.setState({completed: true})}
        onCancel={() => this.setState({completed: true})}
        Reload={() => this.setState({pageVersion: this.state.pageVersion + 1})}
      />
    </div>
  );
});

export default StreamPreview;
