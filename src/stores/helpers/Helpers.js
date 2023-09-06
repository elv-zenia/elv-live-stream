export const ParseLiveConfigData = ({
  inputFormData,
  outputFormData,
  url,
  encryption,
  avProperties
}) => {
  const {videoStreamId, videoStreamIndex, audioStreamId, audioStreamIndex} = inputFormData;
  const {videoHeight, videoWidth, videoBitrate, audioChannelLayout, audioBitrate} = outputFormData;

  const AV_STREAM = {
    DEFAULT: "default",
    CUSTOM: "specific"
  };

  const ENCRYPTION_TYPES = {
    DRM: "drm",
    CLEAR: "clear"
  };

  const CHANNEL_LAYOUTS = {
    "stereo-2": "Stereo (2)",
    "surround-5": "Surround (5.1)"
  };

  const config = {
    drm: ENCRYPTION_TYPES[encryption],
    input: {
      audio: {
        stream: AV_STREAM[avProperties],
        stream_id: parseInt(audioStreamId),
        stream_index: parseInt(audioStreamIndex)
      },
      video: {
        stream: AV_STREAM[avProperties],
        stream_id: parseInt(videoStreamId),
        stream_index: parseInt(videoStreamIndex)
      }
    },
    output: {
      audio: {
        bitrate: parseInt(audioBitrate),
        channel_layout: CHANNEL_LAYOUTS[audioChannelLayout],
        quality: AV_STREAM[avProperties]
      },
      video: {
        bitrate: parseInt(videoBitrate),
        height: parseInt(videoHeight),
        quality: AV_STREAM[avProperties],
        width: parseInt(videoWidth)
      }
    },
    part_ttl: 3600,
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
