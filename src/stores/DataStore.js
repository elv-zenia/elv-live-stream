// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable} from "mobx";
import {streamStore} from "./index";

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
  siteId;
  siteLibraryId;
  liveStreamUrls;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
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
    this.siteId = yield this.LoadTenantData({tenantContractId});
    this.siteLibraryId = yield this.client.ContentObjectLibraryId({objectId: this.siteId});

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
          "content_types/live_stream"
        ]
      });
      const {sites, content_types} = response;

      if(content_types?.live_stream) {
        this.contentType = content_types.live_stream;
      }

      return sites?.live_streams;
    } catch(error) {
      this.rootStore.SetErrorMessage("Error: Unable to load tenant sites");
      console.error(error);
      throw Error(`Unable to load sites for tenant ${tenantContractId}.`);
    }
  });

  LoadStreams = flow(function * () {
    let streamMetadata;
    try {
      const siteMetadata = yield this.client.ContentObjectMetadata({
        libraryId: yield this.client.ContentObjectLibraryId({objectId: this.siteId}),
        objectId: this.siteId,
        select: [
          "/live_stream_urls",
          "public/asset_metadata/live_streams"
        ],
        resolveLinks: true,
        resolveIgnoreErrors: true
      });

      if(siteMetadata.live_stream_urls) {
        this.liveStreamUrls = siteMetadata.live_stream_urls;
      }

      streamMetadata = siteMetadata?.public?.asset_metadata?.live_streams;
    } catch(error) {
      this.rootStore.SetErrorMessage("Error: Unable to load streams");
      console.error(error);
      throw Error(`Unable to load live streams for site ${this.siteId}.`);
    }

    yield this.client.utils.LimitedMap(
      10,
      Object.keys(streamMetadata),
      async slug => {
        const stream = streamMetadata[slug];

        const versionHash = (
          stream?.sources?.default?.["."]?.container ||
          ((stream["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1]
        );

        if(versionHash) {
          const objectId = this.client.utils.DecodeVersionHash(versionHash).objectId;
          const libraryId = await this.client.ContentObjectLibraryId({objectId});

          streamMetadata[slug].slug = slug;
          streamMetadata[slug].objectId = objectId;
          streamMetadata[slug].versionHash = versionHash;
          streamMetadata[slug].libraryId = libraryId;
          streamMetadata[slug].title = stream.display_title || stream.title;

          const streamDetails = await this.LoadStreamMetadata({
            objectId,
            libraryId
          }) || {};

          Object.keys(streamDetails).forEach(detail => {
            streamMetadata[slug][detail] = streamDetails[detail];
          });
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

      const liveRecordingMeta = yield this.client.ContentObjectMetadata({
        objectId,
        libraryId,
        metadataSubtree: "/live_recording",
        select: [
          "probe_info/format/filename",
          "probe_info/streams",
          "recording_config/recording_params/origin_url",
        ]
      });
      let probeMeta = liveRecordingMeta?.probe_info;

      // Phase out as new streams will have live_recording/probe_info
      if(!probeMeta) {
        probeMeta = yield this.client.ContentObjectMetadata({
          objectId,
          libraryId,
          metadataSubtree: "/probe",
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
        originUrl: liveRecordingMeta?.recording_config?.recording_params?.origin_url,
        format: probeType,
        videoBitrate: videoStream?.bit_rate,
        codecName: videoStream?.codec_name,
        audioStreamCount
      };
    } catch(error) {
      console.error("Unable to load stream metadata", error);
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
}

export default DataStore;
