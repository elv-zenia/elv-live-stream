import React, {useState} from "react";
import {NumberInput, Radio, Select, TextInput} from "Components/Inputs";
import {streamStore} from "../../stores";
import {observer} from "mobx-react";
import Accordion from "Components/Accordion";

const formKeys = {
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
          <TextInput
            label="Retention"
            value={advancedData.retention}
            onChange={(event) => AdvancedUpdateCallback({
              key: "avProperties",
              event
            })}
          />
          <PlaybackEncryption
            drmFormData={drmFormData}
            UpdateCallback={({event, key}) => DrmUpdateCallback({
              key,
              event
            })}
          />

          {/* Output */}
          <div className="form__section-header">Video Output</div>
          <NumberInput
            label="Height"
            value={outputFormData.videoHeight}
            onChange={(event) => OutputUpdateCallback({
              key: "videoHeight",
              event
            })}
          />
          <NumberInput
            label="Width"
            value={outputFormData.videoWidth}
            onChange={(event) => OutputUpdateCallback({
              key: "videoWidth",
              event
            })}
          />
          <NumberInput
            label="Bitrate"
            value={outputFormData.videoBitrate}
            onChange={(event) => OutputUpdateCallback({
              key: "videoBitrate",
              event
            })}
          />

          <div className="form__section-header">Audio Output</div>
          <Select
            label="Channel Layout"
            options={[
              {label: "Stereo (2)", value: "Stereo (2)"},
              {label: "Surround (5.1)", value: "Surround (5.1)"}
            ]}
            onChange={(event) => OutputUpdateCallback({
              key: "audioChannelLayout",
              event
            })}
          />
          <NumberInput
            label="Bitrate"
            value={outputFormData.audioBitrate}
            onChange={(event) => OutputUpdateCallback({
              key: "audioBitrate",
              event
            })}
          />

          {/* Input */}
          <div className="form__section-header">Video Input</div>
          <NumberInput
            label="Stream ID"
            value={inputFormData.videoStreamId}
            onChange={(event) => InputUpdateCallback({
              key: "videoStreamId",
              event
            })}
          />
          <NumberInput
            label="Stream Index"
            value={inputFormData.videoStreamIndex}
            onChange={(event) => InputUpdateCallback({
              key: "videoStreamIndex",
              event
            })}
          />

          <div className="form__section-header">Audio Input</div>
          <NumberInput
            label="Stream ID"
            value={inputFormData.audioStreamId}
            onChange={(event) => InputUpdateCallback({
              key: "audioStreamId",
              event
            })}
          />
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
  const [basicFormData, setBasicFormData] = useState({
    streamType: "RTMP",
    url: "",
    name: "",
    description: "",
    displayName: "",
    libraryId: "",
    accessGroup: "",
    permission: ""
  });

  const [outputFormData, setOutputFormData] = useState({
    videoHeight: "",
    videoWidth: "",
    videoBitrate: "",
    audioChannelLayout: "",
    audioBitrate: ""
  });

  const [inputFormData, setInputFormData] = useState({
    videoStreamId: "0",
    videoStreamIndex: "0",
    audioStreamId: "0",
    audioStreamIndex: "0"
  });

  const [advancedData, setAdvancedData] = useState({
    retention: "",
    avProperties: "DEFAULT"
  });

  const [drmFormData, setDrmFormData] = useState({
    encryption: "DRM"
  });

  const UpdateFormData = ({formKey, key, value}) => {
    const formMap = {
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
    const {data, callback} = formMap[formKey];
    const newData = Object.assign({}, data);
    newData[key] = value;

    callback(newData);
  };

  const HandleSubmit = () => {};

  return (
    <div>
      <div className="page-header">Create Live Stream</div>
      <form className="form" onSubmit={HandleSubmit}>
        <Select
          label="Stream Type"
          options={[
            {
              label: "RTMP",
              value: "RTMP"
            }
          ]}
          onChange={event => UpdateFormData({
            key: "streamType",
            value: event.target.value,
            formKey: formKeys.BASIC
          })}
        />
        <TextInput
          label="URL"
          required={true}
          value={basicFormData.url}
          onChange={event => UpdateFormData({
            key: "url",
            value: event.target.value,
            formKey: formKeys.BASIC
          })}
        />
        <TextInput
          label="Name"
          required={true}
          value={basicFormData.name}
          onChange={event => UpdateFormData({
            key: "name",
            value: event.target.value,
            formKey: formKeys.BASIC
          })}
        />
        <TextInput
          label="Description"
          value={basicFormData.description}
          onChange={event => UpdateFormData({
            key: "description",
            value: event.target.value,
            formKey: formKeys.BASIC
          })}
        />
        <TextInput
          label="Display Name"
          value={basicFormData.displayName}
          onChange={event => UpdateFormData({
            key: "displayName",
            value: event.target.value,
            formKey: formKeys.BASIC
          })}
        />

        <Select
          label="Access Group"
          labelDescription="This is the Access Group that will manage your live stream object."
          options={
            Object.keys(streamStore.accessGroups || {}).map(accessGroupName => (
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
            formKey: formKeys.BASIC
          })}
        />

        <Permissions
          permission={basicFormData.permission}
          UpdateCallback={(event) => UpdateFormData({
            key: "permission",
            value: event.target.value,
            formKey: formKeys.BASIC
          })}
        />

        <Select
          label="Library"
          labelDescription="This is the library where your live stream object will be created."
          required={true}
          options={
            Object.keys(streamStore.libraries || {}).map(libraryId => (
              {
                label: streamStore.libraries[libraryId].name || "",
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
            formKey: formKeys.BASIC
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
            formKey: formKeys.DRM
          })}
          InputUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: formKeys.INPUT
          })}
          OutputUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: formKeys.OUTPUT
          })}
          AdvancedUpdateCallback={({event, key}) => UpdateFormData({
            key,
            value: event.target.value,
            formKey: formKeys.ADVANCED
          })}
        />

        <div className="form__actions">
          <input type="submit" value="Create" />
        </div>
      </form>
    </div>
  );
});

export default Create;
