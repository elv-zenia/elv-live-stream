import React from "react";
import ReactDOM from "react-dom/client";
import {HashRouter, Route, Routes} from "react-router-dom";
import {observer, Provider} from "mobx-react";

import * as Stores from "./stores";
import LeftNavigation from "Components/LeftNavigation";
import {PageLoader} from "Components/Loader";
import Create from "./pages/create/Create";
import Streams from "./pages/streams/Streams";
import StreamItem from "./pages/stream-item/StreamItem";
import Manage from "./pages/manage/Manage";

import "Assets/stylesheets/app.scss";
import GearIcon from "Assets/icons/gear.svg";
import VideoPlusIcon from "Assets/icons/video-plus.svg";
import StreamIcon from "Assets/icons/stream.svg";

const rootElement = ReactDOM.createRoot(document.getElementById("app"));

export const appRoutes = [
  {path: "/", element: <Create />, exact: true},
  {path: "/create", element: <Create />, label: "Create", icon: VideoPlusIcon},
  {path: "/streams", element: <Streams />, label: "Streams", icon: StreamIcon},
  {path: "/manage", element: <Manage />, label: "Manage", icon: GearIcon},
  {path: "/manage/:id", element: <StreamItem />}
];

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <main>
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
    </main>
  );
});

rootElement.render(
  <Provider {...Stores}>
    <React.StrictMode>
      <HashRouter>
        <div className="app-container">
          <LeftNavigation />
          <App />
        </div>
      </HashRouter>
    </React.StrictMode>
  </Provider>
);
