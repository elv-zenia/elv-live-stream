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
        .map(slug => ({
          objectId: streamStore.streams[slug].objectId,
          slug
        }));

      // CheckStreamStatus();
      HandleStreamSetup({streams: activeStreams});
    }
  }, [streamStore.streams]);

  // const CheckStreamStatus = async () => {
  //   const promises = [];
  //   for(let slug of Object.keys(streamStore.streams)) {
  //     promises.push(
  //       streamStore.CheckStatus({
  //         slug,
  //         objectId: streamStore.streams[slug].objectId
  //       })
  //     );
  //   }
  //
  //   await Promise.all(promises);
  // };

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
