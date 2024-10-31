import {observer} from "mobx-react-lite";
import {Box, Flex, Group, Text} from "@mantine/core";
import HeaderSearchBar from "@/components/header/HeaderSearchBar.jsx";
import HeaderTopActions from "@/components/header/HeaderTopActions";
import StatusText from "@/components/status-text/StatusText.jsx";

const PageHeader = observer(({
  title,
  subtitle,
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
          <Flex direction="column">
            <Group>
              {title}
              <StatusText status={status} quality={quality} withBorder />
            </Group>
            <Box display="block">
              {
                subtitle &&
                <Text size="sm" c="gray" mt={6}>{subtitle}</Text>
              }
            </Box>
          </Flex>
        </div>
      }
    </Flex>
  );
});

export default PageHeader;
