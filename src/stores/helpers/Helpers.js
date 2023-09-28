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

  const CHANNEL_LAYOUTS = {
    "stereo-2": 2,
    "surround-5": 6
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
        bitrate: audioBitrate ? parseInt(audioBitrate) * 1000 : null,
        channel_layout: CHANNEL_LAYOUTS[audioChannelLayout],
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
    url
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
