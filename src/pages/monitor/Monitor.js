import React from "react";
import {observer} from "mobx-react";
import {dataStore} from "../../stores";
import AspectRatio from "Components/AspectRatio";
import Video from "Components/Video";

const Monitor = observer(() => {
  return (
    <div className="monitor">
      <div className="page-header">Monitor</div>
      {
        Object.keys(dataStore.streams || {}).length > 0 ?
          <div className="monitor__grid-items">
            {
              (Object.keys(dataStore.streams || {}) || [])
                .map((slug) => (
                  <div key={slug} className="monitor__grid-item-container">
                    <div className="monitor__video-wrapper">
                      <AspectRatio>
                        <Video versionHash={dataStore.streams[slug].versionHash} videoMetadata={dataStore.streams[slug]}/>
                      </AspectRatio>
                    </div>
                    <div className="monitor__grid-item-details">
                      <div className="monitor__grid-item-details-content">
                        <div className="monitor__grid-item-title">
                          { dataStore.streams[slug].display_title || dataStore.streams[slug].title }
                        </div>
                        <div className="monitor__grid-item-id">
                          { dataStore.streams[slug].objectId || "" }
                        </div>
                        {
                          dataStore.streams[slug].embedUrl &&
                          <a
                            className="monitor__grid-item-link"
                            href={dataStore.streams[slug].embedUrl}
                            target="_blank"
                          >
                            {dataStore.streams[slug].embedUrl}
                          </a>
                        }
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
