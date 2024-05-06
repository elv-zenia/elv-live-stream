import React from "react";
import {observer} from "mobx-react";
import {Checkbox, Text, TextInput} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {AudioCodec} from "Data/HumanReadableText";
import {AudioBitrateReadable} from "Stores/helpers/Misc";
import {Select} from "Components/Inputs";
import {RECORDING_BITRATE_OPTIONS} from "Data/StreamData";

const AudioTracksTable = observer(({
  objectLadderSpecs,
  audioFormData,
  setAudioFormData,
  disabled
}) => {
  const items = objectLadderSpecs;

  const HandleFormChange = ({index, key, value}) => {
    const audioIndexSpecific = audioFormData[index];
    audioIndexSpecific[key] = value;

    setAudioFormData({
      ...audioFormData,
      [index]: audioIndexSpecific
    });
  };

  return (
    <DataTable
      idAccessor="stream_index"
      noRecordsText="No audio tracks found"
      minHeight={items.length > 0 ? 350 : 200}
      fetching={!disabled && !audioFormData}
      records={items}
      withColumnBorders
      groups={[
        {
          id: "input",
          title: "Input",
          style: {fontStyle: "italic", fontSize: "1.125rem"},
          columns: [
            {
              accessor: "stream_index",
              title: "Index",
              render: item => (
                <Text>{ item.stream_index }</Text>
              )
            },
            {
              accessor: "codecs",
              title: "Codec",
              render: item => (
                <Text>
                  { AudioCodec(item.codecs) }</Text>
              )
            },
            {
              accessor: "input_bitrate",
              title: "Bitrate",
              render: item => (
                <Text>{ AudioBitrateReadable(item.bit_rate) }</Text>
              )
            }
          ]
        },
        {
          id: "output",
          title: "Output",
          style: {fontStyle: "italic", fontSize: "1.125rem"},
          columns: [
            {
              accessor: "playout_label",
              title: "Label",
              render: item => {
                return (
                  <TextInput
                    value={audioFormData[item.stream_index].playout_label}
                    disabled={disabled}
                    required={audioFormData[item.stream_index].record}
                    onInvalid={e => e.target.setCustomValidity("Label cannot be empty when enabling Playout")}
                    onInput={e => e.target.setCustomValidity("")}
                    onChange={(event) => {
                      HandleFormChange({
                        index: item.stream_index,
                        key: "playout_label",
                        value: event.target.value
                      });
                    }}
                  />
                );
              }
            },
            {
              accessor: "output_bitrate",
              title: "Bitrate",
              render: item => (
                <Select
                  label=""
                  style={{minWidth: "125px"}}
                  options={RECORDING_BITRATE_OPTIONS}
                  disabled={disabled}
                  onChange={(event) => {
                    HandleFormChange({
                      index: item.stream_index,
                      key: "recording_bitrate",
                      value: parseInt(event.target.value)
                    });
                  }}
                  value={audioFormData[item.stream_index].recording_bitrate}
                />
              )
            },
            {
              accessor: "action_record",
              title: "Record",
              width: 75,
              render: item => (
                <Checkbox
                  checked={audioFormData[item.stream_index].record}
                  disabled={disabled}
                  onChange={(event) => {
                    const value = event.target.checked;
                    HandleFormChange({
                      index: item.stream_index,
                      key: "record",
                      value
                    });

                    // Make sure playout is set to false when record is false
                    if(!value) {
                      HandleFormChange({
                        index: item.stream_index,
                        key: "playout",
                        value: false
                      });
                    }
                  }}
                />
              )
            },
            {
              accessor: "action_playout",
              title: "Playout",
              width: 75,
              render: item => (
                <Checkbox
                  checked={audioFormData[item.stream_index].playout}
                  onChange={(event) => {
                    HandleFormChange({
                      index: item.stream_index,
                      key: "playout",
                      value: event.target.checked
                    });
                  }}
                  disabled={!audioFormData[item.stream_index].record || disabled}
                />
              )
            }
          ]
        }
      ]}
    />
  );
});

export default AudioTracksTable;
