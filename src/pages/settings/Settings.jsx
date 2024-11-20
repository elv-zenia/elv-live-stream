import {Box, Button, Loader, Title} from "@mantine/core";
import TextEditorBox from "@/components/text-editor-box/TextEditorBox.jsx";
import {useEffect, useState} from "react";
import {DefaultLadderProfile} from "@/utils/profiles.js";
import {observer} from "mobx-react-lite";
import {dataStore} from "@/stores/index.js";
import {PlusIcon} from "@/assets/icons/index.js";
import {rootStore} from "@/stores/index.js";

const Settings = observer(() => {
  const [profileFormData, setProfileFormData] = useState(({default: JSON.stringify({}, null, 2), custom: []}));

  useEffect(() => {
    const LoadData = async() => {
      if(dataStore.ladderProfiles) {
        const stringified = dataStore.ladderProfiles;
        stringified.default = JSON.stringify(stringified.default, null, 2);
        stringified.custom = stringified.custom.map(item => JSON.stringify(item, null, 2));
        setProfileFormData(stringified);
      } else {
        const profilesObject = {
          default: JSON.stringify(DefaultLadderProfile, null, 2),
          custom: []
        };
        await setProfileFormData(profilesObject);
      }
    };

    LoadData();
  }, [dataStore.ladderProfiles]);

  const HandleChange = ({value, index}) => {
    const updatedFormData = profileFormData;
    const updatedCustomItems = updatedFormData.custom;

    if(index === "default") {
      updatedFormData.default = value;
    } else {
      updatedCustomItems[index] = value;
    }

    setProfileFormData({
      ...profileFormData,
      custom: updatedCustomItems
    });
  };

  const HandleAddCustom = () => {
    const updatedCustomItems = profileFormData.custom;

    updatedCustomItems.push(
      JSON.stringify({
        "name" : `Custom ${profileFormData.custom.length + 1}`,
        "ladder_specs": {
          "video": []
        }
      }, null, 2)
    );

    setProfileFormData({
      ...profileFormData,
      custom: updatedCustomItems
    });
  };

  const HandleSave = () => {
    const updatedFormData = profileFormData;
    updatedFormData.default = JSON.parse(updatedFormData.default || {});
    updatedFormData.custom = updatedFormData.custom.map(item => JSON.parse(item));
  };

  if(!rootStore.loaded) { return <Loader />; }

  return (
    <>
      <div className="page-header monitor__page-header">
        <div>
          Settings
        </div>
      </div>
      <Box>
        <Title order={4}>Playout Profiles</Title>
        <Button
          leftSection={<PlusIcon />}
          variant="white"
          mt={16}
          mb={8}
          onClick={HandleAddCustom}
        >
          Add Custom Profile
        </Button>
        <TextEditorBox
          columns={[
            {id: "Default", header: "Profile", value: "Default"}
          ]}
          editorValue={profileFormData.default || {}}
          HandleEditorValueChange={(args) => HandleChange({...args, index: "default"})}
        />
        {
          (profileFormData.custom).map((profile, index) => (
            <TextEditorBox
              key={`custom-${index}`}
              columns={[
                {id: JSON.parse(profile).name, header: "Profile", value: JSON.parse(profile).name}
              ]}
              editorValue={profile}
              HandleEditorValueChange={(args) => HandleChange({...args, index})}
            />
          ))
        }
      </Box>
      <button
        type="button"
        className="button__primary"
        onClick={HandleSave}
      >
        Save
      </button>
    </>
  );
});

export default Settings;
