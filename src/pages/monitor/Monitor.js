import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {streamStore} from "Stores";
import AspectRatio from "Components/AspectRatio";
import Video from "Components/Video";
import ImageIcon from "Components/ImageIcon";
import {ActionIcon, TextInput} from "@mantine/core";

import PlayIcon from "Assets/icons/play circle.svg";

import {IconX} from "@tabler/icons-react";
import {Loader} from "Components/Loader";
import {SortTable} from "Pages/streams/Streams";
import {useDebouncedValue} from "@mantine/hooks";

const STATUS_TEXT = {
  unconfigured: "Not Configured",
  uninitialized: "Uninitialized",
  inactive: "Inactive",
  stopped: "Stopped",
  starting: "Starting",
  running: "Running",
  stalled: "Stalled"
};

const VideoContainer = observer(({slug, index}) => {
  const [play, setPlay] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [frameSegmentUrl, setFrameSegmentUrl] = useState(streamStore.streamFrameUrls[slug]?.url);
  const status = streamStore.streams?.[slug]?.status;

  useEffect(() => {
    if(!streamStore.showMonitorPreviews || play || status !== "running") {
      return;
    }

    const existingFrame = streamStore.streamFrameUrls[slug];
    // Frame loading already initialized - no delay needed
    if(frameKey > 0 || (existingFrame && Date.now() - existingFrame.timestamp < 60000)) {
      setFrameSegmentUrl(existingFrame.url);
      console.log("SKIP DELAY", slug);
      return;
    }

    // Stagger frame loads
    const delay = Math.min(200 + 500 * index, 10000);
    const frameTimeout = setTimeout(async () => {
      setFrameSegmentUrl(await streamStore.StreamFrameURL(slug));
    }, delay);

    return () => clearTimeout(frameTimeout);
  }, [play, frameKey, status, streamStore.showMonitorPreviews]);

  // Reload frame every minute after initial frame load
  useEffect(() => {
    if(!frameSegmentUrl) { return; }

    const delay = 60000 + Math.min(200 + 500 * index, 10000);

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
                !streamStore.showMonitorPreviews || !frameSegmentUrl ? null :
                  <video src={frameSegmentUrl} className="monitor__video-frame" />
              }
            </button> :
            <>
              <Video
                objectId={streamStore.streams[slug].objectId}
                playerOptions={{
                  capLevelToPlayerSize: false,
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
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const streams = !streamStore.streams ? undefined :
    Object.values(streamStore.streams || {})
      .filter(record => !debouncedFilter || record.title.toLowerCase().includes(debouncedFilter.toLowerCase()))
      .sort(SortTable({sortStatus: {columnAccessor: "title", direction: "asc"}}));

  return (
    <div className="monitor">
      <div className="page-header monitor__page-header">
        <div>
          Monitor
        </div>
        <button className="button__secondary" onClick={() => streamStore.ToggleMonitorPreviews()}>
          { streamStore.showMonitorPreviews ? "Hide Previews" : "Show Previews"}
        </button>
      </div>
      <TextInput
        maw={400}
        placeholder="Filter"
        mb="md"
        value={filter}
        onChange={event => setFilter(event.target.value)}
      />
      {
        !streams ?
          <div style={{maxWidth: "200px"}}>
            <Loader />
          </div> :
          streams.length === 0 ? (debouncedFilter ? "No Matching Streams" : "No Streams Found") :
            <div className="monitor__grid-items">
              {
                streams
                  .map((stream, index) => {
                    return (
                      <div key={stream.slug} className="monitor__grid-item-container">
                        <VideoContainer index={index} slug={stream.slug} />
                        <div className="monitor__grid-item-details">
                          <div className="monitor__grid-item-details-content">
                            <div className="monitor__grid-item-details-top">
                              <div className="monitor__grid-item-title">
                                { stream.title }
                              </div>
                              <div className="monitor__grid-item-id">
                                { stream.objectId || "" }
                              </div>
                            </div>
                            <div className="monitor__grid-item-details-bottom">
                              {
                                !stream.status ? <div /> :
                                  <div className={`monitor__grid-item-status ${stream.status === "running" ? "monitor__grid-item-status--green" : ""}`}>
                                    {STATUS_TEXT[stream.status]}
                                  </div>
                              }
                              {
                                stream.embedUrl &&
                                <a
                                  className="monitor__grid-item-link"
                                  href={stream.embedUrl}
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
            </div>
      }
    </div>
  );
});

export default Monitor;
