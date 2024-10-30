import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {dataStore, editStore, streamStore, rootStore} from "@/stores";
import Accordion from "@/components/Accordion.jsx";
import {useNavigate} from "react-router-dom";
import {Loader} from "@/components/Loader.jsx";
import {ENCRYPTION_OPTIONS, RETENTION_OPTIONS} from "@/utils/constants";
import {Alert, Box, Button, Flex, Radio, Select, Stack, Text, TextInput} from "@mantine/core";
import {IconAlertCircle} from "@tabler/icons-react";
import AudioTracksTable from "@/pages/create/audio-tracks-table/AudioTracksTable.jsx";
import {notifications} from "@mantine/notifications";
import classes from "@/assets/stylesheets/modules/CreatePage.module.css";
import ProbeConfirmation from "@/pages/ProbeConfirmation";
import {useForm} from "@mantine/form";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import AdvancedSelect from "@/components/advanced-select/AdvancedSelect.jsx";

const FORM_KEYS = {
  BASIC: "BASIC",
  ADVANCED: "ADVANCED",
  DRM: "DRM"
};

const Permissions = observer(({form}) => {
  const permissionLevels = rootStore.client.permissionLevels;

  return (
    <AdvancedSelect
      label="Permission"
      description="Set a permission level."
      name="permission"
      placeholder="Select Permission"
      data={
        Object.keys(permissionLevels || {}).map(permissionName => (
          {
            label: permissionLevels[permissionName].short,
            value: permissionName,
            description: permissionLevels[permissionName].description
          }
        ))
      }
      SetValue={(value) => form.setFieldValue("permission", value)}
      value={form.getValues().permission}
      mb={16}
      {...form.getInputProps("permission")}
    />
  );
});

const AdvancedSection = observer(({
  AdvancedSettingsCallback,
  objectProbed=false,
  audioTracks,
  audioFormData,
  setAudioFormData,
  setShowProbeConfirmation,
  objectData,
  useAdvancedSettings,
  DisableProbeButton,
  form
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
              description="Select a retention period for how long stream parts will exist until they are removed from the fabric."
              name="retention"
              data={RETENTION_OPTIONS}
              defaultValue="86400"
              mb={16}
            />
            <Select
              label="Playback Encryption"
              description="Select a playback encryption option. Enable Clear or Digital Rights Management (DRM) copy protection during playback."
              name="playbackEncryption"
              data={ENCRYPTION_OPTIONS}
              placeholder="Selet Encryption"
              // value={drmFormData.encryption}
              // onChange={event => UpdateCallback({event, key: "encryption"})}
              tooltip={
                ENCRYPTION_OPTIONS.map(({label, title, id}) =>
                  <div key={`encryption-info-${id}`} className="form__tooltip-item">
                    <div className="form__tooltip-item__encryption-title">{ label }:</div>
                    <div>{ title }</div>
                  </div>
                )
              }
              mb={16}
              {...form.getInputProps("playbackEncryption")}
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
      dataStore.LoadStreamUrls(),
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
    displayTitle: "",
    libraryId: "",
    accessGroup: "",
    permission: "editable"
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      protocol: "mpegts"
    },
    validate: {
      name: (value) => /^.{3,}$/.test(value) ? null : "Name must have at least 3 characters."
    }
  });

  const [protocol, setProtocol] = useState("mpegts");

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

  const urls = protocol === "custom" ?
    [] :
    Object.keys(dataStore.liveStreamUrls || {})
      .filter(url => dataStore.liveStreamUrls[url].protocol === protocol && !dataStore.liveStreamUrls[url].active);

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

  const HandleSubmit = async () => {
    // TODO: Parse input values as integer when appropriate
    // TODO: I.e., Retention
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
    <PageContainer className={`create-form-container ${!dataStore.tenantId ? "create-form-container--disabled" : ""}`} title="Create Live Stream" width="700px">
      <form onSubmit={form.onSubmit(HandleSubmit)}>
        <Radio.Group
          name="protocol"
          label="Streaming Protocol"
          description="Choose a protocol based on your streaming needs:"
          mb={16}
          value={protocol}
          onChange={(value) => {
            setProtocol(value);
            form.setFieldValue("url", undefined);
          }}
        >
          <Stack mt="xs">
            <Radio
              value="mpegts"
              label="MPEG-TS"
              description="Reliable for stable broadcasts, ensuring high-quality video and audio transmission."
            />
            <Radio
              value="rtmp"
              label="RTMP"
              description="Perfect for low-latency and interactive streams, widely used in live broadcasting applications."
            />
            <Radio
              value="srt"
              label="SRT"
              description="Secure and adaptive, ideal for streaming over unpredictable networks with error recovery features."
            />
            <Radio
              value="custom"
              label="Custom"
              description="Enter a custom streaming URL."
            />
          </Stack>
        </Radio.Group>
        {
          protocol === "custom" &&
          <TextInput
            label="URL"
            name="customUrl"
            required={protocol === "custom"}
            disabled={objectData !== null}
            {...form.getInputProps("customUrl")}
          />
        }
        {
          protocol !== "custom" &&
          <Select
            label="URL"
            name="url"
            required={true}
            placeholder="Select URL"
            disabled={objectData !== null}
            // defaultValue={urls[0]}
            value={form.values.url}
            data={urls.map(url => (
              {
                label: url,
                value: url
              }
            ))}
            mb={16}
            {...form.getInputProps("url")}
          />
        }
        <TextInput
          label="Name"
          name="name"
          required={true}
          mb={16}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Description"
          name="description"
          mb={16}
          {...form.getInputProps("description")}
        />
        <TextInput
          label="Display Title"
          name="displayTitle"
          mb={16}
          {...form.getInputProps("displayTitle")}
        />

        <Select
          label="Access Group"
          name="accessGroup"
          disabled={objectData !== null}
          description="This is the Access Group that will manage your live stream object."
          data={
            Object.keys(dataStore.accessGroups || {}).map(accessGroupName => (
              {
                label: accessGroupName,
                value: accessGroupName
              }
            ))
          }
          placeholder="Select Access Group"
          mb={16}
          {...form.getInputProps("accessGroup")}
        />

        <Permissions
          form={form}
        />

        <Select
          label="Library"
          name="libraryId"
          disabled={objectData !== null}
          description="This is the library where your live stream object will be created."
          required={true}
          data={
            Object.keys(dataStore.libraries || {}).map(libraryId => (
              {
                label: dataStore.libraries[libraryId].name || "",
                value: libraryId
              }
            ))
          }
          placeholder="Select Library"
          mb={16}
          {...form.getInputProps("libraryId")}
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
          form={form}
        />

        <div style={{maxWidth: "200px"}}>
          { loading ? <Loader /> : null }
        </div>

        <Box mt="2rem" mb="2.5rem">
          <input disabled={isCreating} type="submit" value={isCreating ? "Submitting..." : "Save"} />
        </Box>
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
    </PageContainer>
  );
});

export default Create;
