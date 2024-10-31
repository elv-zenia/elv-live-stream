import {useState} from "react";
import {Box, Flex, Group, Text, TextInput, Title} from "@mantine/core";
import {MagnifyingGlassIcon} from "@/assets/icons/index.js";
import AlertMessage from "@/components/alert-message/AlertMessage.jsx";
import titleSectionStyles from "./TitleSection.module.css";
import searchBarStyles from "./SearchBar.module.css";

const PageContainer = ({
  title,
  subtitle,
  children,
  width="100%",
  error,
  showSearchBar=false,
  actions=[],
  titleRightSection,
  ...rest
}) => {
  return (
    <Box p="24 46 46" w={width} {...rest}>
      <AlertMessage error={error} />
      <TopActions showSearchBar={showSearchBar} actions={actions} />
      {
        title &&
        <TitleSection
          title={title}
          subtitle={subtitle}
          rightSection={titleRightSection}
        />
      }
      { children }
    </Box>
  );
};

const SearchBar = () => {
  const [value, setValue] = useState("");

  return (
    <Flex direction="row" align="center" className={searchBarStyles.flexbox}>
      <TextInput
        classNames={{
          input: searchBarStyles.input,
          root: searchBarStyles.root,
          section: searchBarStyles.section
        }}
        size="xs"
        placeholder="Search"
        leftSection={<MagnifyingGlassIcon className={searchBarStyles.icon} />}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Flex>
  );
};

const TopActions = ({showSearchBar, actions=[]}) => {
  if(!showSearchBar && actions.length === 0) { return null; }

  return (
    <Flex direction="row" align="center" justify="space-between" mb={32}>
      { showSearchBar && <SearchBar /> }
      {
        actions.length > 0 ?
          (
            <Flex direction="row" gap="sm">
              {
                actions.map(({label, variant="filled", onClick, disabled}) => (
                  <button
                    type="button"
                    className={variant === "filled" ? "button__primary" : "button__secondary"}
                    onClick={onClick}
                    key={`top-action-${label}`}
                    disabled={disabled}
                  >
                    {label}
                  </button>
                ))
              }
            </Flex>
          ) : null
      }
    </Flex>
  );
};

const TitleSection = ({title, subtitle, rightSection}) => {
  return (
    <Flex direction="column" mb={24}>
      <Group>
        <Title order={3} classNames={{root: titleSectionStyles.root}}>
          { title }
        </Title>
        {
          rightSection ? rightSection : null
        }
      </Group>
      <Box display="block">
        {
          subtitle &&
          <Text size="sm" c="gray" mt={6}>{subtitle}</Text>
        }
      </Box>
    </Flex>
  );
};

export default PageContainer;
