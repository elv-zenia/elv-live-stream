import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import AudioTracksTable from "@/pages/create/audio-tracks-table/AudioTracksTable.jsx";
import {dataStore, editStore, streamStore} from "@/stores";
import {useParams} from "react-router-dom";
import {Loader} from "@/components/Loader.jsx";
import {Box, Select} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {
  CONNECTION_TIMEOUT_OPTIONS,
  RECONNECTION_TIMEOUT_OPTIONS,
  RETENTION_OPTIONS
} from "@/utils/constants";

const RecordingPanel = observer(({
  title,
  slug,
  currentRetention,
  currentConnectionTimeout,
  currentReconnectionTimeout
}) => {
  const params = useParams();
  const [audioTracks, setAudioTracks] = useState([]);
  const [audioFormData, setAudioFormData] = useState(null);
  const [retention, setRetention] = useState(currentRetention);
  const [connectionTimeout, setConnectionTimeout] = useState(currentConnectionTimeout === undefined ? "600" : CONNECTION_TIMEOUT_OPTIONS.map(item => item.value).includes(currentConnectionTimeout) ? currentConnectionTimeout : undefined);
  const [reconnectionTimeout, setReconnectionTimeout] = useState(RECONNECTION_TIMEOUT_OPTIONS.map(item => item.value).includes(currentReconnectionTimeout) ? currentReconnectionTimeout : undefined);
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

      await editStore.UpdateConfigMetadata({
        objectId: params.id,
        slug,
        retention: retention ? parseInt(retention) : null,
        connectionTimeout: connectionTimeout ? parseInt(connectionTimeout) : null,
        reconnectionTimeout: reconnectionTimeout ? parseInt(reconnectionTimeout) : null
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
            description="Select a retention period to specify how long stream parts will remain in the fabric before being removed."
            name="retention"
            data={RETENTION_OPTIONS}
            placeholder="Select Retention"
            value={retention}
            onChange={value => setRetention(value)}
            mb={16}
          />
          <div className="form__section-header">Timeout</div>
          <Select
            label="Connection Timeout"
            description="The stream will remain active and wait for an input feed for this duration."
            name="connectionTimeout"
            data={CONNECTION_TIMEOUT_OPTIONS}
            style={{width: "100%"}}
            placeholder="Select Time Duration"
            value={connectionTimeout}
            onChange={(value) => setConnectionTimeout(value)}
            mb={16}
          />
          <Select
            label="Reconnection Timeout"
            description="If the input feed is disconnected, the stream will remain active and wait for a reconnection for this duration."
            name="reconnectionTimeout"
            data={RECONNECTION_TIMEOUT_OPTIONS}
            style={{width: "100%"}}
            placeholder="Select Time Duration"
            value={reconnectionTimeout}
            onChange={(value) => setReconnectionTimeout(value)}
            mb={16}
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
