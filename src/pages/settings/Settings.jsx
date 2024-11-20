import {Box, Button, Loader, Title} from "@mantine/core";
import TextEditorBox from "@/components/text-editor-box/TextEditorBox.jsx";
import {useEffect, useState} from "react";
import {DefaultLadderProfile} from "@/utils/profiles.js";
import {observer} from "mobx-react-lite";
import {dataStore, editStore} from "@/stores/index.js";
import {PlusIcon} from "@/assets/icons/index.js";
import {rootStore} from "@/stores/index.js";

const Settings = observer(() => {
  const [profileFormData, setProfileFormData] = useState(({default: JSON.stringify({}, null, 2), custom: []}));
  // For displaying values while user potentionally edits name
  const [customProfileNames, setCustomProfileNames] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      if(dataStore.ladderProfiles) {
        const stringifiedProfiles = {
          default: JSON.stringify(dataStore.ladderProfiles.default, null, 2),
          custom: dataStore.ladderProfiles.custom.map(item => JSON.stringify(item, null, 2))
        };
        setProfileFormData(stringifiedProfiles);
        setCustomProfileNames(dataStore.ladderProfiles.custom.map(item => item.name));
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
    const newName = `Custom ${profileFormData.custom.length + 1}`;

    updatedCustomItems.push(
      JSON.stringify({
        "name" : `${newName}`,
        "ladder_specs": {
          "video": []
        }
      }, null, 2)
    );

    setProfileFormData({
      ...profileFormData,
      custom: updatedCustomItems
    });

    setCustomProfileNames(updatedCustomItems.map(item => JSON.parse(item).name));
  };

  const HandleSave = () => {
    try {
      setSaving(true);
      const updatedFormData = profileFormData;
      updatedFormData.default = JSON.parse(updatedFormData.default || {});
      updatedFormData.custom = updatedFormData.custom.map(item => JSON.parse(item));

      editStore.SaveLadderProfiles({profileData: updatedFormData});
    } finally {
      setSaving(false);
    }
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
                {id: customProfileNames[index], header: "Profile", value: customProfileNames[index]}
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
        {saving ? <Loader loader="inline" className="modal__loader"/> : "Save"}
      </button>
    </>
  );
});

export default Settings;
