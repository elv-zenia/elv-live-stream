import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {dataStore, editStore, streamStore} from "Stores";
import {NumberInput, Radio, Select, TextInput} from "Components/Inputs";
import Accordion from "Components/Accordion";
import {useNavigate} from "react-router-dom";
import {Loader} from "Components/Loader";
import {ENCRYPTION_OPTIONS} from "Data/StreamData";
import {Alert} from "@mantine/core";
import {IconAlertCircle} from "@tabler/icons-react";
import ConfirmModal from "Components/ConfirmModal";
import CreateAudioTracksTable from "Pages/create/CreateAudioTracksTable";

const FORM_KEYS = {
  BASIC: "BASIC",
  OUTPUT: "OUTPUT",
  INPUT: "INPUT",
  ADVANCED: "ADVANCED",
  DRM: "DRM"
};

const ProbeConfirmation = observer(({
  show,
  CloseCallback,
  basicFormData,
  inputFormData,
  outputFormData,
  advancedData,
  drmFormData,
  useAdvancedSettings,
  setObjectData
}) => {
  return (
    <ConfirmModal
      show={show}
      CloseCallback={CloseCallback}
      title="Create and Probe Stream"
      message="Are you sure you want to probe the stream? This will also create the content object."
      ConfirmCallback={async () => {
        try {
          const {objectId, slug} = await editStore.InitLiveStreamObject({
            basicFormData,
            inputFormData,
            outputFormData,
            advancedData,
            drmFormData,
            useAdvancedSettings
          });

          await streamStore.ConfigureStream({objectId, slug});

          setObjectData({objectId, slug});
        } catch(error) {
          console.error("Unable to probe stream", error);
          throw Error(error);
        } finally {
          CloseCallback();
        }
      }}
    />
  );
});

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
  outputFormData,
  OutputUpdateCallback,
  inputFormData,
  InputUpdateCallback,
  advancedData,
  AdvancedUpdateCallback,
  drmFormData,
  DrmUpdateCallback,
  useAdvancedSettings,
  AdvancedSettingsCallback,
  objectProbed=false,
  objectLadderSpecs,
  audioFormData,
  setAudioFormData
}) => {
  return (
    <>
      {
        !objectProbed &&
        <Alert variant="light" color="blue" mt={24} icon={<IconAlertCircle />}>
          To apply advanced settings, object must be probed first.
        </Alert>
      }
      <Accordion
        title="Advanced Settings"
        id="advanced-section"
        value={useAdvancedSettings}
        onValueChange={AdvancedSettingsCallback}
        // disabled={!objectProbed}
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

            <div className="form__section-header">Audio Output</div>
            <CreateAudioTracksTable
              objectLadderSpecs={objectLadderSpecs}
              audioFormData={audioFormData}
              setAudioFormData={setAudioFormData}
            />
            <Select
              label="Channel Layout"
              options={[
                {label: "Stereo (2)", value: 2},
                {label: "Surround (5.1)", value: 6}
              ]}
              onChange={(event) => OutputUpdateCallback({
                key: "audioChannelLayout",
                event
              })}
            />
            <Select
              label="Bitrate"
              value={outputFormData.audioBitrate}
              options={[
                {label: "128000", value: "128000"},
                {label: "192000", value: "192000"},
                {label: "256000", value: "256000"},
                {label: "384000", value: "384000"}
              ]}
              onChange={(event) => OutputUpdateCallback({
                key: "audioBitrate",
                event
              })}
            />

            <div className="form__section-header">Audio Input</div>
            <NumberInput
              label="Stream Index"
              min={0}
              value={inputFormData.audioStreamIndex}
              onChange={(event) => InputUpdateCallback({
                key: "audioStreamIndex",
                event
              })}
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
    displayName: "",
    libraryId: "",
    accessGroup: "",
    permission: "editable"
  });

  const [outputFormData, setOutputFormData] = useState({
    videoHeight: "",
    videoWidth: "",
    videoBitrate: "",
    audioChannelLayout: 2,
    audioBitrate: 128000
  });

  const [inputFormData, setInputFormData] = useState({
    videoStreamId: "0",
    videoStreamIndex: "0",
    audioStreamId: "0",
    audioStreamIndex: "0"
  });

  const [advancedData, setAdvancedData] = useState({
    retention: 3600
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
  const [objectLadderSpecs, setObjectLadderSpecs] = useState([]);

  const urls = basicFormData.protocol === "custom" ?
    [] :
    Object.keys(dataStore.liveStreamUrls || {})
      .filter(url => dataStore.liveStreamUrls[url].protocol === basicFormData.protocol && !dataStore.liveStreamUrls[url].active);

  useEffect(() => {
    const LoadConfigData = async () => {
      const ladderSpecs = await dataStore.LoadProbeStreamData({
        objectId: objectData.objectId,
        audioOnly: true
      });

      // Initialize audio track form data
      const formData = {};
      ladderSpecs.forEach(spec => {
        formData[spec.stream_index] = {
          tags: "",
          codec: "",
          record: true,
          recording_bitrate: 192000,
          recording_channels: spec.channels,
          playout: true,
          playout_label: spec.stream_label,
          stream_index: spec.stream_index
        };
      });

      setObjectLadderSpecs(ladderSpecs);

      setAudioFormData(formData);
    };

    LoadConfigData();
  }, [objectData, streamStore.streams]);

  const UpdateFormData = ({formKey, key, value}) => {
    const FORM_MAP = {
      "BASIC": {
        data: basicFormData,
        callback: setBasicFormData
      },
      "OUTPUT": {
        data: outputFormData,
        callback: setOutputFormData
      },
      "INPUT": {
        data: inputFormData,
        callback: setInputFormData
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
      if(objectData === null) {
        await editStore.InitLiveStreamObject({
          basicFormData,
          inputFormData,
          outputFormData,
          advancedData,
          drmFormData,
          useAdvancedSettings
        });
      } else {
        // await streamStore.Con
      }

      navigate("/streams");
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
          label="Display Name"
          value={basicFormData.displayName}
          onChange={event => UpdateFormData({
            key: "displayName",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />

        <Select
          label="Access Group"
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

        <button className="button__secondary" type="button" onClick={() => setShowProbeConfirmation(true)} disabled={objectData !== null}>
          Probe
        </button>

        <AdvancedSection
          inputFormData={inputFormData}
          outputFormData={outputFormData}
          advancedData={advancedData}
          drmFormData={drmFormData}
          useAdvancedSettings={useAdvancedSettings}
          DrmUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: FORM_KEYS.DRM
          })}
          InputUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: FORM_KEYS.INPUT
          })}
          OutputUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: FORM_KEYS.OUTPUT
          })}
          AdvancedUpdateCallback={({event, key, value}) => UpdateFormData({
            key,
            value: value ? value : event?.target?.value,
            formKey: FORM_KEYS.ADVANCED
          })}
          AdvancedSettingsCallback={setUseAdvancedSettings}
          objectProbed={objectData !== null}
          objectLadderSpecs={objectLadderSpecs}
          audioFormData={audioFormData}
          setAudioFormData={setAudioFormData}
        />

        <div style={{maxWidth: "200px"}}>
          { loading ? <Loader /> : null }
        </div>

        <div className="form__actions">
          <input disabled={isCreating} type="submit" value={isCreating ? "Submitting..." : objectData === null ? "Create" : "Save"} />
        </div>
      </form>
      <ProbeConfirmation
        show={showProbeConfirmation}
        CloseCallback={() => setShowProbeConfirmation(false)}
        basicFormData={basicFormData}
        inputFormData={inputFormData}
        outputFormData={outputFormData}
        advancedData={advancedData}
        drmFormData={drmFormData}
        setObjectData={setObjectData}
      />
    </div>
  );
});

export default Create;
