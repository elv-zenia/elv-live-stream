import {observer} from "mobx-react";
import {Box, Flex} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {dataStore, editStore, streamStore} from "Stores";
import {useParams} from "react-router-dom";
import {TextInput} from "Components/Inputs";
import {notifications} from "@mantine/notifications";
import {Loader} from "Components/Loader";

const GeneralPanel = observer(({slug}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayTitle: ""
  });
  const [applyingChanges, setApplyingChanges] = useState(false);

  const params = useParams();

  useEffect(() => {
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
    </>
  );
});

export default GeneralPanel;
