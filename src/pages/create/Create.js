import React, {useEffect, useState} from "react";
import {NumberInput, Radio, Select, TextInput} from "Components/Inputs";
import {dataStore, editStore} from "Stores";
import {observer} from "mobx-react";
import Accordion from "Components/Accordion";
import {useNavigate} from "react-router-dom";
import {Loader} from "Components/Loader";

const FORM_KEYS = {
  BASIC: "BASIC",
  OUTPUT: "OUTPUT",
  INPUT: "INPUT",
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
  const options = [
    {value: "drm-public", label: "DRM - Public Access", title: "Playout Formats - Dash Widevine, HLS Sample AES, HLS AES-128"},
    {value: "drm-all", label: "DRM - All Formats", title: "Playout Formats - Dash Widevine, HLS Sample AES, HLS AES-128, HLS Fairplay"},
    {value: "drm-restricted", label: "DRM - Widevine and Fairplay", title: "Playout Formats - Dash Widevine, HLS Fairplay"},
    {value: "clear", label: "Clear", title: "Playout Formats - HLS Clear"}
  ];

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
        options.map(({label, title, value}) =>
          <div key={`encryption-info-${value}`} className="form__tooltip-item">
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
  DrmUpdateCallback
}) => {
  return (
    <Accordion
      title="Advanced Settings"
      id="advanced-section"
    >
      <Radio
        label="Audio/Video Properties"
        options={[
          {
            optionLabel: "Default",
            id: "default",
            value: "DEFAULT",
            checked: advancedData.avProperties === "DEFAULT",
            onChange: (event) => AdvancedUpdateCallback({
              key: "avProperties",
              event
            })
          },
          {
            optionLabel: "Custom",
            id: "custom",
            value: "CUSTOM",
            checked: advancedData.avProperties === "CUSTOM",
            onChange: (event) => AdvancedUpdateCallback({
              key: "avProperties",
              event
            })
          }
        ]}
      />

      {
        advancedData.avProperties === "CUSTOM" &&
        <>
          <Select
            label="Retention"
            labelDescription="Select a retention period for how long stream parts will exist until they are removed from the fabric."
            formName="playbackEncryption"
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
  );
});

const Create = observer(() => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataStore.LoadAccessGroups(),
      dataStore.LoadLibraries()
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
    retention: 3600,
    avProperties: "DEFAULT"
  });

  const [drmFormData, setDrmFormData] = useState({
    encryption: "DRM"
  });

  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const urls = basicFormData.protocol === "custom" ?
    [] :
    Object.keys(dataStore.liveStreamUrls || {})
      .filter(url => dataStore.liveStreamUrls[url].protocol === basicFormData.protocol && !dataStore.liveStreamUrls[url].active);

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
      await editStore.InitLiveStreamObject({
        basicFormData,
        inputFormData,
        outputFormData,
        advancedData,
        drmFormData
      });

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
              id: "custom",
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

        <AdvancedSection
          inputFormData={inputFormData}
          outputFormData={outputFormData}
          advancedData={advancedData}
          drmFormData={drmFormData}
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
          AdvancedUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: FORM_KEYS.ADVANCED
          })}
        />

        <div style={{maxWidth: "200px"}}>
          { loading ? <Loader /> : null }
        </div>

        <div className="form__actions">
          <input disabled={isCreating} type="submit" value={isCreating ? "Submitting..." : "Create"} />
        </div>
      </form>
    </div>
  );
});

export default Create;
