/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-children-prop */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Marker } from 'maplibre-gl';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import {
  generateRoute,
  streetView,
} from '../common/util/mapPopup';
import { map } from '../map/core/MapView';
import './BannerNoAuth.css';
import MainMap from './MainMapNoAuth';
import './MainPage.css';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
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

const MainPageNoAuth = () => {
  const classes = useStyles();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);

  const selectedPosition = Object.values(positions).find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const groups = useSelector((state) => state.groups.items);

  const navigate = useNavigate();

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

    // Attach the function to the global window object
    window.navigate = navigate;
    window.streetView = streetView;
    window.generateRoute = generateRoute;
    window.position = selectedPosition;
    window.map = map;
    window.groupsNames = groups;

    // Clean up the function when the component unmounts
    return () => {
      delete window.navigate;
      delete window.streetView;
      delete window.position;
      delete window.generateRoute;
      delete window.device;
      delete window.map;
      delete window.groupsNames;
      window.localStorage.removeItem('showMapPopup');
    };
  }, []);

  return (
    <div className={classes.root}>
      {desktop && (
        <MainMap
          filteredPositions={Object.values(positions)}
          selectedPosition={selectedPosition}
          onEventsClick={() => { }}
        />
      )}
      <div className={classes.sidebar}>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={Object.values(positions)}
                selectedPosition={selectedPosition}
                onEventsClick={() => { }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPageNoAuth;
