import {useEffect} from "react";
import {streamStore} from "Stores";
import {observer} from "mobx-react";

const DataWrapper = observer(({children}) => {
  useEffect(() => {
    console.log("all streams", streamStore.streams);
    if(streamStore.streams) {
      const activeStreams = Object.keys(streamStore.streams)
        .filter(slug => streamStore.streams[slug].active)
        .map(slug => streamStore.streams[slug].objectId);

      HandleStreamSetup({streams: activeStreams});
    }
  }, [streamStore.streams]);

  const HandleStreamSetup = async ({streams}) => {
    for(let i = 0; i < streams.length; i++) {
      await streamStore.ConfigureStream({objectId: streams[i]});
    }
  };

  return children;
});

export default DataWrapper;
