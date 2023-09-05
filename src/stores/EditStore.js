// Force strict mode so mutations are only allowed within actions.
import {configure, flow, makeAutoObservable} from "mobx";
import {ParseLiveConfigData, Slugify} from "Stores/helpers/Helpers";
import {dataStore, streamStore} from "./index";

configure({
  enforceActions: "always"
});

// Store for handling writing content
class EditStore {
  rootStore;
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
    const {libraryId, url, name, description, displayName, accessGroup, permission} = basicFormData;
    const {avProperties} = advancedData;
    const {encryption} = drmFormData;

    const response = yield this.CreateContentObject({
      libraryId,
      permission
    });

    const {objectId, write_token} = response;

    if(accessGroup) {
      this.AddAccessGroupPermission({
        objectId,
        accessGroup
      });
    }

    yield this.AddDescriptiveMetadata({
      libraryId,
      objectId,
      writeToken: write_token,
      name,
      description,
      displayName
    });

    const config = ParseLiveConfigData({
      inputFormData,
      outputFormData,
      url,
      encryption,
      avProperties
    });

    yield this.AddLiveRecordingMetadata({
      libraryId,
      objectId,
      writeToken: write_token,
      config
    });

    streamStore.UpdateStream({
      key: Slugify(name),
      value: {
        objectId,
        title: name
      },
      active: true
    });

    return objectId;
  });

  CreateContentObject = flow(function * ({
    libraryId,
    permission
  }) {
    let response;
    try {
      response = yield this.client.CreateContentObject({
        libraryId,
        options: { type: dataStore.contentType }
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
      yield this.client.MergeMetadata({
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
      metadataSubtree: "/live_recording_config",
      metadata: config
    });

    yield this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: "Add live_recording_config",
      awaitCommitConfirmation: true
    });

    yield new Promise(resolve => setTimeout(resolve, 2000));
  });
}

export default EditStore;
