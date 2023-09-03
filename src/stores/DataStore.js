// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable} from "mobx";

configure({
  enforceActions: "always"
});

// Store for loading all the initial data
class DataStore {
  rootStore;
  streams;
  activeStreams;
  libraries;
  accessGroups;
  contentType;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  Initialize = flow(function * () {
    const tenantContractId = yield this.LoadTenantInfo();
    const sites = yield this.LoadTenantData({tenantContractId});
    yield this.LoadStreams({sites});
    yield this.LoadLibraries();
    yield this.LoadAccessGroups();
  });

  UpdateStreams = ({streams}) => {
    this.streams = streams;
  }

  LoadTenantInfo = flow(function * () {
    try {
      return yield this.client.userProfileClient.TenantContractId();
    } catch(error) {
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

      if(content_types?.live_stream) { this.contentType = content_types.live_stream;
      }

      return [sites?.live_streams] || [];
    } catch(error) {
      throw Error(`Unable to load sites for tenant ${tenantContractId}.`);
    }
  });

  LoadStreams = flow(function * ({sites=[]}) {
    let streamMetadata = {};
    for(let siteId of sites) {
      let siteStreams;
      try {
        siteStreams = yield this.client.ContentObjectMetadata({
          libraryId: yield this.client.ContentObjectLibraryId({objectId: siteId}),
          objectId: siteId,
          metadataSubtree: "public/asset_metadata/live_streams",
          resolveLinks: true,
          resolveIgnoreErrors: true
        });

        streamMetadata = {
          ...streamMetadata,
          ...siteStreams
        };
      } catch(error) {
        throw Error(`Unable to load live streams for site ${siteId}.`);
      }
    }
    console.log("streamMeta", streamMetadata);

    for(const slug of Object.keys(streamMetadata).sort((a, b) => a.localeCompare(b))) {
      if(streamMetadata[slug]?.sources?.default?.["."]?.container) {
        streamMetadata[slug].versionHash = streamMetadata[slug].sources.default["."].container;
        console.log("streamMeta", streamMetadata);
        const objectId = this.client.utils.DecodeVersionHash(streamMetadata[slug].versionHash).objectId;
        streamMetadata[slug].objectId = objectId;
        streamMetadata[slug].libraryId = yield this.client.ContentObjectLibraryId({objectId});
        streamMetadata[slug].embedUrl = yield this.EmbedUrl({objectId});
      }
    }

    this.UpdateStreams({streams: streamMetadata});
  });

  LoadLibraries = flow(function * () {
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

  DeleteStream = ({objectId}) => {
    const streams = Object.assign({}, this.streams);
    const slug = Object.keys(streams).find(streamSlug => {
      return streams[streamSlug].objectId === objectId;
    });

    delete streams[slug];
    this.UpdateStreams({streams});
  };

  EmbedUrl = flow(function * ({
    objectId
  }) {
    try {
      console.log("client", this.client);
      return yield this.client.EmbedUrl({objectId});
    } catch(error) {
      console.error(error);
      return "";
    }
  });
}

export default DataStore;
