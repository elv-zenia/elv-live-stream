import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import AudioTracksTable from "Pages/create/AudioTracksTable";
import {dataStore, streamStore} from "Stores";
import {useParams} from "react-router-dom";
import {Loader} from "Components/Loader";
import {Box} from "@mantine/core";
import {notifications} from "@mantine/notifications";

const AudioPanel = observer(({title, slug}) => {
  const params = useParams();
  const [audioTracks, setAudioTracks] = useState([]);
  const [formData, setFormData] = useState(null);
  const [applyingChanges, setApplyingChanges] = useState(false);

  const LoadConfigData = async () => {
    const {audioStreams, audioData} = await dataStore.LoadStreamProbeData({
      objectId: params.id
    });

    setAudioTracks(audioStreams);
    setFormData(audioData);
  };

  useEffect(() => {
    if(params.id) {
      LoadConfigData();
    }
  }, [params.id]);

  const HandleSubmit = async(event) => {
    event.preventDefault();
    try {
      setApplyingChanges(true);

      await streamStore.UpdateStreamAudioSettings({
        objectId: params.id,
        slug,
        audioData: formData
      });

      await LoadConfigData();

      notifications.show({
        title: `${title || params.id} updated`,
        message: "Settings have been applied successfully"
      });
    } catch(error) {
      console.error("Unable to configure audio settings", error);

      notifications.show({
        title: "Error",
        color: "red",
        message: "Unable to apply settings"
      });
    } finally {
      setApplyingChanges(false);
    }
  };

  return (
    <>
      <Box mb="24px" maw="60%">
        <form onSubmit={HandleSubmit}>
          <AudioTracksTable
            records={audioTracks}
            audioFormData={formData}
            setAudioFormData={setFormData}
          />
          <Box mt="24px">
            <button
              type="submit"
              className="button__primary"
              disabled={applyingChanges}
            >
              {applyingChanges ? <Loader loader="inline" className="modal__loader"/> : "Apply"}
            </button>
          </Box>
        </form>
      </Box>
    </>
  );
});

export default AudioPanel;
