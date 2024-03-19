import React, {useRef, useState} from "react";
import {Box, FileButton, Group, Text, Textarea, Title} from "@mantine/core";
import {DEFAULT_WATERMARK_TEXT, STATUS_MAP} from "Data/StreamData";
import {observer} from "mobx-react";
import {Select} from "Components/Inputs";
import {ENCRYPTION_OPTIONS} from "Data/CreateData";
import classes from "Assets/stylesheets/modules/PlayoutPanel.module.css";

const PlayoutPanel = observer(({status}) => {
  const [drm, setDrm] = useState();
  const [textWatermark, setTextWatermark] = useState(JSON.stringify(DEFAULT_WATERMARK_TEXT, null, 2));
  const [imageWatermark, setImageWatermark] = useState(null);
  const resetRef = useRef(null);

  const ClearImageWatermark = () => {
    setImageWatermark(null);
    resetRef.current?.();
  };

  return (
    <>
      <Box data-disabled={status === STATUS_MAP.RUNNING} mb="24px" maw="50%" className={classes.box}>
        <Title size="1.25rem" fw={600} color="elv-gray.9" mb="16px">Playout</Title>
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
                <div className="form__tooltip-item__encryption-title">{ label }:</div>
                <div>{ title }</div>
              </div>
            )
          }
        />
      </Box>
      <Box mb="24px" maw="50%">
        <Title size="1.25rem" fw={600} color="elv-gray.9" mb="16px">Visible Watermark</Title>
        <Textarea
          label="Text Watermark"
          value={textWatermark}
          size="md"
          rows={10}
          onChange={(event) => setTextWatermark((event.target.value))}
        />
        <Box mt="16px">
          <Text>Image Watermark</Text>
          <Group>
            <FileButton
              onChange={setImageWatermark}
              accept="image/png,image/jpeg"
              resetRef={resetRef}
            >
              {(props) => (
                <button type="button" className="button__secondary" {...props}>Upload Image</button>
              )}
            </FileButton>
            <button type="button" className="button__dark" disabled={!imageWatermark} onClick={ClearImageWatermark}>
              Reset
            </button>
          </Group>
          {!!imageWatermark &&
            <Text size="sm" mt="8px">
              Selected watermark: {imageWatermark.name}
            </Text>
          }
        </Box>
      </Box>
      <button type="button" className="button__primary">Apply</button>
    </>
  );
});

export default PlayoutPanel;
