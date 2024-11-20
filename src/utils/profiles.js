export const DefaultLadderProfile = {
  "name" : "Default",
  "ladder_specs": {
    "video" : [
      {
        "bit_rate": 9500000,
        "codecs": "avc1.640028,mp4a.40.2",   // automatic in the future
        "height": 1080,
        "width": 1920
      },
      {
        "bit_rate": 4500000,
        "codecs": "avc1.640028,mp4a.40.2",   // automatic in the future
        "height": 720,
        "width": 1280
      },
      {
        "bit_rate": 2000000,
        "codecs": "avc1.640028,mp4a.40.2",
        "height": 540,
        "width": 960
      },
      {
        "bit_rate": 900000,
        "codecs": "avc1.640028,mp4a.40.2",
        "height": 540,
        "width": 960
      }
    ],
    "audio" : [
      {
        "bit_rate": 192000,
        "channels": 2,
        "codecs": "mp4a.40.2",
      },
      {
        "bit_rate": 384000,
        "channels": 6,
        "codecs": "mp4a.40.2",
      }
    ]
  }
};
