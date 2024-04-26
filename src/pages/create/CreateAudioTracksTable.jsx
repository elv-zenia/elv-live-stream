import React from "react";
import {observer} from "mobx-react";
import {Checkbox, Text} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {AudioCodec} from "Data/HumanReadableText";
import {AudioBitrateReadable} from "Stores/helpers/Misc";
import {Select} from "Components/Inputs";

const CreateAudioTracksTable = observer(({
  objectLadderSpecs,
  audioFormData,
  setAudioFormData
}) => {
  const records = objectLadderSpecs;

  return (
    <DataTable
      idAccessor="stream_index"
      noRecordsText="No audio tracks found"
      minHeight={records ? 150 : 75}
      records={records}
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
              render: record => (
                <Text>{ record.stream_index }</Text>
              )
            },
            {
              accessor: "representation",
              title: "Codec",
              render: record => (
                <Text>
                  { AudioCodec(record.representation) }</Text>
              )
            },
            {
              accessor: "input_bitrate",
              title: "Bitrate",
              render: record => (
                <Text>{ AudioBitrateReadable(record.bit_rate) }</Text>
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
              accessor: "stream_label",
              title: "Label",
              render: record => (
                <Text>{ record.stream_label }</Text>
              )
            },
            {
              accessor: "output_bitrate",
              title: "Bitrate",
              render: record => (
                <Select
                  label=""
                  options={[
                    {label: "512 Kbps", value: "512000"},
                    {label: "384 Kbps", value: "384000"},
                    {label: "192 Kbps", value: "192000"},
                    {label: "48 Kbps", value: "48000"},
                  ]}
                  value={audioFormData.bitrate}
                />
              )
            },
            {
              accessor: "action_record",
              title: "Record",
              render: record => (
                <Checkbox
                  checked={audioFormData[record.stream_index].record}
                  onChange={(event) => {
                    const audioPerIndex = audioFormData[record.stream_index].record = event.target.checked;
                    setAudioFormData({
                      ...audioFormData,
                      ...audioPerIndex
                    });
                  }}
                />
              )
            },
            {
              accessor: "action_playout",
              title: "Playout",
              render: record => (
                <Checkbox
                  checked={audioFormData[record.stream_index].playout}
                  onChange={(event) => {
                    const audioPerIndex = audioFormData[record.stream_index].playout = event.target.checked;
                    setAudioFormData({
                      ...audioFormData,
                      ...audioPerIndex
                    });
                  }}
                  disabled={!audioFormData[record.stream_index].record}
                />
              )
            }
          ]
        }
      ]}
    />
  );
});

export default CreateAudioTracksTable;
