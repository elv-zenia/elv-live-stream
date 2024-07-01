import {observer} from "mobx-react";
import {Box, Grid, Flex, Stack, Skeleton, Text} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {STATUS_MAP} from "Data/StreamData";
import {VideoContainer} from "Pages/monitor/Monitor";
import {CopyToClipboard} from "Stores/helpers/Actions";
import {IconCheck} from "@tabler/icons-react";
import ClipboardIcon from "Assets/icons/ClipboardIcon";
import {dataStore, editStore, streamStore} from "Stores";
import {useParams} from "react-router-dom";
import {TextInput} from "Components/Inputs";
import {notifications} from "@mantine/notifications";
import {Loader} from "Components/Loader";

const DetailsPanel = observer(({slug, embedUrl}) => {
  const [frameSegmentUrl, setFrameSegmentUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayTitle: ""
  });
  const [applyingChanges, setApplyingChanges] = useState(false);

  const params = useParams();

  useEffect(() => {
    const LoadStatus = async() => {
      const statusResponse = await streamStore.CheckStatus({
        objectId: params.id
      });

      let frameUrl = "";
      if(statusResponse?.state === STATUS_MAP.RUNNING) {
        streamStore.StreamFrameURL(slug).then(url => setFrameSegmentUrl(url));
      }

      setStatus(statusResponse);
      setFrameSegmentUrl(frameUrl || "");
    };

    const LoadDetails = async() => {
      await dataStore.LoadDetails({objectId: params.id, slug});
      const stream = streamStore.streams[slug];

      setFormData({
        name: stream.title || "",
        description: stream.description || "",
        displayTitle: stream.display_title || ""
      });
    };

    if(params.id) {
      LoadStatus();
      LoadDetails();
    }
  }, [params.id, streamStore.streams]);

  const HandleFormChange = (event) => {
    const {name, value} = event.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const HandleSubmit = async(event) => {
    event.preventDefault();

    try {
      setApplyingChanges(true);

      await editStore.UpdateDetailMetadata({
        objectId: params.id,
        name: formData.name,
        description: formData.description,
        displayTitle: formData.displayTitle
      });

      notifications.show({
        title: `${formData.name || params.id} updated`,
        message: "Changes have been applied successfully"
      });
    } catch(error) {
      console.error("Unable to update metadata", error);

      notifications.show({
        title: "Error",
        color: "red",
        message: "Unable to save changes"
      });
    } finally {
      setApplyingChanges(false);
    }
  };

  return (
    <>
      <Grid>
        <Grid.Col span={8}>
          <Flex direction="column" style={{flexGrow: "1"}}>
            <form className="form" onSubmit={HandleSubmit}>
              <Box mb="24px" maw="70%">
                <div className="form__section-header">General</div>
                <TextInput
                  label="Name"
                  formName="name"
                  required={true}
                  value={formData.name}
                  onChange={HandleFormChange}
                />
                <TextInput
                  label="Display Title"
                  formName="displayTitle"
                  value={formData.displayTitle}
                  onChange={HandleFormChange}
                />
                <TextInput
                  label="Description"
                  formName="description"
                  value={formData.description}
                  onChange={HandleFormChange}
                />
              </Box>
              <button type="submit" className="button__primary" disabled={applyingChanges}>
                {applyingChanges ? <Loader loader="inline" className="modal__loader"/> : "Save"}
              </button>
            </form>
          </Flex>
        </Grid.Col>
        <Grid.Col span={4}>
          <Flex>
            <Stack gap={0}>
              <div className="form__section-header">Preview</div>
              <Skeleton visible={frameSegmentUrl === undefined || !status} height={200} width={350}>
                {
                  (status?.state === STATUS_MAP.RUNNING && frameSegmentUrl) ?
                    <VideoContainer index={0} slug={slug} showPreview /> :
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
    </>
  );
});

export default DetailsPanel;
