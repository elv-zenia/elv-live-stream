export const ParseLiveConfigData = ({
  inputFormData,
  outputFormData,
  url,
  referenceUrl,
  encryption,
  avProperties,
  retention
}) => {
  const {audioStreamIndex} = inputFormData;
  const {audioChannelLayout, audioBitrate} = outputFormData;

  const AV_STREAM = {
    DEFAULT: "default",
    CUSTOM: "specific"
  };

  const ENCRYPTION_TYPES = {
    DRM: "drm",
    CLEAR: "clear"
  };

  const config = {
    drm: ENCRYPTION_TYPES[encryption],
    input: {
      audio: {
        stream: AV_STREAM[avProperties],
        stream_index: parseInt(audioStreamIndex)
      }
    },
    output: {
      audio: {
        bitrate: parseInt(audioBitrate),
        channel_layout: parseInt(audioChannelLayout),
        quality: AV_STREAM[avProperties]
      }
    },
    part_ttl: parseInt(retention),
    url,
    reference_url: referenceUrl
  };

  return config;
};

export const Slugify = (string) => {
  return (string || "")
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9\-]/g,"")
    .replace(/-+/g, "-");
};

export const VideoBitrateReadable = (bitrate) => {
  if(!bitrate) { return ""; }
  const denominator = 1000000;
  let value = (bitrate / denominator).toFixed(1);

  return `${value}Mbps`;
};

export const STATUS_MAP = {
  UNCONFIGURED: "unconfigured",
  UNINITIALIZED: "uninitialized",
  INACTIVE: "inactive",
  STOPPED: "stopped",
  STARTING: "starting",
  RUNNING: "running",
  STALLED: "stalled",
};

export const StreamIsActive = (state) => {
  let active = false;

  if([STATUS_MAP.STARTING, STATUS_MAP.RUNNING, STATUS_MAP.STALLED, STATUS_MAP.STOPPED].includes(state)) {
    active = true;
  }

  return active;
};
