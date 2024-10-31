import {Alert, Box, Flex, Group, Text, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";
import {useEffect, useRef} from "react";
import HeaderSearchBar from "@/components/header/HeaderSearchBar.jsx";
import HeaderTopActions from "@/components/header/HeaderTopActions.jsx";
import StatusText from "@/components/status-text/StatusText.jsx";

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

const TopActions = ({showSearchBar, actions=[]}) => {
  if(!showSearchBar && actions.length === 0) { return null; }

  return (
    <Flex direction="row" align="center" justify="space-between" mb={32}>
      { showSearchBar && <HeaderSearchBar/> }
      {
        actions.length > 0 ?
          <HeaderTopActions actions={actions} /> : null
      }
    </Flex>
  );
};

const TitleSection = ({title, subtitle, status, quality}) => {
  return (
    <Flex direction="column">
      <Group>
        <Title order={3} classNames={{root: styles.root}} mb={24}>
          { title }
        </Title>
        <StatusText status={status} quality={quality} withBorder />
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
  status,
  quality
}) => {
  return (
    <Box p="24 46 46" w={width}>
      <AlertMessage error={error} />
      <TopActions showSearchBar={showSearchBar} actions={actions} />
      {
        title &&
        <TitleSection
          title={title}
          subtitle={subtitle}
          status={status}
          quality={quality}
        />
      }
      { children }
    </Box>
  );
};

export default PageContainer;
