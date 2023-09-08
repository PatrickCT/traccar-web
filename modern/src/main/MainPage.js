import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popup } from 'maplibre-gl';
import {
  Paper,
} from '@mui/material';
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
import { useAttributePreference } from '../common/util/preferences';
import {
  createPopUp,
  streetView,
  generateRoute,
} from '../common/util/mapPopup';
import { map } from '../map/core/MapView';
import './MainPage.css';

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

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

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

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

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
    // Attach the function to the global window object
    window.navigate = navigate;
    window.streetView = streetView;
    window.generateRoute = generateRoute;
    window.position = selectedPosition;
    window.map = map;
    window.showDevicesList = setDevicesOpen;
    window.localStorage.setItem('showMapPopup', true);

    // Clean up the function when the component unmounts
    return () => {
      console.log('cleanin up');
      delete window.navigate;
      delete window.streetView;
      delete window.position;
      delete window.generateRoute;
      delete window.device;
      delete window.map;
      delete window.showDevicesList;
      window.localStorage.removeItem('showMapPopup');
    };
  }, []);

  useEffect(() => {
    try {
      Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
      window.device = filteredDevices.find((item) => item.id === selectedDeviceId);
      window.position = selectedPosition;

      if (window.position !== undefined && window.localStorage.getItem('showMapPopup') === 'true') {
        window.popup = new Popup()
          .setMaxWidth('400px')
          .setHTML(createPopUp(selectedPosition))
          .setLngLat([selectedPosition.longitude, selectedPosition.latitude])
          .addTo(map);
      }
    } catch (error) {
      Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
    }
  }, [selectedPosition]);

  return (
    <div className={classes.root}>
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

    </div>
  );
};

export default MainPage;
