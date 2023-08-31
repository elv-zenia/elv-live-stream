import React from "react";
import {observer} from "mobx-react";
import {streamStore} from "../../stores";
import AspectRatio from "Components/AspectRatio";
import Video from "Components/Video";
import {toJS} from "mobx";

const Monitor = observer(() => {
  console.log("streams", toJS(streamStore.streams));
  return (
    <div className="monitor">
      <div className="page-header">Streams</div>
      <div className="monitor__grid-items">
        {
          (Object.keys(streamStore.streams) || [])
            .map((slug) => (
              <div key={slug} className="monitor__grid-item-container">
                <div className="monitor__video-wrapper">
                  <AspectRatio>
                    <Video versionHash={streamStore.streams[slug].versionHash} videoMetadata={streamStore.streams[slug]} />
                  </AspectRatio>
                </div>
                <div className="monitor__grid-item-details">
                  {streamStore.streams[slug].display_title || streamStore.streams[slug].title}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
});

export default Monitor;
