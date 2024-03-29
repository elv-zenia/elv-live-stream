import React, {useRef, useState} from "react";
const path = require("path");
import {ActionIcon, Box, FileButton, Flex, Group, Menu, Paper, Text, Textarea} from "@mantine/core";
import {DEFAULT_WATERMARK_TEXT, STATUS_MAP} from "Data/StreamData";
import {observer} from "mobx-react";
import {Select} from "Components/Inputs";
import {ENCRYPTION_OPTIONS} from "Data/StreamData";
import classes from "Assets/stylesheets/modules/PlayoutPanel.module.css";
import {streamStore} from "Stores";
import {useParams} from "react-router-dom";
import {Loader} from "Components/Loader";
import {notifications} from "@mantine/notifications";
import EditIcon from "Assets/icons/EditIcon";
import TrashIcon from "Assets/icons/TrashIcon";

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
              React.cloneElement(Component, {key: id})
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
  title
}) => {
  const [drm, setDrm] = useState(currentDrm);
  const [formWatermarks, setFormWatermarks] = useState(
    {
      image: imageWatermark ? imageWatermark : undefined,
      text: simpleWatermark ? JSON.stringify(simpleWatermark, null, 2) : undefined
    }
  );
  const [showTextWatermarkInput, setShowTextWatermarkInput] = useState(false);
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
        drmType: drm
      });

      notifications.show({
        title: `${title || params.id} updated`,
        message: "Settings have been successfully applied"
      });
    } catch(error) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Unable to apply settings"
      });

      console.error("Unable to configure watermark", error);
    } finally {
      setApplyingChanges(false);
    }
  };

  return (
    <>
      <Box data-disabled={status === STATUS_MAP.RUNNING} mb="24px" maw="50%" className={classes.box}>
        {/*<Title size="1.25rem" fw={600} color="elv-gray.9" mb="16px">Playout</Title>*/}
        <div className="form__section-header">Playout</div>
        <Select
          label="DRM"
          formName="playbackEncryption"
          options={ENCRYPTION_OPTIONS}
          style={{width: "100%"}}
          defaultOption={{
            value: "",
            label: "Select DRM"
          }}
          value={drm}
          onChange={(event) => setDrm(event.target.value)}
          tooltip={
            ENCRYPTION_OPTIONS.map(({label, title, value}) =>
              <div key={`encryption-info-${value}`} className="form__tooltip-item">
                <div className="form__tooltip-item__encryption-title">{label}:</div>
                <div>{title}</div>
              </div>
            )
          }
        />
      </Box>
      <Box mb="24px" maw="50%">
        <Group mb={16}>
          {/*<Title size="1.25rem" fw={600} color="elv-gray.9">Visible Watermark</Title>*/}
          <div style={{fontSize: "1.25rem", fontWeight: 400}}>Visible Watermark</div>
        </Group>

        {/* Add WM button */}
        <Menu>
          <Menu.Target>
            <button type="button" className="button__secondary">Add Watermark</button>
            {/*<Button*/}
            {/*  variant="outline"*/}
            {/*  leftSection={<PlusIcon width={12}/>}*/}
            {/*>*/}
            {/*  Add Watermark*/}
            {/*</Button>*/}
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
                  onClick={() => setShowTextWatermarkInput(true)}
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
      <button
        type="button"
        disabled={applyingChanges}
        className="button__primary"
        onClick={HandleSubmit}
      >
        {applyingChanges ? <Loader loader="inline" className="modal__loader"/> : "Apply"}
      </button>
    </>
  );
});

export default PlayoutPanel;
