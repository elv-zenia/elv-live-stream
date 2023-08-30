import React, {useState} from "react";
import {observer} from "mobx-react";
import {streamStore} from "../../stores";
import {toJS} from "mobx";
import Video from "Components/Video";
import AspectRatio from "Components/AspectRatio";
import Table from "Components/Table";

const GridView = observer(() => {
  return (
    <div className="streams__grid-items">
      {
        (Object.keys(streamStore.streams) || [])
          .map((slug) => (
            <div key={slug} className="streams__grid-item-container">
              <div className="streams__video-wrapper">
                <AspectRatio>
                  <Video videoMetadata={streamStore.streams[slug]} />
                </AspectRatio>
              </div>
              <div className="streams__grid-item-details">
                {streamStore.streams[slug].display_title || streamStore.streams[slug].title}
              </div>
            </div>
          ))
      }
    </div>
  );
});

const ListView = observer(() => {
  return (
    <div className="streams__list-items">
      <Table
        headers={[
          {label: "Title"}
        ]}
        rows={(Object.keys(streamStore.streams) || []).map(slug => (
          {
            cells: [{
              label: streamStore.streams[slug].display_title || streamStore.streams[slug].title
            }]
          }
        ))}
      />
    </div>
  );
});

const Streams = observer(() => {
  const [view] = useState("GRID");
  console.log("streams", toJS(streamStore.streams));
  return (
    <div className="streams">
      <div className="page-header">Streams</div>
      {/*<button onClick={() => setView(prevState => prevState === "GRID" ? "LIST" : "GRID")}>SWITCH</button>*/}
      {
        view === "GRID" ?
          <GridView /> :
          <ListView />
      }
    </div>
  );
});

export default Streams;
