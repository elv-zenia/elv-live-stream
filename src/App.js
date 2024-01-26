import React from "react";
import {observer} from "mobx-react";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import {rootStore} from "Stores";

import {MantineProvider, ActionIcon} from "@mantine/core";
import {IconX} from "@tabler/icons-react";

import {PageLoader} from "Components/Loader";
import LeftNavigation from "Components/LeftNavigation";
import DataWrapper from "Components/DataWrapper";

import Create from "Pages/create/Create";
import Streams from "Pages/streams/Streams";
import Monitor from "Pages/monitor/Monitor";
import StreamPreview from "Pages/streams/StreamPreview";

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/streams" />} />
      <Route path="/create" element={<Create />} />
      <Route path="/streams" element={<Streams />} />
      <Route path="/monitor" element={<Monitor />} />
      <Route path="/streams/:id" element={<StreamPreview />} />
    </Routes>
  );
});

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

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS withCSSVariables>
      <HashRouter>
        <LeftNavigation />
        <main>
          <ErrorBanner />
          <div className="main-content">
            <DataWrapper>
              { rootStore.loaded ? <AppRoutes /> : null}
            </DataWrapper>
          </div>
        </main>
      </HashRouter>
    </MantineProvider>
  );
});

export default App;
