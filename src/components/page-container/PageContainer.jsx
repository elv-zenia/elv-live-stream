import {Alert, Box, Flex, Group, Text, TextInput, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";
import {useEffect, useRef, useState} from "react";
import classes from "@/assets/stylesheets/modules/SearchBar.module.css";
import {MagnifyingGlassIcon} from "@/assets/icons/index.js";

const AlertMessage = ({error}) => {
  const errorRef = useRef(null);

  useEffect(() => {
    if(errorRef && errorRef.current) {
      errorRef.current.scrollIntoView();
    }
  }, [error]);

  if(!error) { return null; }

  const {title, message} = error;

  return (
    <Box ref={errorRef} mb={16}>
      <Alert
        variant="light"
        color="elv-red.4"
        title={title}
        withCloseButton
      >
        { message }
      </Alert>
    </Box>
  );
};

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

const TopActions = ({showSearchBar, actions=[]}) => {
  if(!showSearchBar && actions.length === 0) { return null; }

  return (
    <Flex direction="row" align="center" justify="space-between" mb={32}>
      { showSearchBar && <SearchBar/> }
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
        <Title order={3} classNames={{root: styles.root}}>
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

export default PageContainer;
