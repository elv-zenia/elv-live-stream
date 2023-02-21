import React from "react";
import ReactDOM from "react-dom/client";
import {HashRouter, Route, Routes} from "react-router-dom";
import {observer, Provider} from "mobx-react";

import * as Stores from "./stores";
import "Assets/stylesheets/app.scss";
import LeftNavigation from "Components/LeftNavigation";
import {PageLoader} from "Components/Loader";
import Create from "Pages/Create";

const rootElement = ReactDOM.createRoot(document.getElementById("app"));

export const appRoutes = [
  {path: "/create", element: <Create />, label: "Create"},
  {path: "/", element: <Create />, exact: true}
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
