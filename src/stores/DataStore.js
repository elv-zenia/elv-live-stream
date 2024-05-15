// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable, runInAction} from "mobx";
import {streamStore} from "./index";
import {RECORDING_BITRATE_OPTIONS} from "Data/StreamData";

configure({
  enforceActions: "always"
});

// Store for loading all the initial data
class DataStore {
  rootStore;
  tenantId;
  libraries;
  accessGroups;
  contentType;
  titleContentType;
  siteId;
  siteLibraryId;
  liveStreamUrls;

  constructor(rootStore) {
    makeAutoObservable(this);

    runInAction(() => {
      this.rootStore = rootStore;
    });
  }

  get client() {
    return this.rootStore.client;
  }

  get siteId() {
    return this.siteId;
  }

  get siteLibraryId() {
    return this.siteLibraryId;
  }

  Initialize = flow(function * () {
    const tenantContractId = yield this.LoadTenantInfo();
    if(!this.siteId) {
      this.siteId = yield this.LoadTenantData({tenantContractId});
    }

    if(!this.siteLibraryId) {
      this.siteLibraryId = yield this.client.ContentObjectLibraryId({objectId: this.siteId});
    }

    yield this.LoadStreams();
    yield this.rootStore.streamStore.AllStreamsStatus();
  });

  LoadTenantInfo = flow(function * () {
    try {
      if(!this.tenantId) {
        this.tenantId = yield this.client.userProfileClient.TenantContractId();

        if(!this.tenantId) {
          throw "Tenant ID not found";
        }
      }

      return this.tenantId;
    } catch(error) {
      this.rootStore.SetErrorMessage("Error: Unable to determine tenant info");
      console.error(error);
      throw Error("No tenant contract ID found.");
    }
  });

  LoadTenantData = flow(function * ({tenantContractId}) {
    try {
      const response = yield this.client.ContentObjectMetadata({
        libraryId: tenantContractId.replace("iten", "ilib"),
        objectId: tenantContractId.replace("iten", "iq__"),
        metadataSubtree: "public",
        select: [
          "sites/live_streams",
          "content_types/live_stream",
          "content_types/title"
        ]
      });
      const {sites, content_types} = response;

      if(content_types?.live_stream) {
        this.contentType = content_types.live_stream;
      }

      if(content_types?.title) {
        this.titleContentType = content_types.title;
      }

      return sites?.live_streams;
    } catch(error) {
      this.rootStore.SetErrorMessage("Error: Unable to load tenant sites");
      console.error(error);
      throw Error(`Unable to load sites for tenant ${tenantContractId}.`);
    }
  });

  LoadStreams = flow(function * () {
    streamStore.UpdateStreams({});
    let streamMetadata;
    try {
      const siteMetadata = yield this.client.ContentObjectMetadata({
        libraryId: yield this.client.ContentObjectLibraryId({objectId: this.siteId}),
        objectId: this.siteId,
        select: [
          "public/asset_metadata/live_streams"
        ],
        resolveLinks: true,
        resolveIgnoreErrors: true,
        resolveIncludeSource: true
      });

      streamMetadata = siteMetadata?.public?.asset_metadata?.live_streams;
    } catch(error) {
      streamStore.UpdateStreams({streams: {}});
      this.rootStore.SetErrorMessage("Error: Unable to load streams");
      console.error(error);
      throw Error(`Unable to load live streams for site ${this.siteId}.`);
    }

    yield this.client.utils.LimitedMap(
      10,
      Object.keys(streamMetadata),
      async slug => {
        const stream = streamMetadata[slug];

        const versionHash = stream?.["."]?.source;

        if(versionHash) {
          const objectId = this.client.utils.DecodeVersionHash(versionHash).objectId;
          const libraryId = await this.client.ContentObjectLibraryId({objectId});

          streamMetadata[slug].slug = slug;
          streamMetadata[slug].objectId = objectId;
          streamMetadata[slug].versionHash = versionHash;
          streamMetadata[slug].libraryId = libraryId;
          streamMetadata[slug].title = stream.display_title || stream.title;
          streamMetadata[slug].embedUrl = await this.EmbedUrl({objectId});

          const streamDetails = await this.LoadStreamMetadata({
            objectId,
            libraryId
          }) || {};

          Object.keys(streamDetails).forEach(detail => {
            streamMetadata[slug][detail] = streamDetails[detail];
          });
        } else {
          console.error(`No version hash for ${slug}`);
        }
      }
    );

    streamStore.UpdateStreams({streams: streamMetadata});
  });

  LoadLibraries = flow(function * () {
    if(this.libraries) { return; }

    try {
      let loadedLibraries = {};

      const libraryIds = yield this.client.ContentLibraries() || [];
      yield Promise.all(
        libraryIds.map(async libraryId => {
          const response = (await this.client.ContentObjectMetadata({
            libraryId,
            objectId: libraryId.replace(/^ilib/, "iq__"),
            metadataSubtree: "public/name"
          }));

          if(!response) { return; }

          loadedLibraries[libraryId] = {
            libraryId,
            name: response || libraryId
          };
        })
      );

      // eslint-disable-next-line no-unused-vars
      const sortedArray = Object.entries(loadedLibraries).sort(([id1, obj1], [id2, obj2]) => obj1.name.localeCompare(obj2.name));
      this.libraries = Object.fromEntries(sortedArray);
    } catch(error) {
      console.error("Failed to load libraries", error);
    }
  });

