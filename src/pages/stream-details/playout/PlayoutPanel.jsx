import {cloneElement, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import path from "path";
import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Box, Button,
  Checkbox,
  FileButton,
  Flex,
  Group,
  Loader,
  Menu,
  Paper,
  Select,
  Text,
  Textarea, Title,
  Tooltip
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {DateTimePicker} from "@mantine/dates";
import {DEFAULT_WATERMARK_TEXT, DVR_DURATION_OPTIONS, STATUS_MAP} from "@/utils/constants";
import {editStore, streamStore} from "@/stores";
import {ENCRYPTION_OPTIONS} from "@/utils/constants";
import styles from "./PlayoutPanel.module.css";
import {CircleInfoIcon, EditIcon, TrashIcon} from "@/assets/icons";

const WatermarkBox = ({type, value, actions=[]}) => {
  if(value === undefined) { return null; }

  const placeholderText = (type === "Image" && !value) ? "No file selected" : undefined;

  return (
    <Paper shadow="none" withBorder p="10px 16px" mb={16} mt={16}>
      <Group>
        <Flex direction="column" mr={48}>
          <Text c="dimmed" size="xs">Watermark Type</Text>
          <Text lh={1.125}>{type}</Text>
        </Flex>
        <Flex direction="column" maw={300}>
          <Text c="dimmed" size="xs">Watermark Content</Text>
          <Text lh={1.125} truncate="end">
            {placeholderText || value}
          </Text>
        </Flex>
        <Group ml="auto">
          {
            actions.map(({id, Component}) => (
              cloneElement(Component, {key: id})
            ))
          }
        </Group>
      </Group>
    </Paper>
  );
};

const PlayoutPanel = observer(({
  status,
  slug,
  currentDrm,
  simpleWatermark,
  imageWatermark,
  title,
  currentDvrEnabled,
  currentDvrMaxDuration,
  currentDvrStartTime
}) => {
  const [drm, setDrm] = useState(currentDrm);
  // const [formDrm, setFormDrm] = useState(currentDrm ? currentDrm : undefined);
  const [formWatermarks, setFormWatermarks] = useState(
    {
      image: imageWatermark ? imageWatermark : undefined,
      text: simpleWatermark ? JSON.stringify(simpleWatermark, null, 2) : undefined
    }
  );
  const [showTextWatermarkInput, setShowTextWatermarkInput] = useState(false);
  const [dvrEnabled, setDvrEnabled] = useState(currentDvrEnabled || false);
  const [dvrStartTime, setDvrStartTime] = useState(currentDvrStartTime !== undefined ? new Date(currentDvrStartTime) : null);
  const [dvrMaxDuration, setDvrMaxDuration] = useState(currentDvrMaxDuration !== undefined ? currentDvrMaxDuration : "0");

  const [applyingChanges, setApplyingChanges] = useState(false);
  const resetRef = useRef(null);
  const params = useParams();

  const ClearImageWatermark = () => {
    const value = {
      text: formWatermarks.text,
      image: undefined
    };

    setFormWatermarks(value);
    resetRef.current?.();
  };

  const ClearTextWatermark = () => {
    const value = {
      text: undefined,
      image: formWatermarks.image
    };

    setFormWatermarks(value);
    setShowTextWatermarkInput(false);
  };

  const HandleSubmit = async () => {
    const objectId = params.id;

    try {
      setApplyingChanges(true);
      await streamStore.WatermarkConfiguration({
        existingTextWatermark: simpleWatermark,
        textWatermark: formWatermarks.text,
        existingImageWatermark: imageWatermark,
        imageWatermark: formWatermarks.image,
        objectId,
        slug,
        status
      });

      await streamStore.DrmConfiguration({
        objectId,
        slug,
        existingDrmType: currentDrm,
        drmType: drm
      });

      await editStore.UpdateConfigMetadata({
        objectId,
        slug,
        dvrEnabled,
        dvrMaxDuration,
        dvrStartTime
      });

      notifications.show({
        title: `${title || params.id} updated`,
        message: "Settings have been applied successfully"
      });
    } catch(error) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Unable to apply settings"
      });

      // eslint-disable-next-line no-console
      console.error("Unable to apply settings", error);
    } finally {
      setApplyingChanges(false);
    }
  };

  return (
    <Box w="700px">
      <Box data-disabled={![STATUS_MAP.INACTIVE, STATUS_MAP.UNINITIALIZED].includes(status)} mb="24px" className={styles.box}>
        <Title order={3} c="elv-gray.8">Playout</Title>
        <Select
          label={
            <Flex align="center" gap={6}>
              DRM
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
          name="playbackEncryption"
          data={ENCRYPTION_OPTIONS}
          style={{width: "100%"}}
          placeholder="Select DRM"
          value={drm}
          onChange={(value) => setDrm(value)}
        />
      </Box>

      <Box data-disabled={status !== STATUS_MAP.STOPPED} mb={24} className={styles.box}>
        <Title order={3} c="elv-gray.8">DVR</Title>

        <Box mb={24}>
          <Checkbox
              label="Enable DVR"
              checked={dvrEnabled}
              description="Users can seek back in the live stream."
              onChange={(event) => setDvrEnabled(event.target.checked)}
            />
        </Box>


        {
          dvrEnabled &&
          <>
            <Box mb={24}>
              <DateTimePicker
                label="Start Time"
                placeholder="Pick date and time"
                description="Users can only seek back to this point in time. Useful for event streams. If not set, users can seek to the beginning of the stream."
                value={dvrStartTime}
                onChange={setDvrStartTime}
                disabled={!dvrEnabled}
                valueFormat={"MM/DD/YYYY, HH:mm:ss A"}
                minDate={new Date()}
                w="100%"
                size="sm"
                clearable
                withSeconds
              />
            </Box>
            <Select
              label="Max Duration"
              description="Users are only able to seek back this many minutes. Useful for 24/7 streams and long events."
              name="maxDuration"
              data={DVR_DURATION_OPTIONS}
              style={{width: "100%"}}
              placeholder="Select Max Duration"
              value={dvrMaxDuration}
              onChange={(value) => setDvrMaxDuration(value)}
              disabled={!dvrEnabled}
            />
          </>
        }
      </Box>

      <Box mb="24px">
        <Group mb={16}>
          <Title order={3} c="elv-gray.8">Visible Watermark</Title>
        </Group>

        {/* Add WM button */}
        <Menu>
          <Menu.Target>
            <Button variant="outline">Add Watermark</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => {
              setFormWatermarks({
                text: formWatermarks.text,
                image: ""
              });
            }}>
              Image Watermark
            </Menu.Item>
            <Menu.Item onClick={() => {
              setFormWatermarks({
                text: JSON.stringify(DEFAULT_WATERMARK_TEXT, null, 2),
                image: formWatermarks.image
              });
            }}>
              Text Watermark
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <WatermarkBox
          value={formWatermarks.text ? formWatermarks.text : undefined}
          type="Text"
          actions={[
            {
              id: "text-edit",
              Component: (
                <ActionIcon
                  size={20}
                  variant="transparent"
                  color="gray"
                  onClick={() => setShowTextWatermarkInput(!showTextWatermarkInput)}
                >
                  <EditIcon />
                </ActionIcon>
              )
            },
            {
              id: "text-delete",
              Component: (
                <ActionIcon
                  size={20}
                  variant="transparent"
                  color="gray"
                  onClick={ClearTextWatermark}
                >
                  <TrashIcon />
                </ActionIcon>
              )
            }
          ]}
        />
        {
          showTextWatermarkInput &&
          <Textarea
            mb={16}
            value={formWatermarks.text}
            size="md"
            rows={10}
            onChange={(event) => {
              const value = {
                image: formWatermarks.image,
                text: event.target.value
              };

              setFormWatermarks(value);
            }}
          />
        }
        <WatermarkBox
          type="Image"
          value={formWatermarks.image === undefined ? undefined : (formWatermarks?.image === "" ? "" : path.basename(formWatermarks?.image?.name || formWatermarks?.image?.image?.["/"]))}
          actions={[
            {
              id: "image-edit",
              Component: (
                <FileButton
                  onChange={(file) => {
                    if(!file) { return; }
                    const value = {
                      ...formWatermarks,
                      image: file
                    };

                    setFormWatermarks(value);
                  }}
                  accept="image/*"
                  resetRef={resetRef}
                >
                  {(props) => (
                    <ActionIcon size={20} variant="transparent" color="gray" {...props}>
                      <EditIcon />
                    </ActionIcon>
                  )}
                </FileButton>
              )
            },
            {
              id: "image-delete",
              Component: (
                <ActionIcon
                  size={20}
                  variant="transparent"
                  color="gray"
                  onClick={ClearImageWatermark}
                >
                  <TrashIcon />
                </ActionIcon>
              )
            }
          ]}
        />
      </Box>
      <Button
        type="button"
        disabled={applyingChanges}
        onClick={HandleSubmit}
      >
        {applyingChanges ? <Loader type="dots" size="xs" /> : "Apply"}
      </Button>
    </Box>
  );
});

export default PlayoutPanel;
