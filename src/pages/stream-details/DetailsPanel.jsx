import React, {useEffect, useState} from "react";
import {AspectRatio, Box, Flex, Text, Title} from "@mantine/core";
import {streamStore} from "Stores";
import {observer} from "mobx-react";
import {useParams} from "react-router-dom";
import {FormatTime} from "Stores/helpers/Misc";
import {STATUS_MAP} from "Data/StreamData";

const DetailsPanel = observer(({slug}) => {
  const [frameSegmentUrl, setFrameSegmentUrl] = useState();
  const [status, setStatus] = useState(null);
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
      }
    };

    LoadDetails();
  }, [params]);

  const Runtime = ({endTime, running}) => {
    let time;
    if(!running) {
      time = "--";
    } else {
      time = FormatTime({
        milliseconds: currentTimeMs - endTime
      });
    }

    return `Runtime: ${time}`;
  };

  const AvailableTime = ({endTime, running}) => {
    let time;
    if(!running || !endTime) {
      time = "--";
    } else {
      time = endTime - currentTimeMs;
    }

    return `Available: ${time}`;
  };

  return (
    <>
      <Flex direction="row">
        <Flex direction="column" style={{flexGrow: "1"}}>
          <Box mb="24px" maw="50%">
            <Title size="1.25rem" fw={600} color="elv-gray.9" mb="16px">Quality</Title>
          </Box>
          <Box mb="24px" maw="50%">
            <Title size="1.25rem" fw={600} color="elv-gray.9" mb="16px">Recording Info</Title>
            <Text>
              Started: {status?.recording_period?.start_time_epoch_sec ? new Date(status?.recording_period?.start_time_epoch_sec * 1000).toISOString() : ""}
            </Text>
            <Text>
              {
                Runtime({
                  endTime: status?.recording_period?.start_time_epoch_sec * 1000,
                  running: status === STATUS_MAP.RUNNING
                })
              }
            </Text>
            <Text>
              {
                AvailableTime({
                  endTime: status?.recording_period?.end_time_epoch_sec,
                  running: status === STATUS_MAP.RUNNING
                })
              }
            </Text>
            <Text>Periods: {status?.recording_period_sequence}</Text>
          </Box>
        </Flex>
      </Flex>
      {
        frameSegmentUrl &&
        <AspectRatio ratio={16 / 9} height={200} maw={850}>
          <video src={frameSegmentUrl}  />
        </AspectRatio>
      }
    </>
  );
});

export default DetailsPanel;
