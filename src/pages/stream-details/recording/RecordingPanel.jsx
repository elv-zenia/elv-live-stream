import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import AudioTracksTable from "@/pages/create/AudioTracksTable";
import {dataStore, editStore, streamStore} from "@/stores";
import {useParams} from "react-router-dom";
import {Loader} from "@/components/Loader.jsx";
import {Box} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {Select} from "@/components/Inputs.jsx";
import {RETENTION_OPTIONS} from "@/utils/constants";

const RecordingPanel = observer(({title, slug, currentRetention}) => {
  const params = useParams();
  const [audioTracks, setAudioTracks] = useState([]);
  const [audioFormData, setAudioFormData] = useState(null);
  const [retention, setRetention] = useState(currentRetention);
  const [applyingChanges, setApplyingChanges] = useState(false);

  const LoadConfigData = async () => {
    const {audioStreams, audioData} = await dataStore.LoadStreamProbeData({
      objectId: params.id
    });

    setAudioTracks(audioStreams);
    setAudioFormData(audioData);
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
        audioData: audioFormData
      });

      await editStore.UpdateRetention({
        objectId: params.id,
        slug,
        retention
      });

      await LoadConfigData();

      notifications.show({
        title: `${title || params.id} updated`,
        message: "Settings have been applied successfully"
      });
    } catch(error) {
      // eslint-disable-next-line no-console
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
        <form onSubmit={HandleSubmit} className="form">
          <div className="form__section-header">Retention Period</div>
          <Select
            labelDescription="Select a retention period for how long stream parts will exist until they are removed from the fabric."
            formName="retention"
            options={RETENTION_OPTIONS}
            value={retention}
            onChange={event => setRetention(event.target.value)}
          />
          <div className="form__section-header">Audio Tracks</div>
          <AudioTracksTable
            records={audioTracks}
            audioFormData={audioFormData}
            setAudioFormData={setAudioFormData}
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

export default RecordingPanel;
