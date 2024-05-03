import React from "react";
import {observer} from "mobx-react";
import ConfirmModal from "Components/ConfirmModal";

const ProbeConfirmation = observer(({
  show,
  CloseCallback,
  ConfirmCallback
}) => {
  return (
    <ConfirmModal
      show={show}
      CloseCallback={CloseCallback}
      title="Create and Probe Stream"
      message="Are you sure you want to probe the stream? This will also create the content object."
      ConfirmCallback={async () => {
        try {
          await ConfirmCallback();
          CloseCallback();
        } catch(error) {
          console.error("Unable to probe stream", error);
          throw Error(error);
        }
      }}
    />
  );
});

export default ProbeConfirmation;
