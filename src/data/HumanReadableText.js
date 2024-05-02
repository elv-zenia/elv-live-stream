export const STATUS_TEXT = {
  unconfigured: "Not Configured",
  uninitialized: "Uninitialized",
  initialized: "Initialized",
  inactive: "Inactive",
  stopped: "Stopped",
  starting: "Starting",
  running: "Running",
  stalled: "Stalled",
  terminating: "Terminating"
};

export const FORMAT_TEXT = {
  udp: "MPEGTS",
  srt: "SRT",
  "srt-caller": "SRT Caller",
  rtmp: "RTMP"
};

export const CODEC_TEXT = {
  h264: "H.264",
  h265: "H.265",
  mpeg2video: "MPEG-2"
};

export const RECORDING_STATUS_TEXT = {
  NOT_AVAILABLE: "Not Available",
  PARTIALLY_AVAILABLE: "Partially Available",
  AVAILABLE: "Available"
};

export const QUALITY_TEXT = {
  "good": "Good",
  "severe": "Severe",
  "degraded": "Degraded"
};

export const AudioCodec = (value) => {
  if(value === "aac") {
    return "AAC";
  } else if(value === "mp3") {
    return "MP3";
  } else if(value === "mp2") {
    return "MP2";
  } else if(value?.includes("mp4a")) {
    return "Mp4a";
  } else {
    return "--";
  }
};
