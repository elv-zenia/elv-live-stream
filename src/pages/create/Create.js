import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {dataStore, editStore, streamStore} from "Stores";
import {Radio, Select, TextInput} from "Components/Inputs";
import Accordion from "Components/Accordion";
import {useNavigate} from "react-router-dom";
import {Loader} from "Components/Loader";
import {ENCRYPTION_OPTIONS} from "Data/StreamData";
import {Alert, Button, Flex, Text} from "@mantine/core";
import {IconAlertCircle} from "@tabler/icons-react";
import AudioTracksTable from "Pages/create/AudioTracksTable";
import {notifications} from "@mantine/notifications";
import classes from "Assets/stylesheets/modules/CreatePage.module.css";
import ProbeConfirmation from "Pages/ProbeConfirmation";

const FORM_KEYS = {
  BASIC: "BASIC",
  ADVANCED: "ADVANCED",
  DRM: "DRM"
};

const Permissions = observer(({permission, UpdateCallback}) => {
  const permissionLevels = rootStore.client.permissionLevels;

  return (
    <Select
      label="Permission"
      labelDescription="Set a permission level."
      tooltip={
        Object.values(rootStore.client.permissionLevels).map(({short, description}) =>
          <div key={`permission-info-${short}`} className="form__tooltip-item">
            <div className="form__tooltip-item__permission-title">{ short }:</div>
            <div>{ description }</div>
          </div>
        )
      }
      value={permission}
      onChange={UpdateCallback}
      options={
        Object.keys(permissionLevels || {}).map(permissionName => (
          {
            label: permissionLevels[permissionName].short,
            value: permissionName
          }
        ))
      }
    />
  );
});

const PlaybackEncryption = observer(({drmFormData, UpdateCallback}) => {
  const options = ENCRYPTION_OPTIONS;

  return (
    <Select
      label="Playback Encryption"
      labelDescription="Select a playback encryption option. Enable Clear or Digital Rights Management (DRM) copy protection during playback."
      formName="playbackEncryption"
      options={options}
      defaultOption={{
        value: "",
        label: "Select Encryption"
      }}
      value={drmFormData.encryption}
      onChange={event => UpdateCallback({event, key: "encryption"})}
      tooltip={
        options.map(({label, title, id}) =>
          <div key={`encryption-info-${id}`} className="form__tooltip-item">
            <div className="form__tooltip-item__encryption-title">{ label }:</div>
            <div>{ title }</div>
          </div>
        )
      }
    />
  );
});

const AdvancedSection = observer(({
  advancedData,
  AdvancedUpdateCallback,
  drmFormData,
  DrmUpdateCallback,
  AdvancedSettingsCallback,
  objectProbed=false,
  audioTracks,
  audioFormData,
  setAudioFormData,
  setShowProbeConfirmation,
  objectData,
  useAdvancedSettings,
  DisableProbeButton
}) => {
  return (
    <>
      <Accordion
        title="Advanced Settings"
        id="advanced-section"
        value={useAdvancedSettings}
        onValueChange={AdvancedSettingsCallback}
      >
        {
          useAdvancedSettings &&
          <>
            <Select
              label="Retention"
              labelDescription="Select a retention period for how long stream parts will exist until they are removed from the fabric."
              formName="retention"
              options={[
                {label: "1 Hour", value: 3600}, // 60 * 60 = 3600 seconds
                {label: "6 Hours", value: 21600}, // 60 * 60 * 6 = 21600
                {label: "1 Day", value: 86400}, // 60 * 60 * 24 = 86400 seconds
                {label: "1 Week", value: 604800}, // 60 * 60 * 24 * 7 = 604800 seconds
                {label: "1 Month", value: 2635200} // 60 * 60 * 24 * 30.5 = 2635200 seconds
              ]}
              value={advancedData.retention}
              onChange={event => AdvancedUpdateCallback({
                key: "retention",
                event
              })
              }
            />
            <PlaybackEncryption
              drmFormData={drmFormData}
              UpdateCallback={({event, key}) => DrmUpdateCallback({
                key,
                event
              })}
            />

            {
              !objectProbed &&
              <Alert
                variant="light"
                color="blue"
                mt={24}
                mb={24}
                icon={<IconAlertCircle/>}
                classNames={{
                  wrapper: classes.alertRoot
                }}
              >
                <Flex justify="space-between" align="center">
                  <Text>
                    To apply audio stream settings, object must be probed first.
                  </Text>
                  <Button
                    variant="subtle"
                    onClick={() => setShowProbeConfirmation(true)}
                    disabled={
                      objectData !== null ||
                      DisableProbeButton()
                    }
                  >
                    Probe
                  </Button>
                </Flex>
              </Alert>
            }
            <div className="form__section-header">Audio</div>
            <AudioTracksTable
              records={audioTracks}
              audioFormData={audioFormData}
              setAudioFormData={setAudioFormData}
              disabled={!objectProbed}
            />
          </>
        }
      </Accordion>
    </>
  );
});

