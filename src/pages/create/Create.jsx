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
import {isNotEmpty, useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";
import {IconAlertCircle} from "@tabler/icons-react";
import ConfirmModal from "@/components/confirm-modal/ConfirmModal.jsx";
import {ValidateTextField} from "@/utils/validators.js";

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
        name="encryption"
        data={ENCRYPTION_OPTIONS}
        mb={16}
        {...form.getInputProps("encryption")}
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [objectData, setObjectData] = useState(null);

  useEffect(() => {
    Promise.all([
      dataStore.LoadStreamUrls(),
      dataStore.LoadAccessGroups(),
      dataStore.LoadLibraries()
    ])
      .finally(() => setLoading(false));
  }, []);

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

  // Controlled form values that need state variables
  const [protocol, setProtocol] = useState("mpegts");

  const [useAdvancedSettings, setUseAdvancedSettings] = useState("");
  const [showProbeConfirmation, setShowProbeConfirmation] = useState(false);
  const [audioFormData, setAudioFormData] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      accessGroup: "",
      description: "",
      displayTitle: "",
      encryption: "",
      libraryId: "",
      name: "",
      protocol: "mpegts",
      permission: "editable",
      retention: "86400",
    },
    validate: {
      name: isNotEmpty("Enter a name"),
      url: protocol !== "custom" ? isNotEmpty("Select a URL") : null,
      customUrl: protocol === "custom" ? isNotEmpty("Enter a URL") : null,
      libraryId: isNotEmpty("Select a library"),
      description: (value) => ValidateTextField({value, key: "Description"}),
      displayTitle: (value) => ValidateTextField({value, key: "Display Title"})
    }
  });

  const urls = protocol === "custom" ?
    [] :
    Object.keys(dataStore.liveStreamUrls || {})
      .filter(url => dataStore.liveStreamUrls[url].protocol === protocol && !dataStore.liveStreamUrls[url].active);

  const HandleProbeConfirm = async () => {
    const {accessGroup, description, displayTitle, encryption, libraryId, name, permission, protocol, retention, url: urlValue, customUrl} = form.getValues();

    const url = protocol === "custom" ? customUrl : urlValue;

    const {objectId, slug} = await editStore.InitLiveStreamObject({
      accessGroup,
      description,
      displayTitle,
      encryption,
      libraryId,
      name,
      permission,
      protocol,
      retention,
      url
    });

    await streamStore.ConfigureStream({objectId, slug});

    setObjectData({objectId, slug});

    notifications.show({
      title: "Probed stream",
      message: "Stream object was successfully created and probed"
    });
  };

  const HandleSubmit = async () => {
    setIsCreating(true);

    try {
      let objectId;
      const {accessGroup, description, displayTitle, encryption, libraryId, name, permission, protocol, retention, url: urlValue, customUrl} = form.getValues();

      const url = customUrl || urlValue;

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
          protocol === "custom" ?
            (
              <TextInput
                label="URL"
                name="customUrl"
                disabled={objectData !== null}
                mb={16}
                {...form.getInputProps("customUrl")}
                withAsterisk={protocol === "custom"}
              />
            ) :
            (
              <Select
                label="URL"
                name="url"
                disabled={objectData !== null}
                data={urls.map(url => (
                  {
                    label: url,
                    value: url
                  }
                ))}
                mb={16}
                {...form.getInputProps("url")}
                withAsterisk={protocol !== "custom"}
              />
            )
        }
        <TextInput
          label="Name"
          name="name"
          mb={16}
          withAsterisk
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
          data={
            Object.keys(dataStore.libraries || {}).map(libraryId => (
              {
                label: dataStore.libraries[libraryId].name || "",
                value: libraryId
              }
            ))
          }
          mb={16}
          withAsterisk
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
                objectProbed={objectData !== null}
                audioTracks={audioTracks}
                audioFormData={audioFormData}
                setAudioFormData={setAudioFormData}
                setShowProbeConfirmation={setShowProbeConfirmation}
                objectData={objectData}
                DisableProbeButton={() => {
                  const {libraryId, name, url: urlValue, customUrl} = form.getValues();
                  const url = customUrl || urlValue;

                  return !(
                    url &&
                    name &&
                    libraryId
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
        loadingText={`Please send your stream to ${form.getValues().customUrl || form.getValues().url || "the URL you specified"}.`}
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
