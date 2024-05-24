/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import { LngLat, Popup } from 'mapbox-gl';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import MapView, { map } from './core/MapView';
import MapPositions from './MapPositions';
import { useTranslation } from '../common/components/LocalizationProvider';
import {
  createPopUpReportRoute, createPopUpSimple,
} from '../common/util/mapPopup';
import { attsGetter } from '../common/util/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    // margin: theme.spacing(1.5),
    // width: theme.dimensions.drawerWidthDesktop,
    margin: 0,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
    color: 'white',
  },
  slider: {
    width: '100%',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formControlLabel: {
    height: '100%',
    width: '100%',
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1px',
    paddingLeft: '20px',
    paddingRight: '20px',
    width: '97.5%',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(2),
      position: 'fixed',
      width: '90%',
      bottom: '8%',
    },
    [theme.breakpoints.up('md')]: {
      // marginTop: theme.spacing(1),
    },
    lineHeight: '1px',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    '&:hover': {
      backgroundColor: 'white',
      pointerEvents: 'auto',
    },

  },
}));

async function downloadUrlFetch(url) {
  const downloadObj = await fetch(url);
  const downloadBlob = await downloadObj.blob();
  const downloadURL = URL.createObjectURL(downloadBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadURL;
  anchor.download = url.substring(url.lastIndexOf('/') + 1);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadURL);
}

async function downloadUrl(url) {
  const downloadObj = await fetch(url);
  const downloadBlob = await downloadObj.blob();
  const downloadURL = URL.createObjectURL(downloadBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadURL;
  anchor.download = url.substring(url.lastIndexOf('/') + 1);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadURL);
}

const DynamicMovementPosition = ({ pos }) => {
  // Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item?.remove());
  // console.log('DynamicMovementPosition');
  const timerRef = useRef();
  const t = useTranslation();
  const classes = useStyles();
  // const navigate = useNavigate();

  // const hours12 = usePreference('twelveHourFormat');

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState(pos);
  const [stops, setStops] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  // const [showCard, setShowCard] = useState(false);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(500);

  const [value, setValue] = React.useState([50, 100]);
  // const [marker, setMarker] = useState(null);

  const memoPositions = useMemo(() => positions, [positions]);
  const memoStops = useMemo(() => stops, [stops]);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  window.deviceName = deviceName;

  useEffect(() => {
    clearInterval(timerRef.current);
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        // changeIndex(null, (index) => index + 1);
        setIndex((index) => index + 1);
      }, speed);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions, speed]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      // setPlaying(false);
      window.marker = null;
    }
  }, [index, positions]);

  useEffect(() => {
    if (positions && positions.length > 0) {
      Array.from(document.getElementsByClassName('mapboxgl-popup')).filter((popup) => popup.id !== '').map((item) => item.remove());
      const speed = parseFloat((attsGetter(positions[index], 'speed') ?? (attsGetter(positions[(index - 1) > 0 ? index - 1 : 0], 'speed') ?? '0 -')).split(' ')[0]) || 0;
      const currentType = (speed < value[0] ? 1 : (speed < value[1] ? 2 : 3));
      const color = (currentType === 1 ? 'green' : (currentType === 2 ? 'orange' : 'red'));
      if (map.getBounds().contains(new LngLat(positions[index]?.longitude, positions[index]?.latitude))) {
        requestAnimationFrame(() => {
          const p = new Popup()
            .setMaxWidth('400px')
            .setOffset(40)
            .setHTML(createPopUpReportRoute(positions[index]))
            .setLngLat([positions[index]?.longitude, positions[index]?.latitude])
            .addTo(map);
          p.getElement().id = positions[index].deviceId;
          window.marker = p;
          window.marker._content.classList.add(`mapboxgl-popup-content-${color}`);
        });
      } else {
        const p = new Popup()
          .setMaxWidth('400px')
          .setOffset(40)
          .setHTML(createPopUpReportRoute(positions[index]))
          .setLngLat([positions[index]?.longitude, positions[index]?.latitude])
          .addTo(map);
        p.getElement().id = positions[index].deviceId;
        window.marker = p;
        window.marker._content.classList.add('mapboxgl-popup-content-green');
      }
    }
  }, [index]);

  const onMarkerClick = useCallback((_, deviceId, map, event) => {
    if (event === undefined) return;
    const stopsMarkers = map.queryRenderedFeatures(event.point, { layers: ['stops-layer'] });
    stopsMarkers.forEach((stop) => (new Popup()
      .setMaxWidth('400px')
      .setOffset(40)
      .setHTML(createPopUpSimple(stops[stop.properties.index]))
      .setLngLat([stops[stop.properties.index].longitude, stops[stop.properties.index].latitude])
      .addTo(map)));
  }, [memoPositions, memoStops]);

  useEffect(() => {
    setIndex(0);
  }, []);

  useEffect(() => {
    setIndex(0);
    setPlaying(true);
  }, [positions]);

  return (
    <div className={classes.root}>
      <MapView>
        {index < memoPositions.length && (
          <MapPositions positions={memoPositions} index={index} onClick={onMarkerClick} titleField="fixTime" replay showStatus />
        )}
      </MapView>
    </div>
  );
};

export default DynamicMovementPosition;
