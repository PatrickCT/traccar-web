/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-children-prop */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import {
  Paper,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Marker } from 'maplibre-gl';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import DeviceList from './DeviceList';
// import DeviceListTransport from './DeviceListTransport';
import BottomMenu from '../common/components/BottomMenu';
import Counter from '../common/components/Counter';
import {
  generateRoute,
  streetView,
} from '../common/util/mapPopup';
import usePersistedState from '../common/util/usePersistedState';
import { map } from '../map/core/MapView';
import EventsDrawer from './EventsDrawer';
import MainMap from './MainMap';
import './MainPage.css';
import MainToolbar from './MainToolbar';
import useFilter from './useFilter';
// import ConnectionStatus from '../common/components/ConnectionStatus';
import DebtModal from '../common/components/DebtModal';
import { useAdministrator } from '../common/util/permissions';
import PushNotificationsManager from '../common/util/push';
import { toast } from '../common/util/toasts';
import { LayersManager } from '../common/util/utils';
import Banner from './components/Banner';
import SurveysDialog from './components/SurverysDialog';
import LinksModal from './LinksModal';
import MainMapButtons from './MainMapButtons';
import ManualExitsModal from './ManualExitsModal';
import PositionDrawer from './PositionInfoDrawer';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    overflowY: 'hidden',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down('md')]: {
      height: '100%',
      width: '100%',
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: 'grid',
  },
  contentMap: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
  },
  contentList: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
    zIndex: 4,
  },
  custompopup: {
    background: '#06376A',
    padding: '10px',
    color: 'black',
  },

}));

const MainPage = () => {
  const classes = useStyles();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  // const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const user = useSelector((state) => state.session.user);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);
  const groups = useSelector((state) => state.groups.items);

  const [infoDrawer, setInfoDrawer] = useState(true);

  /* eslint-disable no-unused-vars */
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBottomMenu, setShowBottomMenu] = useState(searchParams.get('showBottomMenu') || true);
  const admin = useAdministrator();

  // banner
  const [bannerText, setBannerText] = useState('');

  // markers
  // const markers = [];

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);
  const navigate = useNavigate();

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  useEffect(() => {
    const intervalResize = setInterval(() => {
      const canvas_h = Number(map.getCanvasContainer().firstChild.getAttribute('height'));
      const screen_h = window.screen.height;

      if (((canvas_h * 100) / screen_h) < 50) {
        window.map?.resize();
      } else {
        clearInterval(intervalResize);
      }
    }, 1000);

    setInterval(() => {
      fetch('https://crmgpstracker.mx:4040/api/external/notifications/traccar/banner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin: location.hostname }) })
        .then((response) => response.json())
        .then((data) => {
          try {
            setTimeout(() => {
              setBannerText('');
            }, 1000 * 60 * 1);
            if (data.data.length > 0) {
              setBannerText(data.data.join(' * '));
            } else {
              setBannerText('');
            }
          } catch (err) {
            toast.toast(err.message);
          }
        });
    }, 1000 * 60 * 5);

    // Attach the function to the global window object
    window.navigate = navigate;
    window.streetView = streetView;
    window.generateRoute = generateRoute;
    window.position = selectedPosition;
    window.map = map;
    window.showDevicesList = setDevicesOpen;
    window.localStorage.setItem('showMapPopup', true);
    window.groupsNames = groups;
    window.layerManager = LayersManager.getInstance(20);

    try {
      const pushManager = new PushNotificationsManager();
      window.pushManager = pushManager;
    } catch (error) {
      console.error(error);
    }

    const checkScriptLoaded = () => {
      if (typeof InternalTools !== 'undefined') {
        if (!window.internalTools) {
          window.internalTools = new InternalTools();
          window.internalTools.init();
        }
      }
    };

    const intervalId = setInterval(checkScriptLoaded, 100);

    if (user.attributes.debug && window.screenLog) {
      window.screenLog.init({ autoScroll: true });
    }

    // Clean up the function when the component unmounts
    return () => {
      delete window.navigate;
      delete window.streetView;
      delete window.position;
      delete window.generateRoute;
      delete window.device;
      delete window.map;
      delete window.showDevicesList;
      delete window.groupsNames;
      window.localStorage.removeItem('showMapPopup');
      delete window.openModal;
      delete window.closeModal;
      // delete window.openDrawer;
      delete window.closeDrawer;
      window.internalTools?.destroy();
      delete window.internalTools;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    try {
      Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
      window.device = filteredDevices.find((item) => item.id === selectedDeviceId);
      window.position = selectedPosition;
      window.rtmPopUp(selectedPosition || { deviceId: window.device.id, id: 0, latitude: window.map.getCenter().lat, longitude: window.map.getCenter().lng });
    } catch (error) {
      Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
    }
  }, [selectedDeviceId]);

  return (
    <div className={classes.root}>
      {user && user.attributes.hasOwnProperty('FPS') && user.attributes.FPS && (
        <Counter />
      )}
      {desktop && (
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
        />
      )}
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
            setPositionInfoOpen={setInfoDrawer}
          />
        </Paper>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </div>
          )}
          <Paper
            square
            className={classes.contentList}
            style={devicesOpen ? {} : { visibility: 'hidden' }}
          >
            {/* {user.attributes.hasOwnProperty('Transporte') &&
              user.attributes.Transporte ? (<DeviceListTransport devices={filteredDevices} />) : (<DeviceList devices={filteredDevices} />)} */}
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && showBottomMenu && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {
        user.debt && !user.administrator && (
          <DebtModal />
        )
      }
      {selectedPosition && (admin || (user.attributes.hasOwnProperty('viewPositionTechnicalInformation') && user.attributes.viewPositionTechnicalInformation === true)) && (
        <PositionDrawer onClose={() => setInfoDrawer(false)} open={infoDrawer} />
      )}
      <Banner
        children={bannerText}
      />
      <LinksModal />
      <ManualExitsModal />
      <MainMapButtons />
      {!user.administrator && (user.main || (user.principal && user.principal > 0)) && (
        <SurveysDialog />
      )}
    </div>
  );
};

export default MainPage;
