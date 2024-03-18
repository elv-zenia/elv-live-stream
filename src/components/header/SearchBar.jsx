import React from "react";
import {Flex, TextInput} from "@mantine/core";
import {useState} from "react";
import MagnifyingGlassIcon from "Assets/icons/MagnifyingGlassIcon.jsx";
import classes from "Assets/stylesheets/modules/SearchBar.module.css";

const SearchBar = () => {
  const [value, setValue] = useState("");

  return (
    <Flex direction="row" align="center" className={classes.flexbox}>
      <TextInput
        classNames={{
          input: classes.input,
          root: classes.root,
          section: classes.section
        }}
        size="xs"
        placeholder="Search"
        leftSection={<MagnifyingGlassIcon className={classes.icon} />}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Flex>
  );
};

export default SearchBar;
