/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import Notiflix from 'notiflix';
import { driver } from 'driver.js';
import store from './store';
import { LocalizationProvider } from './common/components/LocalizationProvider';
import ErrorHandler from './common/components/ErrorHandler';
import theme from './common/theme';
import Navigation from './Navigation';
import preloadImages from './map/core/preloadImages';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// import tileCacheDb from './tileCacheDb';
import NativeInterface from './common/components/NativeInterface';
import ServerProvider from './ServerProvider';
import ErrorBoundary from './ErrorBoundary';

// styles
import './resources/libs/jsPanel/jspanel.min.css';
import './resources/libs/jsPanel/extensions/dialog/jspanel.dialog.min.css';

// libs
import { jsPanel } from './resources/libs/jsPanel/jspanel.min';
import { loadModal } from './resources/libs/jsPanel/extensions/modal/jspanel.modal';
import { loadDialog } from './resources/libs/jsPanel/extensions/dialog/jspanel.dialog';
import InternalTools from './resources/libs/self/internal';
import './resources/libs/self/heartbeat.min';
import 'driver.js/dist/driver.css';
import alertify from './resources/libs/alertify/alertify.min';
import './resources/libs/alertify/css/alertify.css';
import './resources/libs/alertify/css/themes/default.min.css';

setTimeout(async () => {
  jsPanel.ziBase = (() => {
    let val = jsPanel.ziBase + 1000000; // here use the value you wish
    // eslint-disable-next-line no-plusplus
    return val++;
  })();
  window.jsPanel = jsPanel;
  window.Notiflix = Notiflix;
  window.InternalTools = InternalTools;
  window.driver = driver;
  window.alertify = alertify;
  loadModal();
  loadDialog();
  await preloadImages();
}, 0);

const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <LocalizationProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ServerProvider>
              <BrowserRouter>
                <Navigation />
              </BrowserRouter>
            </ServerProvider>
            <ErrorHandler />
            <NativeInterface />
          </ThemeProvider>
        </StyledEngineProvider>
      </LocalizationProvider>
    </Provider>
  </ErrorBoundary>,
);

serviceWorkerRegistration.register();
