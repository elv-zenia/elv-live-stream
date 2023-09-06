import React from "react";
import {observer} from "mobx-react";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";

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
      <Route path="/" element={<Navigate replace to="/create" />} />
      <Route path="/create" element={<Create />} />
      <Route path="/streams" element={<Streams />} />
      <Route path="/monitor" element={<Monitor />} />
      <Route path="/streams/:id" element={<StreamPreview />} />
    </Routes>
  );
});

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <HashRouter>
      <LeftNavigation />
      <main>
        <DataWrapper>
          { rootStore.loaded ? <AppRoutes /> : null}
        </DataWrapper>
      </main>
    </HashRouter>
  );
});

export default App;
