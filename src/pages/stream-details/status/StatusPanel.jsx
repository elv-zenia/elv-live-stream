import React, {useEffect, useState} from "react";
import {Box, Code, Flex, Grid, Skeleton, Stack, Text} from "@mantine/core";
import {streamStore} from "Stores";
import {observer} from "mobx-react";
import {useParams} from "react-router-dom";
import {DateFormat, FormatTime} from "Stores/helpers/Misc";
import {STATUS_MAP} from "Data/StreamData";
import RecordingPeriodsTable from "Pages/stream-details/status/RecordingPeriodsTable";
import RecordingCopiesTable from "Pages/stream-details/status/RecordingCopiesTable";
import {QUALITY_TEXT} from "Data/HumanReadableText";
import {IconAlertCircle} from "@tabler/icons-react";

export const Runtime = ({startTime, endTime, currentTimeMs, format="hh,mm,ss"}) => {
  let time;

  if(!endTime) {
    endTime = currentTimeMs;
  }

  if(!startTime) {
    time = "--";
  } else {
    time = FormatTime({
      milliseconds: endTime - startTime,
      format
    });
  }

  return time;
};

const StatusPanel = observer(({slug, embedUrl, title, recordingInfo}) => {
  const [status, setStatus] = useState(null);
  const [liveRecordingCopies, setLiveRecordingCopies] = useState({});

  const params = useParams();
  const currentTimeMs = new Date().getTime();

  useEffect(() => {
    const LoadStatus = async () => {
      const statusResponse = await streamStore.CheckStatus({
        objectId: params.id
      });

      setStatus(statusResponse);
    };


    LoadLiveRecordingCopies();
    LoadStatus();
  }, [params.id]);

  const LoadLiveRecordingCopies = async() => {
    let liveRecordingCopies = await streamStore.FetchLiveRecordingCopies({
      objectId: params.id
    });

    Object.keys(liveRecordingCopies || {}).forEach(id => (
      liveRecordingCopies[id]["_id"] = id
    ));

    setLiveRecordingCopies(liveRecordingCopies || {});
  };

  return (
    <>
      <Grid>
        <Grid.Col span={8}>
          <Flex direction="column" style={{flexGrow: "1"}}>
            <Box mb="24px" maw="70%">
              <div className="form__section-header">State</div>
              <Text>Quality: {QUALITY_TEXT[status?.quality] || "--"}</Text>
              {
                status?.warnings &&
                <>
                  <Box mt={16}>
                    <Code block icon={<IconAlertCircle />} color="rgba(250, 176, 5, 0.07)" style={{borderLeft: "4px solid var(--mantine-color-yellow-filled)", borderRadius: 0}}>
                      {(status?.warnings || []).map(item => (
                        <Text key={`warning-${item}`}>{item}</Text>
                      ))}
                    </Code>
                  </Box>
                </>
              }
            </Box>
            <Box mb="24px" maw="70%">
              <div className="form__section-header">Recording Info</div>
              <Text>
                Created: {
                  recordingInfo?._recordingStartTime ?
                    DateFormat({
                      time: recordingInfo?._recordingStartTime,
                      format: "sec"
                    }) : "--"
                }
              </Text>
              <Text>
                Current Period Started: {
                  status?.recording_period?.start_time_epoch_sec ?
                    DateFormat({
                      time: status?.recording_period?.start_time_epoch_sec,
                      format: "sec"
                    }) : "--"
                }
              </Text>
              <Text>
                Current Period Runtime: {
                  [STATUS_MAP.RUNNING, STATUS_MAP.STARTING].includes(status?.state) ? Runtime({
                    startTime: status?.recording_period?.start_time_epoch_sec * 1000,
                    currentTimeMs
                  }) : "--"
                }
              </Text>
            </Box>
            <RecordingCopiesTable
              liveRecordingCopies={liveRecordingCopies}
              DeleteCallback={LoadLiveRecordingCopies}
            />
          </Flex>
        </Grid.Col>
      </Grid>
      <div className="form__section-header">Recording Periods</div>
      <RecordingPeriodsTable
        objectId={params.id}
        records={recordingInfo?.live_offering}
        title={title}
        CopyCallback={LoadLiveRecordingCopies}
        currentTimeMs={currentTimeMs}
      />
    </>
  );
});

export default StatusPanel;
