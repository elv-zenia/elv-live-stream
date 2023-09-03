// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable} from "mobx";
import {ParseLiveConfigData} from "Stores/helpers/Helpers";

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

  InitLiveStreamObject = flow(function * ({
    basicFormData,
    inputFormData,
    outputFormData,
    advancedData,
    drmFormData
  }) {
    const {libraryId, streamType, url, name, description, displayName, accessGroup, permission} = basicFormData;
    const {retention, avProperties} = advancedData;
    const {encryption} = drmFormData;

    const response = yield this.CreateContentObject({
      libraryId,
      permission
    });

    const {objectId} = response;

    if(accessGroup) {
      this.AddAccessGroupPermission({
        objectId,
        accessGroup
      });
    }

    const {writeToken} = yield this.client.EditContentObject({
      libraryId,
      objectId
    });

    yield this.AddDescriptiveMetadata({
      libraryId,
      objectId,
      writeToken,
      name,
      description,
      displayName
    });

    const config = ParseLiveConfigData({
      inputFormData,
      outputFormData,
      streamType,
      url,
      encryption,
      avProperties
    });

    yield this.AddLiveRecordingMetadata({
      libraryId,
      objectId,
      writeToken,
      config
    });
  });

  CreateContentObject = flow(function * ({
    libraryId,
    permission
  }) {
    let response;
    try {
      response = yield this.client.CreateContentObject({
        libraryId,
        options: this.contentType
      });
    } catch(error) {
      console.error("Failed to create content object.", error);
    }

    try {
      yield this.client.SetPermission({
        objectId: response.id,
        permission
      });
    } catch(error) {
      console.error("Unable to set permission.", error);
    }

    return response;
  });

  AddDescriptiveMetadata = flow(function * ({
    libraryId,
    objectId,
    writeToken,
    name,
    description,
    displayName
  }) {
    try {
      yield this.client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadata: {
          public: {
            name,
            description,
            asset_metadata: {
              display_title: displayName
            }
          }
        }
      });
    } catch(error) {
      console.error("Failed to add public metadata.", error);
    }
  });

  AddAccessGroupPermission = flow(function * ({
    objectId,
    accessGroup
  }) {
    try {
      yield this.client.AddContentObjectGroupPermission({
        objectId,
        groupAddress: accessGroup,
        permission: "manage"
      });
    } catch(error) {
      console.error(`Unable to add group permission for group: ${accessGroup}`, error);
    }
  });

  AddLiveRecordingMetadata = flow(function * ({
    libraryId,
    objectId,
    writeToken,
    config
  }) {

    yield this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "live_recording_config",
      metadata: config
    });

    yield this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
  });
}

export default EditStore;
