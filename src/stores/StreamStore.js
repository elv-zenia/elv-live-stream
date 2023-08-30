// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeObservable, observable} from "mobx";
// const EluvioLiveStream = require("@eluvio/elv-live-js");

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

  LoadSites = flow(function * () {
    // const tenantContractId = EluvioConfiguration["tenantContractId"];
    // const sites = yield this.client.ContractMetadata({
    //   libraryId: EluvioConfiguration["tenantLibraryId"],
    //   objectId: EluvioConfiguration["tenantObjectId"],
    //   metadataSubtree: "/"
    // });
    // console.log("sites", sites);
    const streamMetadata = yield this.client.ContentObjectMetadata({
      libraryId: EluvioConfiguration["libraryId"],
      objectId: EluvioConfiguration["objectId"],
      metadataSubtree: "public/asset_metadata/live_streams",
      resolveLinks: true
    }) || {};

    for(const slug of Object.keys(streamMetadata).sort((a, b) => a.localeCompare(b))) {
      this.UpdateStream({slug, value: streamMetadata[slug]});
    }
  });

  // Start = flow(function * () {
  //   console.log("liveJS", EluvioLiveStream);
  // });
}

export default StreamStore;
