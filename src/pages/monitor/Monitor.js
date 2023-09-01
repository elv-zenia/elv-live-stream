import React from "react";
import {observer} from "mobx-react";
import {streamStore} from "../../stores";
import AspectRatio from "Components/AspectRatio";
import Video from "Components/Video";

const Monitor = observer(() => {
  return (
    <div className="monitor">
      <div className="page-header">Monitor</div>
      {
        Object.keys(streamStore.streams || {}).length > 0 ?
          <div className="monitor__grid-items">
            {
              (Object.keys(streamStore.streams || {}) || [])
                .map((slug) => (
                  <div key={slug} className="monitor__grid-item-container">
                    <div className="monitor__video-wrapper">
                      <AspectRatio>
                        <Video versionHash={streamStore.streams[slug].versionHash} videoMetadata={streamStore.streams[slug]}/>
                      </AspectRatio>
                    </div>
                    <div className="monitor__grid-item-details">
                      <div className="monitor__grid-item-details-content">
                        <div className="monitor__grid-item-title">
                          {streamStore.streams[slug].display_title || streamStore.streams[slug].title}
                        </div>
                        <div className="monitor__grid-item-id">
                          {streamStore.streams[slug].objectId || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div> : "No streams found."
      }
    </div>
  );
});

export default Monitor;
