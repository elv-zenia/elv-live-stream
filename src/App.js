import React from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/Loader";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import LeftNavigation from "Components/LeftNavigation";
import Create from "Pages/create/Create";
import VideoPlusIcon from "Assets/icons/video-plus";
import Streams from "Pages/streams/Streams";
import StreamIcon from "Assets/icons/stream";
import Monitor from "Pages/monitor/Monitor";
import MediaIcon from "Assets/icons/media";
import DataWrapper from "Components/DataWrapper";

export const appRoutes = [
  {path: "/", element: <Navigate replace to="/create" />},
  {path: "/create", element: <Create />, label: "Create", icon: VideoPlusIcon},
  {path: "/streams", element: <Streams />, label: "Streams", icon: StreamIcon},
  {path: "/monitor", element: <Monitor />, label: "Monitor", icon: MediaIcon}
];

const AppRoutes = observer(() => {
  return (
    <Routes>
      {
        appRoutes.map(({path, element, exact}) => (
          <Route
            exact={exact}
            key={path}
            path={path}
            element={element}
          />
        ))
      }
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
