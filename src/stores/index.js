import {makeObservable, configure, observable, flow} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import StreamStore from "./StreamStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  client;
  loaded = false;
  networkInfo;

  constructor() {
    makeObservable(this, {
      client: observable,
      loaded: observable,
      networkInfo: observable
    });

    this.streamStore = new StreamStore(this);

    this.Initialize();
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 30
      });

      // const tenantContractId = yield this.client.userProfileClient.UserMetadata({metadataSubtree: "tenantContractId"});

      window.client = this.client;

      this.networkInfo = yield this.client.NetworkInfo();
      yield this.streamStore.LoadData();
    } catch(error) {
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });
}

export const rootStore = new RootStore();
export const streamStore = rootStore.streamStore;

window.rootStore = rootStore;
