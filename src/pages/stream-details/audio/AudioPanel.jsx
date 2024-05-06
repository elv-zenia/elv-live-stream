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
  const [objectLadderSpecs, setObjectLadderSpecs] = useState([]);
  const [formData, setFormData] = useState(null);
  const [applyingChanges, setApplyingChanges] = useState(false);

  const LoadConfigData = async () => {
    const {ladderSpecs, audioData} = await dataStore.LoadStreamProbeData({
      objectId: params.id
    });

    setObjectLadderSpecs(ladderSpecs);
    setFormData(audioData);
  };

  useEffect(() => {
    if(params.id) {
      LoadConfigData();
    }
  }, [params.id]);

  const HandleSubmit = async() => {
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
        <AudioTracksTable
          objectLadderSpecs={objectLadderSpecs}
          audioFormData={formData}
          setAudioFormData={setFormData}
        />
      </Box>
      <button
        type="button"
        className="button__primary"
        disabled={applyingChanges}
        onClick={HandleSubmit}
      >
        {applyingChanges ? <Loader loader="inline" className="modal__loader"/> : "Apply"}
      </button>
    </>
  );
});

export default AudioPanel;
