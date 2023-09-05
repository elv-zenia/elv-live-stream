// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable} from "mobx";
import {editStore} from "./index";

configure({
  enforceActions: "always"
});

// Store for all stream-related actions
class StreamStore {
  streams;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  UpdateStream = ({key, value={}, active=false}) => {
    if(active) {
      value.active = true;
    }

    const streams = {
      [key]: value,
      ...this.streams || {}
    };

    this.UpdateStreams({streams});
  };

  UpdateStreams = ({streams}) => {
    this.streams = streams;
  };

  ConfigureStream = flow(function * ({
    objectId
  }) {
    try {
      yield this.client.StreamConfig({name: objectId});
      yield editStore.CreateSiteLinks({objectId});
      yield editStore.AddStreamToSite({objectId});
    } catch(error) {
      console.error("Unable to apply configuration.", error);
    }
  });

  CheckStatus = flow(function * ({
    objectId,
    stopLro=false,
    showParams=false
  }) {
    return yield this.client.StreamStatus({
      objectId,
      stopLro,
      showParams
    });
  });

  CreateStream = flow(function * ({
    objectId,
    start=false
  }) {
    return yield this.client.StreamCreate({name: objectId, start});
  });

  OperateLRO = flow(function * ({
    objectId,
    operation
  }) {
    // start | reset | stop
    return yield this.client.StreamStartOrStopOrReset({
      name: objectId,
      op: operation
    });
  });
}

export default StreamStore;
