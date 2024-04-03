import React from "react";
import {observer} from "mobx-react";
import {Box, Flex, Group, Indicator, Text} from "@mantine/core";
import HeaderSearchBar from "Components/header/HeaderSearchBar.jsx";
import HeaderTopActions from "Components/header/HeaderTopActions";
import {StatusIndicator} from "Stores/helpers/Misc";
import {STATUS_TEXT} from "Data/HumanReadableText";
import classes from "Assets/stylesheets/modules/PageHeader.module.css";
import {QUALITY_MAP} from "Data/StreamData";
import {IconAlertCircle} from "@tabler/icons-react";

export const StatusText = ({status, quality, withBorder=false}) => {
  if(!status) { return null; }

  if(quality === QUALITY_MAP.GOOD || !quality) {
    return (
      <Box className={withBorder ? classes.box : ""} title={STATUS_TEXT[status]}>
        <Indicator color={StatusIndicator(status)} position="middle-start" size={8} offset={8}>
          <Text fz="sm" ml="xl">
            {STATUS_TEXT[status]}
          </Text>
        </Indicator>
      </Box>
    );
  } else {
    return (
      <Box className={withBorder ? classes.box : ""}>
        <Group gap={0}>
          <IconAlertCircle color="var(--mantine-color-elv-orange-3)" width={15} />
          <Text fz="sm" ml="md">
            {STATUS_TEXT[status]}
          </Text>
        </Group>
      </Box>
    );
  }
};

const PageHeader = observer(({
  title,
  showSearchBar=false,
  actions=[],
  status,
  quality
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
        <div className="page-header" style={{marginTop: "32px"}}>
          <Group>
            {title}
            <StatusText status={status} quality={quality} withBorder />
          </Group>
        </div>
      }
    </Flex>
  );
});

export default PageHeader;
