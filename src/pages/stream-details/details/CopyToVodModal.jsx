import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Box, Flex, Modal, Select, Text, TextInput} from "@mantine/core";
import {Loader} from "@/components/Loader.jsx";
import {dataStore} from "@/stores/index.js";

const CopyToVodModal = observer(({
  show,
  close,
  title,
  setTitle,
  libraryId,
  setLibraryId,
  accessGroup,
  setAccessGroup,
  Callback
}) => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadLibraries = async() => {
      await dataStore.LoadLibraries();
    };

    const LoadGroups = async() => {
      await dataStore.LoadAccessGroups();
    };

    if(!dataStore.libraries) {
      LoadLibraries();
    }

    if(!dataStore.accessGroups) {
      LoadGroups();
    }
  }, []);

  return (
    <Modal
      opened={show}
      onClose={close}
      title="Copy to VoD"
      padding="32px"
      radius="6px"
      size="lg"
      centered
    >
      <Box w="100%">
        {
          !dataStore.libraries ?
            <Loader /> :
            (
              <Select
                label="Library"
                required={true}
                data={
                  Object.keys(dataStore.libraries || {}).map(libraryId => (
                    {
                      label: dataStore.libraries[libraryId].name || "",
                      value: libraryId
                    }
                  ))
                }
                placeholder="Select Library"
                value={libraryId}
                onChange={value => setLibraryId(value)}
                style={{width: "100%", marginBottom: "1rem"}}
              />
            )
        }

        {
          !dataStore.accessGroups ?
            <Loader /> :
            (
              <Select
                label="Access Group"
                description="Select an Access Group to manage your live stream object."
                data={
                  Object.keys(dataStore.accessGroups || {}).map(accessGroupName => (
                    {
                      label: accessGroupName,
                      value: accessGroupName
                    }
                  ))
                }
                placeholder="Select Access Group"
                value={accessGroup}
                onChange={value => setAccessGroup(value)}
                style={{width: "100%", marginBottom: "1rem"}}
              />
            )
        }

        <TextInput
          label="VoD Title"
          required={true}
          value={title}
          onChange={event => setTitle(event.target.value)}
          style={{width: "100%"}}
        />
        <Text mt={16}>This process takes around 30 seconds per hour of content.</Text>
      </Box>
      {
        !error ? null :
          <div className="modal__error">
            Error: { error }
          </div>
      }
      <Flex direction="row" align="center" className="modal__actions">
        <button type="button" className="button__secondary" onClick={close}>
          Cancel
        </button>
        <button
          type="button"
          disabled={loading || !libraryId || !title}
          className="button__primary"
          onClick={async () => {
            try {
              setError(undefined);
              setLoading(true);
              await Callback(title);
            } catch(error) {
              // eslint-disable-next-line no-console
              console.error(error);
              setError(error?.message || error.kind || error.toString());
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader loader="inline" className="modal__loader"/> : "Copy"}
        </button>
      </Flex>
    </Modal>
  );
});

export default CopyToVodModal;
