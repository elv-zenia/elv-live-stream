import React, {useState} from "react";
import {observer} from "mobx-react";
import {streamStore} from "Stores";
import AspectRatio from "Components/AspectRatio";
import Video from "Components/Video";
import ImageIcon from "Components/ImageIcon";

import PlayIcon from "Assets/icons/play circle.svg";

const STATUS_TEXT = {
  unconfigured: "Not Configured",
  uninitialized: "Uninitialized",
  inactive: "Inactive",
  stopped: "Stopped",
  starting: "Starting",
  running: "Running",
  stalled: "Stalled"
};

const VideoContainer = observer(({slug, autoplay=false}) => {
  const [play, setPlay] = useState(autoplay);

  return (
    <div className="monitor__video-wrapper">
      <AspectRatio>
        {
          !play ?
            <button
              role="button"
              tabIndex={1}
              onClick={() => setPlay(true)}
              className="monitor__video-placeholder"
            >
              <ImageIcon icon={PlayIcon} label="Play" className="monitor__video-placeholder-icon" />
            </button> :
            <Video
              objectId={streamStore.streams[slug].objectId}
              playerOptions={{
                capLevelToPlayerSize: autoplay,
                autoplay: true
              }}
            />
        }
      </AspectRatio>
    </div>
  );
});

const Monitor = observer(() => {
  const [autoplay, setAutoplay] = useState(false);
  return (
    <div className="monitor">
      <div className="page-header monitor__page-header">
        <div>
          Monitor
        </div>
        <button className="button__secondary" onClick={() => setAutoplay(!autoplay)}>
          { autoplay ? "Stop All" : "Play All"}
        </button>
      </div>
      {
        Object.keys(streamStore.streams || {}).length > 0 ?
          <div className="monitor__grid-items">
            {
              (Object.keys(streamStore.streams || {}).sort((a, b) => a.localeCompare(b)) || [])
                .map((slug) => {
                  const status = streamStore.streams?.[slug]?.status;
                  return (
                    <div key={slug} className="monitor__grid-item-container">
                      <VideoContainer slug={slug} autoplay={autoplay} key={`video-${slug}-${autoplay}`}/>
                      <div className="monitor__grid-item-details">
                        <div className="monitor__grid-item-details-content">
                          <div className="monitor__grid-item-details-top">
                            <div className="monitor__grid-item-title">
                              {streamStore.streams[slug].display_title || streamStore.streams[slug].title}
                            </div>
                            <div className="monitor__grid-item-id">
                              {streamStore.streams[slug].objectId || ""}
                            </div>
                          </div>
                          <div className="monitor__grid-item-details-bottom">
                            {
                              !status ? <div /> :
                                <div className={`monitor__grid-item-status ${status === "running" ? "monitor__grid-item-status--green" : ""}`}>
                                  {STATUS_TEXT[status]}
                                </div>
                            }
                            {
                              streamStore.streams[slug].embedUrl &&
                              <a
                                className="monitor__grid-item-link"
                                href={streamStore.streams[slug].embedUrl}
                                target="_blank"
                              >
                                <div className="monitor__grid-item-link-text">
                                  Embed URL
                                </div>
                              </a>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div> : "No streams found."
      }
    </div>
  );
});

export default Monitor;
