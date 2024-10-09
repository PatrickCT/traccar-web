/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import React, {
  useState, useCallback, useRef, useEffect, useMemo, memo,
} from 'react';
import { LngLat, Popup } from 'maplibre-gl';
import * as turf from '@turf/turf';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import MapView, { map } from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePathReplay';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositionsReplay';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import {
  createPopUp,
  createPopUpReportRoute, createPopUpSimple,
} from '../common/util/mapPopup';
import ReplaySideBar from './ReplaySideBar';
import { attConverter } from '../common/util/utils';
import { toast } from '../common/util/toasts';
import './ReplayPage.css';

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

const ReplayPage = () => {
  // Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item?.remove());
  const timerRef = useRef();
  const t = useTranslation();
  const classes = useStyles();
  // const navigate = useNavigate();

  // const hours12 = usePreference('twelveHourFormat');

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [stops, setStops] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  // const [showCard, setShowCard] = useState(false);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const [value, setValue] = React.useState([50, 100]);
  // const [marker, setMarker] = useState(null);

  const memoPositions = useMemo(() => positions, [positions]);
  const memoStops = useMemo(() => stops, [stops]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
  window.Popup = Popup;

  const changeIndex = useCallback((_, index) => {
    setIndex(index);
  }, [setIndex]);

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
      setPlaying(false);
      window.marker = null;
    }
  }, [index, positions]);

  useEffect(() => {
    if (positions && positions.length > 0) {
      Array.from(document.getElementsByClassName('maplibregl-popup')).filter((popup) => popup.id !== '').map((item) => item.remove());
      const speed = parseFloat((attConverter(positions[index], 'speed') ?? (attConverter(positions[(index - 1) > 0 ? index - 1 : 0], 'speed') ?? '0 -')).split(' ')[0]) || 0;
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
          window.marker._content.style = `--custom_color: ${color}`;
          window.marker._content.classList.remove('maplibregl-popup-content');
          window.marker._content.classList.add('maplibregl-popup-content-custom');
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
        window.marker._content.classList.add('maplibregl-popup-content-green');
      }
    }
  }, [index]);

  const onPointClick = useCallback((_, index) => {
    setIndex(index);
  }, [setIndex]);

  const onMarkerClick = useCallback((_, deviceId, map, event) => {
    // if (event === undefined) return;
    // const stopsMarkers = map.queryRenderedFeatures(event.point, { layers: ['stops-layer'] });

    // stopsMarkers.forEach((stop) => (new Popup()
    //   .setMaxWidth('400px')
    //   .setOffset(40)
    //   .setHTML(createPopUpSimple(stops[stop.properties.index]))
    //   .setLngLat([stops[stop.properties.index].longitude, stops[stop.properties.index].latitude])
    //   .addTo(map)));
  }, [memoPositions, memoStops]);

  const changeSpeed = useCallback((_, value) => {
    setSpeed(value);
  }, [speed]);

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    setFrom(from);
    setTo(to);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);
    const response2 = await fetch(`/api/reports/stops?${query.toString()}`, { headers: { accept: 'application/json' } });
    if (response.ok) {
      setIndex(0);
      const p = await response.json();
      const positions = [];
      const stops = [];

      p.forEach((position, index) => {
        positions.push({ ...position, original: true });
        if (index < p.length - 1) {
          const distance = turf.distance(turf.point([p[index].longitude, p[index].latitude]), turf.point([p[index + 1].longitude, p[index + 1].latitude]), { units: 'meters' });
          if (parseInt(distance, 10) > 0) {
            const steps = parseInt(distance / 2, 10);
            let fillers = [];
            for (let i = 0; i < steps; i += 1) {
              const point = turf.along(turf.lineString([[p[index].longitude, p[index].latitude], [p[index + 1].longitude, p[index + 1].latitude]]), ((i + 1) * 2), { units: 'meters' });
              if (point) {
                fillers.push({ ...position, original: false, longitude: point?.geometry.coordinates[0], latitude: point?.geometry.coordinates[1] });
              }
            }
            const fillerCourse = (fillers.reduce((acc, obj) => acc + parseFloat(obj.course ?? ''), 0) / fillers.length);
            fillers = fillers.map((filler) => ({ ...filler, course: fillerCourse }));
            positions.push(...fillers);
          }
        }
      });

      if (response2.ok) {
        const p = await response2.json();
        p.forEach((s) => stops.push(s));
      } else {
        throw Error(await response2.text());
      }

      setPositions(positions);
      setStops(stops);
      if (positions.length) {
        setExpanded(false);
      } else {
        throw Error(t('sharedNoData'));
      }
    } else {
      throw Error(await response.text());
    }

    // stops
  });

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    toast.toast('Descargando, por favor espere');
    window.location.assign(`/api/reports/route/xlsx?${query.toString()}`);
    // window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} values={value} />
        <MapRoutePoints positions={positions} onClick={onPointClick} replay />
        {index < memoPositions.length && (
          <MapPositions selectedPosition={positions[index]} positions={memoPositions} index={index} onClick={onMarkerClick} titleField="fixTime" replay showStatus stops={memoStops} />
        )}
      </MapView>
      <MapCamera positions={positions} />
      <ReplaySideBar
        changeSpeed={changeSpeed}
        setExpanded={setExpanded}
        setIndex={changeIndex}
        setPlaying={setPlaying}
        handleChange={handleChange}
        handleDownload={handleDownload}
        handleSubmit={handleSubmit}
        index={index}
        playing={playing}
        marks={memoPositions.map((_, index) => ({ value: index }))}
        max={memoPositions.length}
        expanded={expanded}
        value={value}
        stops={stops}
      />
      {/* {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )} */}
    </div>
  );
};

export default memo(ReplayPage);
