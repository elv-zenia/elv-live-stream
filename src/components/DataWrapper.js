import {useEffect} from "react";
import {streamStore} from "Stores";
import {observer} from "mobx-react";
import {toJS} from "mobx";

const DataWrapper = observer(({children}) => {
  useEffect(() => {
    console.log("all streams", toJS(streamStore.streams));
    if(streamStore.streams) {
      const activeStreams = Object.keys(streamStore.streams)
        .filter(slug => streamStore.streams[slug].active && streamStore.streams[slug].status === "created")
        .map(slug => streamStore.streams[slug].objectId);

      HandleStreamSetup({streams: activeStreams});
    }
  }, [streamStore.streams]);

  const HandleStreamSetup = async ({streams}) => {
    for(let i = 0; i < streams.length; i++) {
      await streamStore.ConfigureStream({
        objectId: streams[i]
      });
    }
  };

  return children;
});

export default DataWrapper;
