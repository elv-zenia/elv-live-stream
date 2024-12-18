import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {dataStore, editStore, streamStore, rootStore} from "@/stores";
import {useNavigate} from "react-router-dom";
import {ENCRYPTION_OPTIONS, RETENTION_OPTIONS} from "@/utils/constants";
import {
  Accordion,
  Alert,
  Box,
  Button,
  Flex,
  Loader,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip
} from "@mantine/core";
import {IconAlertCircle} from "@tabler/icons-react";
import AudioTracksTable from "@/pages/create/audio-tracks-table/AudioTracksTable.jsx";
import {notifications} from "@mantine/notifications";
import styles from "./Create.module.css";
import ProbeConfirmation from "@/pages/ProbeConfirmation";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import ElvButton from "@/components/button/ElvButton.jsx";
import {CircleInfoIcon} from "@/assets/icons/index.js";

const FORM_KEYS = {
  BASIC: "BASIC",
  ADVANCED: "ADVANCED",
  DRM: "DRM"
};

const Permissions = observer(({permission, UpdateCallback}) => {
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
      value={permission}
      onChange={UpdateCallback}
      data={
        Object.keys(permissionLevels || {}).map(permissionName => (
          {
            label: permissionLevels[permissionName].short,
            value: permissionName
          }
        ))
      }
      mb={16}
    />
  );
});

const PlaybackEncryption = observer(({drmFormData, UpdateCallback}) => {
  return (
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
      value={drmFormData.encryption}
      onChange={value => UpdateCallback({event: {target: value}, key: "encryption"})}
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
  DisableProbeButton,
  ladderProfilesData,
  playoutProfile,
  setPlayoutProfile
}) => {
  return (
    <>
      <Accordion
        value={useAdvancedSettings}
        onValueChange={AdvancedSettingsCallback}
      >
        <Accordion.Item value="advanced-item">
          <Accordion.Control>Advanced Settings</Accordion.Control>
          <Accordion.Panel>
            <>
              <Select
                label="Retention"
                description="Select a retention period for how long stream parts will exist until they are removed from the fabric."
                name="retention"
                data={RETENTION_OPTIONS}
                defaultValue="86400"
                value={advancedData.retention}
                onChange={value => AdvancedUpdateCallback({
                  key: "retention",
                  event: {target: value}
                })
                }
                mb={16}
              />

              <Box mb={16}>
                <Select
                  label="Playout Ladder"
                  name="playoutLadder"
                  data={ladderProfilesData}
                  placeholder="Selet Ladder Profile"
                  mb={16}
                  // style={{width: "100%", marginBottom: "0"}}
                  description={ladderProfilesData.length > 0 ? null : "No profiles are configured. Create a profile in Settings."}
                  value={playoutProfile}
                  onChange={(value) => setPlayoutProfile(value)}
                />
              </Box>

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
          </Accordion.Panel>
        </Accordion.Item>
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
  const [playoutProfile, setPlayoutProfile] = useState("Default");

  const urls = basicFormData.protocol === "custom" ?
    [] :
    Object.keys(dataStore.liveStreamUrls || {})
      .filter(url => dataStore.liveStreamUrls[url].protocol === basicFormData.protocol && !dataStore.liveStreamUrls[url].active);

  const defaultOption = dataStore.ladderProfiles?.default ?
    {
      label: dataStore.ladderProfiles.default.name,
      value: dataStore.ladderProfiles.default.name
    } : {};
  const ladderProfilesData = dataStore.ladderProfiles ?
    [
      defaultOption,
      ...dataStore.ladderProfiles.custom.map(item => ({label: item.name, value: item.name}))
    ] : [];

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
      const {libraryId, url, name, description, displayTitle, accessGroup, permission, protocol} = basicFormData;
      const {retention} = advancedData;
      const {encryption} = drmFormData;
      let objectId;

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
    <PageContainer
      title="Create Live Stream"
      width="700px"
      className={(dataStore.tenantId && !rootStore.errorMessage) ? "" : styles.disabledContainer}
    >
      <form className="form" onSubmit={HandleSubmit}>
        <Radio.Group
          name="protocol"
          label="Streaming Protocol"
          description="Select a protocol to see available pre-allocated URLs."
          mb={16}
          value={basicFormData.protocol}
          onChange={(value) => {
            UpdateFormData({
              key: "protocol",
              value,
              formKey: FORM_KEYS.BASIC
            });
          }}
        >
          <Stack mt="xs">
            <Radio
              value="mpegts"
              label="MPEG-TS"
              description="Perfect for low-latency and interactive streams, widely used in live broadcasting applications."
            />
            <Radio
              value="rtmp"
              label="RTMP"
              description="Reliable for stable broadcasts, ensuring high-quality video and audio transmission."
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
          basicFormData.protocol === "custom" &&
          <TextInput
            label="URL"
            name="url"
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
            name="url"
            required={true}
            disabled={objectData !== null}
            defaultValue={urls[0]}
            data={urls.map(url => (
              {
                label: url,
                value: url
              }
            ))}
            placeholder="Select URL"
            onChange={value => UpdateFormData({
              key: "url",
              value,
              formKey: FORM_KEYS.BASIC
            })}
            mb={16}
          />
        }
        <TextInput
          label="Name"
          name="name"
          required={true}
          value={basicFormData.name}
          mb={16}
          onChange={event => UpdateFormData({
            key: "name",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />
        <TextInput
          label="Description"
          name="description"
          value={basicFormData.description}
          mb={16}
          onChange={event => UpdateFormData({
            key: "description",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
        />
        <TextInput
          label="Display Title"
          name="displayTitle"
          value={basicFormData.displayTitle}
          mb={16}
          onChange={event => UpdateFormData({
            key: "displayTitle",
            value: event.target.value,
            formKey: FORM_KEYS.BASIC
          })}
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
          onChange={value => UpdateFormData({
            key: "accessGroup",
            value,
            formKey: FORM_KEYS.BASIC
          })}
          mb={16}
        />

        <Permissions
          permission={basicFormData.permission}
          UpdateCallback={(value) => UpdateFormData({
            key: "permission",
            value,
            formKey: FORM_KEYS.BASIC
          })}
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
          value={basicFormData.libraryId}
          onChange={value => UpdateFormData({
            key: "libraryId",
            value,
            formKey: FORM_KEYS.BASIC
          })}
          mb={16}
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
          ladderProfilesData={ladderProfilesData}
          playoutProfile={playoutProfile}
          setPlayoutProfile={setPlayoutProfile}
          DisableProbeButton={() => {
            return !(
              basicFormData.url &&
              basicFormData.name &&
              basicFormData.libraryId
            );
          }}
        />

        <div style={{maxWidth: "200px"}}>
          {
            loading ?
              (
                <Flex mt={8}>
                  <Loader size="md" />
                </Flex>
              ) : null
          }
        </div>

        <Box mt="2rem" mb="2.5rem">
          <ElvButton disabled={isCreating} type="submit">
            { isCreating ? "Submitting..." : "Save" }
          </ElvButton>
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
