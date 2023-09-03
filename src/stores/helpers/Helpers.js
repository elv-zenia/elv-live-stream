export const ParseLiveConfigData = ({
  inputFormData,
  outputFormData,
  streamType,
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

  const STREAM_TYPES = {
    RTMP: "RTMP",
    MPEG_TS: "MPEG-TS"
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
        stream_id: audioStreamId,
        stream_index: audioStreamIndex
      },
      video: {
        stream: AV_STREAM[avProperties],
        stream_id: videoStreamId,
        stream_index: videoStreamIndex
      }
    },
    output: {
      audio: {
        bitrate: audioBitrate,
        channel_layout: CHANNEL_LAYOUTS[audioChannelLayout],
        quality: AV_STREAM[avProperties]
      },
      video: {
        bitrate: videoBitrate,
        height: videoHeight,
        quality: AV_STREAM[avProperties],
        width: videoWidth
      }
    },
    part_ttl: 3600,
    stream_type: STREAM_TYPES[streamType],
    url
  };

  return config;
};
