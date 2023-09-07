import {useEffect} from "react";
import {streamStore} from "Stores";
import {observer} from "mobx-react";

const DataWrapper = observer(({children}) => {
  useEffect(() => {

    const GetStatus = async () => {
      try {
        await streamStore.AllStreamsStatus();
      } catch(error) {
        console.error("Unable to get stream status.", error);
      }
    };

    GetStatus();

    let intervalId = setInterval(async () => {
      await GetStatus();
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if(streamStore.streams) {
      const activeStreams = Object.keys(streamStore.streams)
        .filter(slug => streamStore.streams[slug].active && streamStore.streams[slug].status === "created")
        .map(slug => ({
          objectId: streamStore.streams[slug].objectId,
          slug
        }));

      HandleStreamSetup({streams: activeStreams});
    }
  }, [streamStore.streams]);

  const HandleStreamSetup = async ({streams}) => {
    for(let i = 0; i < streams.length; i++) {
      await streamStore.ConfigureStream({
        objectId: streams[i].objectId,
        slug: streams[i].slug
      });
    }
  };

  return children;
});

export default DataWrapper;
