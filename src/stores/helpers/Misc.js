import {AV_STREAM, STATUS_MAP} from "Data/StreamData";

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

  const config = {
    drm: encryption.includes("drm") ? "drm" : "clear",
    drm_type: encryption,
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

export const StreamIsActive = (state) => {
  let active = false;

  if([STATUS_MAP.STARTING, STATUS_MAP.RUNNING, STATUS_MAP.STALLED, STATUS_MAP.STOPPED].includes(state)) {
    active = true;
  }

  return active;
};

export const StatusIndicator = (status) => {
  if(status === STATUS_MAP.STOPPED) {
    return "elv-orange.6";
  } else if(status === STATUS_MAP.RUNNING) {
    return "elv-green.5";
  } else if([STATUS_MAP.INACTIVE, STATUS_MAP.UNINITIALIZED, STATUS_MAP.UNINITIALIZED, STATUS_MAP.STALLED].includes(status)) {
    return "elv-red.4";
  } else if(status === STATUS_MAP.DEGRADED) {
    return "elv-yellow.6";
  }
};

export const FormatTime = ({milliseconds}) => {
  if(!milliseconds) { return ""; }

  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);

  return `${hours}h ${minutes}min`;
};

// Convert a FileList to file info
export const FileInfo = async ({path, fileList}) => {
  return Promise.all(
    Array.from(fileList).map(async file => {
      const data = file;
      const filePath = file.webkitRelativePath || file.name;
      return {
        path: `${path}${filePath}`.replace(/^\/+/g, ""),
        type: "file",
        size: file.size,
        mime_type: file.type,
        data
      };
    })
  );
};
