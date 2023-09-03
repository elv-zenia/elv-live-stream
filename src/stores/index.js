import {configure, flow, makeAutoObservable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import DataStore from "Stores/DataStore";
import EditStore from "Stores/EditStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  client;
  loaded = false;
  networkInfo;

  constructor() {
    makeAutoObservable(this);

    this.dataStore = new DataStore(this);
    this.editStore = new EditStore(this);

    this.Initialize();
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 30
      });

      window.client = this.client;
      this.networkInfo = yield this.client.NetworkInfo();

      yield this.dataStore.Initialize();
    } catch(error) {
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });
}

export const rootStore = new RootStore();
export const dataStore = rootStore.dataStore;
export const editStore = rootStore.editStore;

window.rootStore = rootStore;
