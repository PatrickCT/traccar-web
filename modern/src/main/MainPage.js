/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import { Popup } from 'maplibre-gl';
import {
  FormControlLabel,
  FormGroup,
  Paper,
} from '@mui/material';
import Drawer from 'react-bottom-drawer';
import Checkbox from '@mui/material/Checkbox';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import DeviceListTransport from './DeviceListTransport';
import BottomMenu from '../common/components/BottomMenu';
// import StatusCard from '../common/components/StatusCard';
// import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import MainMap from './MainMap';
// import { useAttributePreference } from '../common/util/preferences';
import {
  // createPopUp,
  streetView,
  generateRoute,
} from '../common/util/mapPopup';
import { map } from '../map/core/MapView';
import './MainPage.css';
import Counter from '../common/components/Counter';
import Modal from './components/BasicModal';
import ConnectionStatus from '../common/components/ConnectionStatus';
import DebtModal from '../common/components/DebtModal';
import PositionDrawer from './PositionInfoDrawer';
import { useAdministrator } from '../common/util/permissions';
import BroadcastAlert from './components/BroadcastAlert';
import { LayersManager } from '../common/util/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
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

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

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

  const [showModalRevision, setShowModalRevision] = useState(false);

  // drawer
  const [isVisible, setIsVisible] = React.useState(false);
  const openDrawer = React.useCallback(() => setIsVisible(true), []);
  const closeDrawer = React.useCallback(() => setIsVisible(false), []);

  const [infoDrawer, setInfoDrawer] = useState(true);
  const admin = useAdministrator();

  // Function to open the modal
  const openModal = () => {
    setShowModalRevision(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModalRevision(false);
  };

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
    setTimeout(() => {
      document.getElementById('main-style').removeAttribute('disabled');
      // document.getElementById('jspanel-style').removeAttribute('disabled');
      // document.getElementById('jsmodal-style').removeAttribute('disabled');
    }, 0);
    const intervalResize = setInterval(() => {
      const canvas_h = Number(map.getCanvasContainer().firstChild.getAttribute('height'));
      const screen_h = window.screen.height;

      if (((canvas_h * 100) / screen_h) < 50) {
        window.map.resize();
      } else {
        clearInterval(intervalResize);
      }
    }, 1000);
    // Attach the function to the global window object
    window.navigate = navigate;
    window.streetView = streetView;
    window.generateRoute = generateRoute;
    window.position = selectedPosition;
    window.map = map;
    window.showDevicesList = setDevicesOpen;
    window.localStorage.setItem('showMapPopup', true);
    window.groupsNames = groups;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openDrawer = openDrawer;
    window.closeDrawer = closeDrawer;
    window.layerManager = LayersManager.getInstance(20);

    const checkScriptLoaded = () => {
      if (typeof InternalTools !== 'undefined') {
        if (!window.internalTools) {
          window.internalTools = new InternalTools();
        }
      }
    };

    const intervalId = setInterval(checkScriptLoaded, 100);

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
      Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
      window.device = filteredDevices.find((item) => item.id === selectedDeviceId);
      window.position = selectedPosition;
      window.rtmPopUp(selectedPosition || { deviceId: window.device.id, id: 0, latitude: window.map.getCenter().lat, longitude: window.map.getCenter().lng });
    } catch (error) {
      Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
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
            {user.attributes.hasOwnProperty('Transporte') &&
              user.attributes.Transporte ? (<DeviceListTransport devices={filteredDevices} />) : (<DeviceList devices={filteredDevices} />)}
          </Paper>
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      <Modal isOpen={showModalRevision} onClose={closeModal}>
        <h1>Revisión</h1>
        <h3>
          Ultima revisión:
          {moment().format(' dddd, MMMM Do YYYY, h:mm:ss a')}
        </h3>
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Llantas" />
          <FormControlLabel control={<Checkbox />} label="AC" />
          <FormControlLabel control={<Checkbox />} label="Aceite" />
          <FormControlLabel control={<Checkbox />} label="Refacciones" />
        </FormGroup>
      </Modal>
      <ConnectionStatus />
      {
        user.debt && (
          <DebtModal />
        )
      }
      <Drawer
        className="drawer"
        duration={250}
        hideScrollbars={false}
        onClose={closeDrawer}
        isVisible={isVisible}
      >
        <iframe title="Promociones" src="./promotions.html" frameBorder="0" width="100%" height="90%" />
      </Drawer>
      {selectedPosition && admin && (
        <PositionDrawer onClose={() => setInfoDrawer(false)} open={infoDrawer} />
      )}
      <BroadcastAlert notifications={[]} />
    </div>
  );
};

export default MainPage;
