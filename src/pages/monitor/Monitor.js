import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {streamStore} from "Stores";
import AspectRatio from "Components/AspectRatio";
import Video from "Components/Video";
import ImageIcon from "Components/ImageIcon";
import {ActionIcon} from "@mantine/core";

import PlayIcon from "Assets/icons/play circle.svg";

import {IconX} from "@tabler/icons-react";

const STATUS_TEXT = {
  unconfigured: "Not Configured",
  uninitialized: "Uninitialized",
  inactive: "Inactive",
  stopped: "Stopped",
  starting: "Starting",
  running: "Running",
  stalled: "Stalled"
};

const VideoContainer = observer(({slug, autoplay=false, index}) => {
  const [play, setPlay] = useState(autoplay);
  const [frameKey, setFrameKey] = useState(0);
  const [frameSegmentUrl, setFrameSegmentUrl] = useState(undefined);

  useEffect(() => {
    if(play) { return; }

    // Frame loading already initialized - no delay needed
    if(frameKey > 0 || streamStore.streamFrameUrls[slug]) {
      streamStore.StreamFrameURL(slug)
        .then(setFrameSegmentUrl);
      return;
    }

    // Stagger frame loads
    const delay = Math.min(200 + 500 * index, 10000);
    const frameTimeout = setTimeout(async () => {
      console.time(`load-${slug}`);
      setFrameSegmentUrl(await streamStore.StreamFrameURL(slug));
      console.timeEnd(`load-${slug}`);
    }, delay);

    return () => clearTimeout(frameTimeout);
  }, [play, frameKey]);

  useEffect(() => {
    if(!frameSegmentUrl) { return; }

    const delay = 60000 + (60000 * Math.random());

    const updateTimeout = setTimeout(() => setFrameKey(frameKey + 1), delay);

    return () => clearTimeout(updateTimeout);
  }, [frameKey, frameSegmentUrl]);

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
              {
                !frameSegmentUrl ? null :
                  <video src={frameSegmentUrl} className="monitor__video-frame" />
              }
            </button> :
            <>
              <Video
                objectId={streamStore.streams[slug].objectId}
                playerOptions={{
                  capLevelToPlayerSize: autoplay,
                  autoplay: true
                }}
              />
              <ActionIcon
                className="monitor__video-x"
                title="Stop Playback"
                color="gray.1"
                variant="transparent"
                onClick={() => setPlay(false)}
              >
                <IconX />
              </ActionIcon>
            </>
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
                .map((slug, index) => {
                  const status = streamStore.streams?.[slug]?.status;
                  return (
                    <div key={slug} className="monitor__grid-item-container">
                      <VideoContainer
                        index={index}
                        slug={slug}
                        autoplay={autoplay}
                        key={`video-${slug}-${autoplay}`}
                      />
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
