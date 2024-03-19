import React from "react";
import {observer} from "mobx-react";
import {rootStore} from "Stores";
import {ActionIcon} from "@mantine/core";
import {IconX} from "@tabler/icons-react";

const ErrorBanner = observer(() => {
  if(!rootStore.errorMessage) { return null; }

  return (
    <div className="error-banner">
      <div className="error-banner__message">
        {rootStore.errorMessage}
      </div>
      <ActionIcon className="error-banner__close" onClick={() => rootStore.SetErrorMessage(undefined)}>
        <IconX />
      </ActionIcon>
    </div>
  );
});

export default ErrorBanner;