  LoadAccessGroups = flow(function * () {
    if(this.accessGroups) { return; }

    try {
      if(!this.accessGroups) {
        this.accessGroups = {};
        const accessGroups = yield this.client.ListAccessGroups() || [];
        accessGroups
          .sort((a, b) => (a.meta.name || a.id).localeCompare(b.meta.name || b.id))
          .map(async accessGroup => {
            if(accessGroup.meta["name"]){
              this.accessGroups[accessGroup.meta["name"]] = accessGroup;
            } else {
              this.accessGroups[accessGroup.id] = accessGroup;
            }
          });
      }
    } catch(error) {
      console.error("Failed to load access groups", error);
    }
  });

  LoadStreamMetadata = flow(function * ({objectId, libraryId}) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const streamMeta = yield this.client.ContentObjectMetadata({
        objectId,
        libraryId,
        select: [
          "live_recording_config/probe_info/format/filename",
          "live_recording_config/probe_info/streams",
          "live_recording/recording_config/recording_params/origin_url",
          "live_recording/recording_config/recording_params/simple_watermark",
          "live_recording/recording_config/recording_params/image_watermark",
          "live_recording_config/reference_url",
          "live_recording_config/url",
          "live_recording_config/drm_type"
        ]
      });
      let probeMeta = streamMeta?.live_recording_config?.probe_info;

      // Phase out as new streams will have live_recording_config/probe_info
      if(!probeMeta) {
        probeMeta = yield this.client.ContentObjectMetadata({
          objectId,
          libraryId,
          metadataSubtree: "/live_recording/probe_info",
          select: [
            "format/filename",
            "streams"
          ]
        });
      }

      let probeType = (probeMeta?.format?.filename)?.split("://")[0];
      if(probeType === "srt" && !probeMeta.format?.filename?.includes("listener")) {
        probeType = "srt-caller";
      }

      const videoStream = (probeMeta?.streams || []).find(stream => stream.codec_type === "video");
      const audioStreamCount = probeMeta?.streams ? (probeMeta?.streams || []).filter(stream => stream.codec_type === "audio").length : undefined;

      return {
        originUrl: streamMeta?.live_recording?.recording_config?.recording_params?.origin_url || streamMeta?.live_recording_config?.url,
        format: probeType,
        videoBitrate: videoStream?.bit_rate,
        codecName: videoStream?.codec_name,
        audioStreamCount,
        referenceUrl: streamMeta?.live_recording_config?.reference_url,
        drm: streamMeta?.live_recording_config?.drm_type,
        simpleWatermark: streamMeta?.live_recording?.recording_config?.recording_params?.simple_watermark,
        imageWatermark: streamMeta?.live_recording?.recording_config?.recording_params?.image_watermark
      };
    } catch(error) {
      console.error("Unable to load stream metadata", error);
    }
  });

  LoadStreamUrls = flow(function * () {
    this.UpdateStreamUrls({});
    try {
      const response = yield this.client.StreamListUrls({siteId: this.siteId});

      const urls = {};
      Object.keys(response || {}).forEach(protocol => {
        response[protocol].forEach(protocolObject => {
          urls[protocolObject.url] = {
            ...protocolObject,
            protocol
          };
        });
      });

      this.UpdateStreamUrls({urls});
    } catch(error) {
      console.error("Unable to load stream URLs", error);
    }
  });

  LoadEdgeWriteTokenMeta = flow(function * ({
    objectId,
    libraryId
  }) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const edgeWriteToken = yield this.client.ContentObjectMetadata({
        objectId,
        libraryId,
        metadataSubtree: "/live_recording/fabric_config/edge_write_token"
      });

      if(!edgeWriteToken) { return {}; }

      const metadata = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        writeToken: edgeWriteToken,
        metadataSubtree: "live_recording",
        select: ["recordings", "recording_config"]
      });

      return {
        _recordingStartTime: metadata?.recording_config?.recording_start_time,
        ...metadata.recordings
      };
    } catch(error) {
      console.error("Unable to load metadata with edge write token", error);
    }
  });

  LoadStreamProbeData = flow(function * ({
    objectId,
    libraryId
  }){
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      let probeMetadata = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "live_recording_config/probe_info",
      });

      // Phase out as new streams will have live_recording_config/probe_info
      if(!probeMetadata) {
        probeMetadata = yield this.client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "live_recording/probe_info",
        });
      }

      if(!probeMetadata) {
        return {audioStreams: [], audioData: {}};
      }

      const audioConfig = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "live_recording_config/audio"
      });

      const audioStreams = (probeMetadata.streams || [])
        .filter(stream => stream.codec_type === "audio");

      // Map used for form data
      const audioData = {};
      audioStreams.forEach(spec => {
        const audioConfigForIndex = audioConfig && audioConfig[spec.stream_index] ? audioConfig[spec.stream_index] : {};

        const initBitrate = RECORDING_BITRATE_OPTIONS.map(option => option.value).includes(spec.bit_rate) ? spec.bit_rate : 192000;

        audioData[spec.stream_index] = {
          bitrate: spec.bit_rate,
          codec: spec.codec_name,
          record: Object.hasOwn(audioConfigForIndex, "record") ? audioConfigForIndex.record : true,
          recording_bitrate: initBitrate,
          recording_channels: spec.channels,
          playout: Object.hasOwn(audioConfigForIndex, "playout") ? audioConfigForIndex.playout : true,
          playout_label: audioConfigForIndex.playout_label || `Audio ${spec.stream_index}`
        };
      });

      return {
        audioStreams,
        audioData
      };
    } catch(error) {
      console.error("Unable to load live_recording metadata", error);
    }
  });

  EmbedUrl = flow(function * ({
    objectId
  }) {
    try {
      return yield this.client.EmbedUrl({objectId, mediaType: "live_video"});
    } catch(error) {
      console.error(error);
      return "";
    }
  });

  UpdateStreamUrls = ({urls}) => {
    this.liveStreamUrls = urls;
  };
}

export default DataStore;
