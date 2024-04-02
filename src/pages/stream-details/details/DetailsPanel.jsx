import React, {useEffect, useState} from "react";
import {Box, Flex, Grid, Skeleton, Stack, Text} from "@mantine/core";
import {dataStore, streamStore} from "Stores";
import {observer} from "mobx-react";
import {useParams} from "react-router-dom";
import {DateFormat, FormatTime} from "Stores/helpers/Misc";
import {STATUS_MAP} from "Data/StreamData";
import ClipboardIcon from "Assets/icons/ClipboardIcon";
import {CopyToClipboard} from "Stores/helpers/Actions";
import {IconCheck} from "@tabler/icons-react";
import DetailsPeriodsTable from "Pages/stream-details/details/DetailsPeriodsTable";
import DetailsRecordingCopiesTable from "Pages/stream-details/details/DetailsRecordingCopiesTable";

const DetailsPanel = observer(({slug, embedUrl, title}) => {
  const [frameSegmentUrl, setFrameSegmentUrl] = useState();
  const [status, setStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [liveRecordingCopies, setLiveRecordingCopies] = useState({});
  const [recordingInfo, setRecordingInfo] = useState(null);

  const params = useParams();
  const currentTimeMs = new Date().getTime();

  useEffect(() => {
    const LoadDetails = async () => {
      const frameUrl = await streamStore.StreamFrameURL(slug);
      setFrameSegmentUrl(frameUrl);

      if(params.id) {
        const statusResponse = await streamStore.CheckStatus({
          objectId: params.id
        });
        setStatus(statusResponse);

        GetEdgeWriteTokenMeta();
        GetLiveRecordingCopies();
      }
    };

    LoadDetails();
  }, [params]);

  const GetEdgeWriteTokenMeta = async() => {
    const metadata = await dataStore.LoadEdgeWriteTokenMeta({
      objectId: params.id
    });

    if(metadata) {
      metadata.live_offering = (metadata.live_offering || []).map((item, i) => ({
        ...item,
        id: i
      }));

      setRecordingInfo(metadata);
    }
  };

  const GetLiveRecordingCopies = async() => {
    let liveRecordingCopies = await streamStore.FetchLiveRecordingCopies({
      objectId: params.id
    });

    Object.keys(liveRecordingCopies || {}).forEach(id => (
      liveRecordingCopies[id]["_id"] = id
    ));

    setLiveRecordingCopies(liveRecordingCopies || {});
  };

  const Runtime = ({startTime}) => {
    let time;
    const running = status?.state === STATUS_MAP.RUNNING;

    if(!running) {
      time = "--";
    } else {
      time = FormatTime({
        milliseconds: currentTimeMs - startTime
      });
    }

    return `Runtime: ${time}`;
  };

  const AvailableTime = ({endTime}) => {
    let time;
    const running = status?.state === STATUS_MAP.RUNNING;

    if(!running || !endTime) {
      time = "--";
    } else {
      time = endTime - currentTimeMs;
    }

    return `Available: ${time}`;
  };

  return (
    <>
      <Grid>
        <Grid.Col span={8}>
          <Flex direction="column" style={{flexGrow: "1"}}>
            <Box mb="24px" maw="70%">
              <div className="form__section-header">Quality</div>
            </Box>
            <Box mb="24px" maw="70%">
              <div className="form__section-header">Recording Info</div>
              <Text>
                Started: {status?.recording_period?.start_time_epoch_sec ? DateFormat({time: status?.recording_period?.start_time_epoch_sec, format: "sec"}) : "--"}
              </Text>
              <Text>
                {
                  Runtime({
                    startTime: status?.recording_period?.start_time_epoch_sec * 1000
                  })
                }
              </Text>
              <Text>
                {
                  AvailableTime({
                    endTime: status?.recording_period?.end_time_epoch_sec
                  })
                }
              </Text>
            </Box>
            <DetailsRecordingCopiesTable
              liveRecordingCopies={liveRecordingCopies}
            />
          </Flex>
        </Grid.Col>
        <Grid.Col span={4}>
          <Flex>
            <Stack gap={0}>
              <div className="form__section-header">Preview</div>
              <Skeleton visible={!status} height={200} width={350}>
                {
                  (status?.state === STATUS_MAP.RUNNING && frameSegmentUrl) ?
                    <video src={frameSegmentUrl} height={200} style={{paddingRight: "32px"}}/> :
                    <Box bg="gray.3" h="100%" margin="auto" ta="center" style={{borderRadius: "4px"}}>
                      <Text lh="200px">Preview is not available</Text>
                    </Box>
                }
              </Skeleton>
              <Skeleton visible={!status} mt={16}>
                {
                  embedUrl &&
                  <Flex direction="row" justify="center" align="center">
                    <Text size="xs" truncate="end" maw={300} ta="center">{embedUrl}</Text>
                    <button type="button" onClick={() => {
                      CopyToClipboard({text: embedUrl});
                      setCopied(true);

                      setTimeout(() => {
                        setCopied(false);
                      }, [3000]);
                    }}>
                      {
                        copied ?
                          <IconCheck height={16} width={16}/> : <ClipboardIcon/>
                      }
                    </button>
                  </Flex>
                }
              </Skeleton>
            </Stack>
          </Flex>
        </Grid.Col>
      </Grid>
      <div className="form__section-header">Recording Periods</div>
      <DetailsPeriodsTable
        objectId={params.id}
        records={recordingInfo?.live_offering}
        title={title}
        CopyCallback={GetLiveRecordingCopies}
      />
    </>
  );
});

export default DetailsPanel;
