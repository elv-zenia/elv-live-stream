import React from "react";
import {observer} from "mobx-react";
import {HashRouter} from "react-router-dom";
import {rootStore} from "Stores";

import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";
import {MantineProvider} from "@mantine/core";

import AppRoutes from "Routes";
import MantineTheme from "Assets/MantineTheme";
import {PageLoader} from "Components/Loader";
import LeftNavigation from "Components/LeftNavigation";
import DataWrapper from "Components/DataWrapper";
import ErrorBanner from "Components/error/ErrorBanner";

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <MantineProvider withCSSVariables theme={MantineTheme}>
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
