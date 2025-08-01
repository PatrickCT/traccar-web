/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import React from 'react';

// special libs
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { driver } from 'driver.js';
import html2canvas from 'html2canvas';
import Notiflix from 'notiflix';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ErrorHandler from './common/components/ErrorHandler';
import { LocalizationProvider } from './common/components/LocalizationProvider';
import NativeInterface from './common/components/NativeInterface';
import theme from './common/theme';
import ErrorBoundary from './ErrorBoundary';
import preloadImages from './map/core/preloadImages';
import Navigation from './Navigation';
import ServerProvider from './ServerProvider';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import store from './store';

// styles

// libs
import './resources/libs/self/heartbeat.min.js';
import InternalTools from './resources/libs/self/internal.js';
// import './resources/libs/self/cache';
import 'driver.js/dist/driver.css';
import PushNotificationsManager from './common/util/push.js';
import { surveysTour } from './common/util/tours.js';
import { createBaseURL } from './common/util/utils.jsx';
import { loadDialog } from './resources/libs/jsPanel/extensions/dialog/jspanel.dialog.js';
import { loadModal } from './resources/libs/jsPanel/extensions/modal/jspanel.modal.js';
import { jsPanel } from './resources/libs/jsPanel/jspanel.js';

setTimeout(async () => {
  window.jsPanel = jsPanel;
  jsPanel.ziBase = (() => {
    let val = jsPanel.ziBase + 1000000; // here use the value you wish
    // eslint-disable-next-line no-plusplus
    return val++;
  })();
  window.Notiflix = Notiflix;
  window.InternalTools = InternalTools;
  window.driver = driver;
  window.PushNotificationsManager = PushNotificationsManager;
  window.html2canvas = html2canvas;
  window.createBaseURL = createBaseURL;
  window.surveysTour = surveysTour;
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
window.addEventListener('load', () => {
  sessionStorage.removeItem('hasRefreshed');
});
