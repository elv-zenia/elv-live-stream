import React from "react";
import {observer} from "mobx-react";
import {Box, Flex, Group, Indicator, Text, Title} from "@mantine/core";
import HeaderSearchBar from "Components/header/HeaderSearchBar.jsx";
import HeaderTopActions from "Components/header/HeaderActions";
import {StatusIndicator} from "Stores/helpers/Misc";
import {STATUS_TEXT} from "Data/HumanReadableText";
import classes from "Assets/stylesheets/modules/PageHeader.module.css";

const StatusText = ({status}) => {
  if(!status) { return null; }

  return (
    <Box className={classes.box}>
      <Indicator color={StatusIndicator(status)} position="middle-start" size={7}>
        <Text fz="sm" ml="sm">
          {STATUS_TEXT[status]}
        </Text>
      </Indicator>
    </Box>
  );
};

const PageHeader = observer(({
  title,
  showSearchBar=false,
  actions=[],
  status
}) => {
  return (
    <Flex direction="column">
      <Flex direction="row" align="center" justify="space-between">
        {showSearchBar && <HeaderSearchBar/>}
        {
          actions.length > 0 ?
            <HeaderTopActions actions={actions} /> : null
        }
      </Flex>
      {
        title &&
        <Title size="h3" mt="32px">
          <Group>
            {title}
            <StatusText status={status} />
          </Group>
        </Title>
      }
    </Flex>
  );
});

export default PageHeader;
