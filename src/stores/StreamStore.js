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

  UpdateStatus = ({slug, status}) => {
    const streamObject = this.streams[slug];
    streamObject.status = status;
    this.UpdateStream({
      key: slug,
      value: streamObject
    });
  }

  ConfigureStream = flow(function * ({
    objectId,
    slug
  }) {
    try {
      yield this.client.StreamConfig({name: objectId});
      yield editStore.CreateSiteLinks({objectId});
      yield editStore.AddStreamToSite({objectId});

      this.UpdateStatus({slug, status: "ready"});
    } catch(error) {
      console.error("Unable to apply configuration.", error);
    }
  });

  CheckStatus = flow(function * ({
    objectId,
    stopLro=false,
    showParams=false
  }) {
    const response = yield this.client.StreamStatus({
      name: objectId,
      stopLro,
      showParams
    });

    return response;
  });

  StartStream = flow(function * ({
    slug,
    start=false
  }) {
    const objectId = this.streams[slug].objectId;
    const libraryId = yield this.client.ContentObjectLibraryId({objectId});
    const edgeWriteToken = yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "live_recording/fabric_config/edge_write_token"
    });
    let tokenMeta;

    if(edgeWriteToken) {
      tokenMeta = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: `/q/${edgeWriteToken}/meta`
      });
    }

    if(!tokenMeta) {
      yield this.client.StreamCreate({name: objectId, start});
    }

    yield this.OperateLRO({
      objectId,
      slug,
      operation: "START"
    });
  });

  OperateLRO = flow(function * ({
    objectId,
    slug,
    operation
  }) {
    const OP_MAP = {
      START: "start",
      RESET: "reset",
      STOP: "stop"
    };

    try {
      const response = yield this.client.StreamStartOrStopOrReset({
        name: objectId,
        op: OP_MAP[operation]
      });

      this.UpdateStatus({slug, status: response.state});
    } catch(error) {
      console.error(`Unable to ${OP_MAP[operation]} LRO.`, error);
    }
  });

  AllStreamsStatus = flow(function * () {
    const streams = {
      ...this.streams
    };

    for(let slug of Object.keys(this.streams || {})) {
      try {
        const response = yield this.CheckStatus({
          objectId: this.streams[slug].objectId
        });
        streams[slug].status = response.state;
      } catch(error) {
        console.error(`Failed to load status for ${this.streams[slug].objectId}.`, error);
      }
    }

    this.UpdateStreams({streams});
  });
}

export default StreamStore;
