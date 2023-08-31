// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeObservable, observable} from "mobx";
// const LiveStream = require("@eluvio/elv-live-js/src/LiveStream");

configure({
  enforceActions: "always"
});

class StreamStore {
  rootStore;
  streams = {};
  libraries;
  accessGroups;

  constructor(rootStore) {
    makeObservable(this, {
      streams: observable,
      libraries: observable,
      accessGroups: observable
    });

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  UpdateStream = ({slug, value}) => {
    this.streams[slug] = value;
  };

  LoadData = flow(function * () {
    const tenantContractId = yield this.LoadTenantInfo();
    const sites = yield this.LoadSites({tenantContractId});
    yield this.LoadStreams({sites});
    yield this.LoadLibraries();
    yield this.LoadAccessGroups();
  });

  LoadTenantInfo = flow(function * () {
    try {
      return yield this.client.userProfileClient.TenantContractId();
    } catch(error) {
      throw Error("No tenant contract ID found.");
    }
  });

  LoadSites = flow(function * ({tenantContractId}) {
    try {
      return yield this.client.ContentObjectMetadata({
        libraryId: tenantContractId.replace("iten", "ilib"),
        objectId: tenantContractId.replace("iten", "iq__"),
        metadataSubtree: "public/sites"
      });
    } catch(error) {
      throw Error(`Unable to load sites for tenant ${tenantContractId}.`);
    }
  });

  LoadStreams = flow(function * ({sites}) {
    let streamMetadata = {};
    for(let siteId of sites) {
      let siteStreams;
      try {
        siteStreams = yield this.client.ContentObjectMetadata({
          libraryId: yield this.client.ContentObjectLibraryId({objectId: siteId}),
          objectId: siteId,
          metadataSubtree: "public/asset_metadata/live_streams",
          resolveLinks: true
        });

        streamMetadata = {
          ...streamMetadata,
          ...siteStreams
        };
      } catch(error) {
        throw Error(`Unable to load live streams for site ${siteId}.`);
      }
    }

    for(const slug of Object.keys(streamMetadata).sort((a, b) => a.localeCompare(b))) {
      if(streamMetadata[slug]?.sources?.default?.["."]?.container) {
        streamMetadata[slug].versionHash = streamMetadata[slug].sources.default["."].container;
        streamMetadata[slug].objectId = this.client.utils.DecodeVersionHash(streamMetadata[slug].versionHash).objectId;
      }

      this.UpdateStream({slug, value: streamMetadata[slug]});
    }
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
}

export default StreamStore;
