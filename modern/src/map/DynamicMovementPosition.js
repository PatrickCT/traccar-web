/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import {
  useId, useCallback, useEffect, memo, useState,
  useRef,
} from 'react';
import * as turf from '@turf/turf';

import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import { map } from './core/MapView';
import { formatTime, getStatusColor } from '../common/util/formatter';
import { mapIconKey } from './core/preloadImages';
import { findFonts } from './core/mapUtil';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { hasPassedTime } from '../common/util/utils';
// import { createPopUpSimple } from '../common/util/mapPopup';

const DynamicMovementPosition = ({
  test = false,
}) => {
  const id = useId();
  const direction = `${id}-dynamic-direction`;

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

  const devices = useSelector((state) => state.devices.items);
  const hours12 = usePreference('twelveHourFormat');

  const timerRef = useRef();
  const [positions, setPositions] = useState([]);
  const [speed, setSpeed] = useState(100);
  const [playing, setPlaying] = useState(true);

  const createFeature = (devices, position) => {
    const device = devices[position.deviceId];

    return {
      id: position.id,
      deviceId: position.deviceId,
      name: device.name,
      fixTime: formatTime(position.fixTime, 'seconds', hours12),
      category: mapIconKey(device.category),
      color: 'neutral',
      rotation: position.course,
      direction: true,
      rotate: device.category === 'carDirection',
    };
  };

  useEffect(() => {
    map.addSource(`${id}-dynamic`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    map.addLayer({
      id,
      type: 'symbol',
      source: `${id}-dynamic`,
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': `${'{category}-{color}'}`,
        'icon-size': 0.08,
        'icon-allow-overlap': true,
        'text-field': `{${'name'}}`,
        'text-allow-overlap': true,
        'text-anchor': 'bottom',
        'text-offset': [0, -2 * iconScale],
        'text-font': findFonts(map),
        'text-size': 12,
        'icon-rotate': ['get', 'rotation'],
        // 'icon-rotate': ['get', 'rotation'],
        'icon-rotation-alignment': 'map',
      },
      paint: {
        'text-halo-color': 'white',
        'text-halo-width': 1,
      },
    });

    map.addLayer({
      id: direction,
      type: 'symbol',
      source: `${id}-dynamic`,
      filter: [
        'all',
        ['!has', 'point_count'],
        ['==', 'direction', true],
      ],
      layout: {
        'icon-image': 'direction',
        'icon-size': iconScale,
        'icon-allow-overlap': true,
        'icon-rotate': ['get', 'rotation'],
        'icon-rotation-alignment': 'map',
      },
    });

    clearInterval(timerRef.current);
    if (playing) {
      timerRef.current = setInterval(() => {
        // changeIndex(null, (index) => index + 1);
        window.app.index += 1;
      }, speed);
    }

    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    window.app.index = 0;
    console.log('================================');
    const positions = [];
    if (window.app.lastPosition !== null && window.app.lastPosition !== undefined && window.app.selectedPosition !== null && window.app.selectedPosition !== undefined) {
      const distance = turf.distance(turf.point([window.app.lastPosition?.longitude, window.app.lastPosition?.latitude]), turf.point([window.app.selectedPosition?.longitude, window.app.selectedPosition?.latitude]), { units: 'meters' });
      if (parseInt(distance, 10) > 0) {
        const steps = parseInt(distance / 2, 10);
        let fillers = [];
        for (let i = 0; i < steps; i += 1) {
          const point = turf.along(turf.lineString([[window.app.lastPosition.longitude, window.app.lastPosition.latitude], [window.app.selectedPosition.longitude, window.app.selectedPosition.latitude]]), ((i + 1) * 2), { units: 'meters' });
          fillers.push({ course: window.app.selectedPosition.course, original: false, longitude: point.geometry.coordinates[0], latitude: point.geometry.coordinates[1] });
        }
        const fillerCourse = (fillers.reduce((acc, obj) => acc + parseFloat(obj.course ?? ''), 0) / fillers.length);
        fillers = fillers.map((filler) => ({ ...filler, course: fillerCourse }));
        positions.push(...fillers);
      }
    }

    positions.push(window.app.selectedPosition);
    console.log(positions);

    map.getSource(`${id}-dynamic`)?.setData({
      type: 'FeatureCollection',
      features: [positions[window.app.index]].filter((it) => devices.hasOwnProperty(it?.deviceId)).map((position) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [position.longitude, position.latitude],
        },
        properties: createFeature(devices, position),
      })),
    });
  }, [window.app.selectedPosition]);

  return null;
};

export default memo(DynamicMovementPosition);
