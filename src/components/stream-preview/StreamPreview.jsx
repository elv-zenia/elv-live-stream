import {observer} from "mobx-react-lite";
import {useParams, useNavigate} from "react-router-dom";
import {rootStore, streamStore} from "@/stores/index.js";
import AppFrame from "@/components/app-frame/AppFrame.jsx";
import {Loader} from "@/components/Loader.jsx";
import styles from "./StreamPreview.module.css";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import {ChevronLeftIcon} from "@/assets/icons/index.js";

const StreamPreview = observer(() => {
  const {id} = useParams();
  const streamSlug = Object.keys(streamStore.streams || {}).find(slug => (
    streamStore.streams[slug].objectId === id
  ));
  const streamObject = streamStore.streams?.[streamSlug];
  const navigate = useNavigate();

  if(!streamObject) {
    return (
      <div
        style={{
          display: "flex",
          height: "500px",
          width: "100%",
          alignItems: "center"
        }}
        className="stream-preview"
      >
        <Loader />
      </div>
    );
  }

  const libraryId = streamStore.streams[streamSlug].libraryId;
  const queryParams = {
    contentSpaceId: rootStore.contentSpaceId,
    libraryId,
    objectId: id,
    action: "display",
    playerProfile: "live"
  };
  // eslint-disable-next-line no-undef
  const appUrl = EluvioConfiguration.displayAppUrl;

  return (
    <PageContainer
      title={`Preview ${streamObject.display_title || streamObject.title || streamObject.objectId}`}
      actions={[
        {
          label: "Streams",
          leftSection: <ChevronLeftIcon />,
          variant: "filled",
          onClick: () => navigate("/streams")
        }
      ]}
    >
      <AppFrame
        className={styles.root}
        appUrl={appUrl}
        queryParams={queryParams}
        onComplete={() => this.setState({completed: true})}
        onCancel={() => this.setState({completed: true})}
        Reload={() => this.setState({pageVersion: this.state.pageVersion + 1})}
      />
    </PageContainer>
  );
});

export default StreamPreview;
