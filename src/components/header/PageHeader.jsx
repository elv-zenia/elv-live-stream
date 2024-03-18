import React from "react";
import {observer} from "mobx-react";
import {Flex, Title} from "@mantine/core";
import SearchBar from "Components/header/SearchBar.jsx";
import JobsActivity from "Components/header/JobsActivity.jsx";
import TopActions from "Components/header/TopActions.jsx";

const PageHeader = observer(({
  title,
  showSearchBar=false,
  showJobsButton=true,
  actions=[]
}) => {
  return (
    <Flex direction="column">
      <Flex direction="row" align="center" justify="space-between">
        {showSearchBar && <SearchBar/>}
        {
          actions.length > 0 ?
            <TopActions actions={actions} /> : null
        }
        {showJobsButton && <JobsActivity />}
      </Flex>
      {title && <Title size="h3" mt="32px">{title}</Title>}
    </Flex>
  );
});

export default PageHeader;
