// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable} from "mobx";

configure({
  enforceActions: "always"
});

// Store for handling writing content
class EditStore {
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

  CreateContentObject = flow(function * ({
    libraryId,
  }) {
    try {
      const response = yield this.client.CreateContentObject({
        libraryId,
        options: this.contentType
      });

      return response;
    } catch(error) {
      console.error("Failed to create content object.", error);
    }
  });

  ConfigureLiveStream = flow(function * ({
    libraryId,
    objectId,
    name,
    description,
    displayName,
    accessGroup,
    permission
  }) {
    const {write_token} = yield this.client.EditContentObject({
      libraryId,
      objectId
    });
  });
}

export default EditStore;
