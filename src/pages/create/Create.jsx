import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {observer} from "mobx-react-lite";

import {dataStore, editStore, streamStore, rootStore} from "@/stores";
import {CircleInfoIcon, CollapseIcon} from "@/assets/icons";
import styles from "./CreatePage.module.css";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import AudioTracksTable from "@/pages/create/audio-tracks-table/AudioTracksTable.jsx";
import {ENCRYPTION_OPTIONS, RETENTION_OPTIONS} from "@/utils/constants";

import {
  Accordion,
  AccordionControl,
  Alert,
  Box,
  Button,
  Flex,
  Loader,
  Radio,
  Select,
  Stack,
  Text,
  TextInput, Title,
  Tooltip
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";
import {IconAlertCircle} from "@tabler/icons-react";
import ConfirmModal from "@/components/confirm-modal/ConfirmModal.jsx";

const FORM_KEYS = {
  BASIC: "BASIC",
  ADVANCED: "ADVANCED",
  DRM: "DRM"
};

const Permissions = observer(({form}) => {
  const permissionLevels = rootStore.client.permissionLevels;

  return (
    <Select
      label={
        <Flex align="center" gap={6}>
          Permission
          <Tooltip
            multiline
            w={460}
            label={
              Object.values(rootStore.client.permissionLevels).map(({short, description}) =>
                <Flex
                  key={`permission-info-${short}`}
                  gap="1rem"
                  lh={1.25}
                  pb={5}
                >
                  <Flex flex="0 0 25%">{ short }:</Flex>
                  <Text fz="sm">{ description }</Text>
                </Flex>
              )
            }
          >
            <Flex w={16}>
              <CircleInfoIcon color="var(--mantine-color-elv-gray-8)" />
            </Flex>
          </Tooltip>
        </Flex>
      }
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

const AdvancedSettingsPanel = observer(({
  objectProbed=false,
  audioTracks,
  audioFormData,
  setAudioFormData,
  setShowProbeConfirmation,
  objectData,
  DisableProbeButton,
  form
}) => {
  return (
    <>
      <Select
        label="Retention"
        description="Select a retention period to specify how long stream parts will remain in the fabric before being removed."
        name="retention"
        data={RETENTION_OPTIONS}
        defaultValue="86400"
        mb={16}
        {...form.getInputProps("retention")}
      />
      <Select
        label={
          <Flex align="center" gap={6}>
            Playback Encryption
            <Tooltip
              multiline
              w={460}
              label={
                ENCRYPTION_OPTIONS.map(({label, title, id}) =>
                  <Flex
                    key={`encryption-info-${id}`}
                    gap="1rem"
                    lh={1.25}
                    pb={5}
                  >
                    <Flex flex="0 0 35%">{ label }:</Flex>
                    <Text fz="sm">{ title }</Text>
                  </Flex>
                )
              }
            >
              <Flex w={16}>
                <CircleInfoIcon color="var(--mantine-color-elv-gray-8)" />
              </Flex>
            </Tooltip>
          </Flex>
        }
        description="Select a playback encryption option. Enable Clear or Digital Rights Management (DRM) copy protection during playback."
        name="playbackEncryption"
        data={ENCRYPTION_OPTIONS}
        placeholder="Selet Encryption"
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
            wrapper: styles.alertRoot
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
      <Title order={3} c="elv-gray.8">Audio</Title>
      <AudioTracksTable
        records={audioTracks}
        audioFormData={audioFormData}
        setAudioFormData={setAudioFormData}
        disabled={!objectProbed}
      />
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

  const [useAdvancedSettings, setUseAdvancedSettings] = useState("");

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

  const HandleProbeConfirm = async () => {
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
  };

  const HandleSubmit = async () => {
    // TODO: Parse input values as integer when appropriate
    // TODO: I.e., Retention
    setIsCreating(true);

    try {
      let objectId;
      const {accessGroup, description, displayTitle, playbackEncryption: encryption, libraryId, name, permission, protocol, retention, url} = form.getValues();

      if(objectData === null) {
        const response = await editStore.InitLiveStreamObject({
          accessGroup,
          description,
          displayTitle,
          encryption,
          libraryId,
          name,
          permission,
          protocol,
          retention: retention ? parseInt(retention) : null,
          url
        });

        objectId = response.objectId;
      } else {
        objectId = objectData.objectId;
        await editStore.UpdateLiveStreamObject({
          objectId,
          slug: objectData.slug,
          audioFormData,
          accessGroup,
          description,
          displayTitle,
          encryption,
          libraryId,
          name,
          protocol,
          retention: retention ? parseInt(retention) : null,
          url
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
          description="Select a protocol to see available pre-allocated URLs."
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
              description="Enter a custom URL."
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
          description="Select an Access Group to manage your live stream object."
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
          description="Select the library where your live stream object will be created."
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

        <Accordion
          value={useAdvancedSettings}
          onChange={setUseAdvancedSettings}
          chevron={<CollapseIcon />}
        >
          <Accordion.Item value="advanced-item">
            <AccordionControl>Advanced Settings</AccordionControl>
            <Accordion.Panel>
              <AdvancedSettingsPanel
                advancedData={advancedData}
                drmFormData={drmFormData}
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
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <div style={{maxWidth: "200px"}}>
          {
            loading ?
              (
                <Flex justify="center" m="16 0">
                  <Loader />
                </Flex>
              ) : null
          }
        </div>

        <Box mt="2rem" mb="2.5rem">
          <Button disabled={isCreating} type="submit">
            { isCreating ? "Submitting..." : "Save" }
          </Button>
        </Box>
      </form>
      <ConfirmModal
        show={showProbeConfirmation}
        CloseCallback={() => setShowProbeConfirmation(false)}
        title="Create and Probe Stream"
        message="Are you sure you want to probe the stream? This will also create the content object."
        loadingText={`Please send your stream to ${basicFormData.url || "the URL you specified"}.`}
        ConfirmCallback={async () => {
          try {
            await HandleProbeConfirm();
            setShowProbeConfirmation(false);
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error("Unable to probe stream", error);
            throw Error(error);
          }
        }}
      />
    </PageContainer>
  );
});

export default Create;
