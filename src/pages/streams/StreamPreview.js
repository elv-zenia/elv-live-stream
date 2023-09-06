import React from "react";
import {observer} from "mobx-react";
import {streamStore} from "Stores";
import {useParams, NavLink} from "react-router-dom";

const StreamPreview = observer(() => {
  const {id} = useParams();
  const streamSlug = Object.keys(streamStore.streams).find(slug => (
    streamStore.streams[slug].objectId === id
  ));
  const streamObject = streamStore.streams[streamSlug];
  console.log("streamObject", streamObject);

  return (
    <div className="stream-preview">
      <div className="page-header">
        Preview { streamObject.display_title || streamObject.title || streamObject.objectId }
      </div>
      <div className="page-header__actions">
        <NavLink to="/streams" className="nav-button-link">Back to Streams</NavLink>
      </div>
    </div>
  );
});

export default StreamPreview;