const Create = observer(() => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataStore.LoadAccessGroups(),
      dataStore.LoadLibraries(),
      dataStore.LoadStreamUrls()
    ])
      .finally(() => setLoading(false));
  }, []);

  const [basicFormData, setBasicFormData] = useState({
    url: "",
    protocol: "mpegts",
    name: "",
    description: "",
    displayTitle: "",
    libraryId: "",
    accessGroup: "",
    permission: "editable"
  });

  const [advancedData, setAdvancedData] = useState({
    retention: 86400
  });

  const [useAdvancedSettings, setUseAdvancedSettings] = useState();

  const [drmFormData, setDrmFormData] = useState({
    encryption: ""
  });

  const [audioFormData, setAudioFormData] = useState(null);

  const [showProbeConfirmation, setShowProbeConfirmation] = useState(false);

  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [objectData, setObjectData] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);

  const urls = basicFormData.protocol === "custom" ?
    [] :
    Object.keys(dataStore.liveStreamUrls || {})
      .filter(url => dataStore.liveStreamUrls[url].protocol === basicFormData.protocol && !dataStore.liveStreamUrls[url].active);

  useEffect(() => {
    const LoadConfigData = async () => {
      const {audioStreams, audioData} = await dataStore.LoadStreamProbeData({
        objectId: objectData.objectId
      });

      setAudioTracks(audioStreams);
      setAudioFormData(audioData);
    };

    if(objectData !== null) {
      LoadConfigData();
    }
  }, [objectData, streamStore.streams]);

  const UpdateFormData = ({formKey, key, value}) => {
    const FORM_MAP = {
      "BASIC": {
        data: basicFormData,
        callback: setBasicFormData
      },
      "ADVANCED": {
        data: advancedData,
        callback: setAdvancedData
      },
      "DRM": {
        data: drmFormData,
        callback: setDrmFormData
      }
    };
    const {data, callback} = FORM_MAP[formKey];
    const newData = Object.assign({}, data);
    newData[key] = value;

    callback(newData);
  };

  const HandleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const formData = {
        basicFormData,
        advancedData,
        drmFormData
      };
      let objectId;

      if(objectData === null) {
        const response = await editStore.InitLiveStreamObject({
          ...formData
        });

        objectId = response.objectId;
      } else {
        objectId = objectData.objectId;
        await editStore.UpdateLiveStreamObject({
          objectId,
          slug: objectData.slug,
          audioFormData,
          ...formData
        });
      }

      navigate(`/streams/${objectId}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`create-form-container ${!dataStore.tenantId ? "create-form-container--disabled" : ""}`}>
      <div className="page-header">Create Live Stream</div>
      <form className="form" onSubmit={HandleSubmit}>
        <Radio
          label="Protocol"
          options={[
            {
              optionLabel: "MPEGTS",
              id: "mpegts",
              value: "mpegts",
              checked: basicFormData.protocol === "mpegts",
              onChange: event => UpdateFormData({
                key: "protocol",
                value: event.target.value,
                formKey: FORM_KEYS.BASIC
              })
            },
            {
              optionLabel: "RTMP",
              id: "rtmp",
              value: "rtmp",
              checked: basicFormData.protocol === "rtmp",
              onChange: event => UpdateFormData({
                key: "protocol",
                value: event.target.value,
                formKey: FORM_KEYS.BASIC
              })
            },
            {
              optionLabel: "SRT",
              id: "srt",
              value: "srt",
              checked: basicFormData.protocol === "srt",
              onChange: event => UpdateFormData({
                key: "protocol",
                value: event.target.value,
                formKey: FORM_KEYS.BASIC
              })
            },
            {
              optionLabel: "Custom",
              id: "customProtocol",
              value: "custom",
              checked: basicFormData.protocol === "custom",
              onChange: event => UpdateFormData({
                key: "protocol",
                value: event.target.value,
                formKey: FORM_KEYS.BASIC
              })
            }
          ]}
        />
        {
          basicFormData.protocol === "custom" &&
          <TextInput
            label="URL"
            required={basicFormData.protocol === "custom"}
            value={basicFormData.url}
            disabled={objectData !== null}
            onChange={event => UpdateFormData({
              key: "url",
              value: event.target.value,
              formKey: FORM_KEYS.BASIC
            })}
          />
        }
        {
          basicFormData.protocol !== "custom" &&
          <Select
            label="URL"
            required={true}
            disabled={objectData !== null}
            defaultValue={urls[0]}
            options={urls.map(url => (
              {
                label: url,
                value: url
              }
            ))}
            defaultOption={{
              value: "",
              label: "Select URL"
            }}
            onChange={event => UpdateFormData({
              key: "url",
              value: event.target.value,
              formKey: FORM_KEYS.BASIC
            })}
          />
        }
        <TextInput
          label="Name"
          required={true}
          value={basicFormData.name}
          onChange={event => UpdateFormData({
            key: "name",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />
        <TextInput
          label="Description"
          value={basicFormData.description}
          onChange={event => UpdateFormData({
            key: "description",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />
        <TextInput
          label="Display Title"
          value={basicFormData.displayTitle}
          onChange={event => UpdateFormData({
            key: "displayTitle",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />

        <Select
          label="Access Group"
          disabled={objectData !== null}
          labelDescription="This is the Access Group that will manage your live stream object."
          options={
            Object.keys(dataStore.accessGroups || {}).map(accessGroupName => (
              {
                label: accessGroupName,
                value: accessGroupName
              }
            ))
          }
          defaultOption={{
            value: "",
            label: "Select Access Group"
          }}
          onChange={event => UpdateFormData({
            key: "accessGroup",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />

        <Permissions
          permission={basicFormData.permission}
          UpdateCallback={(event) => UpdateFormData({
            key: "permission",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />

        <Select
          label="Library"
          disabled={objectData !== null}
          labelDescription="This is the library where your live stream object will be created."
          required={true}
          options={
            Object.keys(dataStore.libraries || {}).map(libraryId => (
              {
                label: dataStore.libraries[libraryId].name || "",
                value: libraryId
              }
            ))
          }
          defaultOption={{
            value: "",
            label: "Select Library"
          }}
          value={basicFormData.libraryId}
          onChange={event => UpdateFormData({
            key: "libraryId",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />

        <AdvancedSection
          advancedData={advancedData}
          drmFormData={drmFormData}
          useAdvancedSettings={useAdvancedSettings}
          DrmUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: FORM_KEYS.DRM
          })}
          AdvancedUpdateCallback={({event, key, value}) => UpdateFormData({
            key,
            value: value ? value : event?.target?.value,
            formKey: FORM_KEYS.ADVANCED
          })}
          AdvancedSettingsCallback={setUseAdvancedSettings}
          objectProbed={objectData !== null}
          audioTracks={audioTracks}
          audioFormData={audioFormData}
          setAudioFormData={setAudioFormData}
          setShowProbeConfirmation={setShowProbeConfirmation}
          objectData={objectData}
          DisableProbeButton={() => {
            return !(
              basicFormData.url &&
              basicFormData.name &&
              basicFormData.libraryId
            );
          }}
        />

        <div style={{maxWidth: "200px"}}>
          { loading ? <Loader /> : null }
        </div>

        <div className="form__actions">
          <input disabled={isCreating} type="submit" value={isCreating ? "Submitting..." : "Save"} />
        </div>
      </form>
      <ProbeConfirmation
        show={showProbeConfirmation}
        url={basicFormData.url}
        CloseCallback={() => setShowProbeConfirmation(false)}
        ConfirmCallback={async () => {
          const {objectId, slug} = await editStore.InitLiveStreamObject({
            basicFormData,
            advancedData,
            drmFormData
          });

          await streamStore.ConfigureStream({objectId, slug});

          setObjectData({objectId, slug});

          notifications.show({
            title: "Probed stream",
            message: "Stream object was successfully created and probed"
          });
        }}
      />
    </div>
  );
});

export default Create;
