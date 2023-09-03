import React from "react";
import ReactDOM from "react-dom/client";
import {Provider} from "mobx-react";
import * as Stores from "./stores";

import "Assets/stylesheets/app.scss";
import App from "./App";

const rootElement = ReactDOM.createRoot(document.getElementById("app"));

rootElement.render(
  <Provider {...Stores}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
