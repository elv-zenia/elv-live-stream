import {makeObservable, configure, observable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  client;
  loaded = false;

  constructor() {
    makeObservable(this, {
      client: observable,
      loaded: observable
    });

    this.Initialize();
  }

  Initialize = () => {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 30
      });

      window.client = this.client;
    } catch(error) {
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  };
}

export const rootStore = new RootStore();

window.rootStore = rootStore;
