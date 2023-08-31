import React from "react";
import {observer} from "mobx-react";
import {streamStore} from "../../stores";
import Table from "Components/Table";

const Streams = observer(() => {
  return (
    <div className="streams">
      <div className="page-header">Streams</div>
      <div className="streams__list-items">
        <Table
          headers={[
            {label: "Title"},
            {label: "Object ID"},
            {label: "Status"}
          ]}
          rows={(Object.keys(streamStore.streams) || []).map(slug => (
            {
              id: slug,
              cells: [
                {
                  label: streamStore.streams[slug].display_title || streamStore.streams[slug].title
                },
                {
                  label: streamStore.streams[slug].objectId || ""
                }
              ]
            }
          ))}
        />
      </div>
    </div>
  );
});

export default Streams;
