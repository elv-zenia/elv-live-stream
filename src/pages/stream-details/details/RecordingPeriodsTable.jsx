import React, {useState} from "react";
import {observer} from "mobx-react";
import {useDisclosure} from "@mantine/hooks";
import {streamStore} from "Stores";
import {notifications} from "@mantine/notifications";
import {RECORDING_STATUS_TEXT, STATUS_MAP} from "Utils/constants";
import {Flex, Text} from "@mantine/core";
import {DateFormat, Pluralize} from "Utils/helpers";
import {Loader} from "Components/Loader";
import {DataTable} from "mantine-datatable";
import DetailsCopyModal from "Pages/stream-details/details/CopyToVodModal";
import {Runtime} from "Pages/stream-details/details/DetailsPanel";

const RecordingPeriodsTable = observer(({
  records,
  objectId,
  title,
  CopyCallback,
  currentTimeMs,
  retention,
  status
}) => {
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [copyingToVod, setCopyingToVod] = useState(false);
  const [showCopyModal, {open, close}] = useDisclosure(false);
  const [vodTitle, setVodTitle] = useState(`${title} VoD`);

  const HandleCopy = async ({title}) => {
    try {
      setCopyingToVod(true);
      const response = await streamStore.CopyToVod({
        objectId,
        selectedPeriods: selectedRecords,
        title
      });

      await CopyCallback();

      notifications.show({
        title: `${title || objectId} copied to VoD`,
        message: `${response?.target_object_id} successfully created`,
        autoClose: false
      });
      close();
    } catch(error) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Unable to copy to VoD"
      });

      console.error("Unable to copy to VoD", error);
      setCopyingToVod(false);
      close();
    } finally {
      setCopyingToVod(false);
    }
  };

  const RecordingStatus = ({item, text=true, startTime, endTime}) => {
    let status;
    const videoIsEmpty = (item?.sources?.video?.parts || []).length === 0;

    if(
      videoIsEmpty ||
      !MeetsDurationMin({startTime, endTime}) ||
      !IsWithinRetentionPeriod({startTime})
    ) {
      status = "EXPIRED";
    } else if(!videoIsEmpty && item?.sources?.video?.trimmed > 0) {
      status = "PARTIALLY_AVAILABLE";
    } else {
      status = "AVAILABLE";
    }

    return text ? RECORDING_STATUS_TEXT[status] : status;
  };

  const MeetsDurationMin = ({startTime, endTime}) => {
    startTime = new Date(startTime).getTime();
    endTime = new Date(endTime).getTime();

    // If starting or currently running, part is copyable
    if(endTime === 0 || startTime === 0) { return true; }

    return (endTime - startTime) >= 61000;
  };

  const IsWithinRetentionPeriod = ({startTime}) => {
    if(status !== STATUS_MAP.STOPPED) { return true; }

    const currentTime = new Date().getTime();
    const startTimeMs = new Date(startTime).getTime();
    const retentionMs = retention * 1000;

    if(typeof startTimeMs !== "number") { return false; }

    return (currentTime - startTimeMs) < retentionMs;
  };

  return (
    <>
      <Flex direction="row" justify="space-between">
        {
          selectedRecords.length === 0 ? "" : `${Pluralize({base: "item", count: selectedRecords.length})} selected`
        }
        <button
          type="button"
          className="button__primary"
          disabled={selectedRecords.length === 0 || copyingToVod}
          style={{marginLeft: "auto"}}
          onClick={open}
        >
          {copyingToVod ? <Loader loader="inline" className="modal__loader"/> : "Copy to VoD"}
        </button>
      </Flex>
      <DataTable
        mb="4rem"
        columns={[
          {
            accessor: "start_time",
            title: "Start Time",
            render: record => (
              <Text>
                {
                  record.start_time ?
                    DateFormat({time: record.start_time, format: "iso"}) : "--"
                }
              </Text>
            )
          },
          {
            accessor: "end_time",
            title: "End Time",
            render: record => (
              <Text>
                {
                  record.end_time ?
                    DateFormat({time: record.end_time, format: "iso"}) : "--"
                }
              </Text>
            )
          },
          {
            accessor: "runtime",
            title: "Runtime",
            render: record => (
              <Text>
                {
                  record.start_time ?
                    Runtime({
                      startTime: new Date(record.start_time).getTime(),
                      endTime: new Date(record.end_time).getTime(),
                      currentTimeMs,
                      format: "hh:mm:ss"
                    }) : "--"
                }
              </Text>
            )
          },
          {
            accessor: "status",
            title: "Status",
            render: record => (
              <Text>
                {RecordingStatus({
                  item: record,
                  startTime: record.start_time,
                  endTime: record.end_time
                })}
              </Text>
            )
          }
        ]}
        minHeight={!records || records.length === 0 ? 150 : 75}
        noRecordsText="No recording periods found"
        records={records}
        fetching={!records}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        isRecordSelectable={(record) => (
          RecordingStatus({
            item: record,
            text: false,
            startTime: record.start_time,
            endTime: record.end_time
          }) === "AVAILABLE"
        )}
        withTableBorder
        highlightOnHover
      />
      <DetailsCopyModal
        show={showCopyModal}
        close={close}
        Callback={(title) => HandleCopy({title})}
        title={vodTitle}
        setTitle={setVodTitle}
      />
    </>
  );
});

export default RecordingPeriodsTable;

