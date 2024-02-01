export const ParseLiveConfigData = ({
  inputFormData,
  outputFormData,
  url,
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
        // stream_id: parseInt(audioStreamId),
        stream_index: parseInt(audioStreamIndex)
      }
      // video: {
      //   stream: AV_STREAM[avProperties],
      //   stream_id: parseInt(videoStreamId),
      //   stream_index: parseInt(videoStreamIndex)
      // }
    },
    output: {
      audio: {
        bitrate: parseInt(audioBitrate),
        channel_layout: parseInt(audioChannelLayout),
        quality: AV_STREAM[avProperties]
      }
      // video: {
      //   bitrate: videoBitrate ? parseInt(videoBitrate) * 1000 : null,
      //   height: parseInt(videoHeight),
      //   quality: AV_STREAM[avProperties],
      //   width: parseInt(videoWidth)
      // }
    },
    part_ttl: parseInt(retention),
    url,
    reference_url: url ? url.split("?")[0] : undefined
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
