// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeObservable, observable} from "mobx";

configure({
  enforceActions: "always"
});

class StreamStore {
  rootStore;
  streams = {};

  constructor(rootStore) {
    makeObservable(this, {
      streams: observable
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
}

export default StreamStore;
