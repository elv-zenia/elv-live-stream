import {configure, flow, makeAutoObservable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import DataStore from "Stores/DataStore";
import EditStore from "Stores/EditStore";
import StreamStore from "Stores/StreamStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  client;
  loaded = false;
  networkInfo;
  contentSpaceId;

  constructor() {
    makeAutoObservable(this);

    this.dataStore = new DataStore(this);
    this.editStore = new EditStore(this);
    this.streamStore = new StreamStore(this);

    this.Initialize();
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 240
      });

      window.client = this.client;
      this.networkInfo = yield this.client.NetworkInfo();
      this.contentSpaceId = yield client.ContentSpaceId();

      yield this.dataStore.Initialize();
    } catch(error) {
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });

  ExecuteFrameRequest = flow(function * ({request, Respond}) {
    Respond(yield this.client.PassRequest({request, Respond}));
  });
}

export const rootStore = new RootStore();
export const dataStore = rootStore.dataStore;
export const editStore = rootStore.editStore;
export const streamStore = rootStore.streamStore;

window.rootStore = rootStore;
