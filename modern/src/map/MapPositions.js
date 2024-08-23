/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import {
  useId, useCallback, useEffect, memo, useState,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import { map } from './core/MapView';
import { formatTime, getStatusColor } from '../common/util/formatter';
import { mapIconKey } from './core/preloadImages';
import { findFonts } from './core/mapUtil';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import RealTimeMovement from '../main/components/RealTimeMarker';
import { checkClusters } from '../common/util/geospatial';

const isEqual = require('react-fast-compare');

const propPrint = (prop) => {
  switch (typeof prop) {
    case 'object': return JSON.stringify(prop);
    case 'undefined': return 'NULL';
    default: return prop;
  }
};

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  // eslint-disable-next-line func-names
  return function () {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

const MapPositions = ({
  positions, onClick, titleField, selectedPosition, stops, showStatus = true, index, replay = false, main = false,
}) => {
  const id = useId();
  window.id = id;
  window.map = map;

  const icons = `icons-${id}`;
  const backgrounds = `backgrounds--${id}`;
  const clusters = `clusters-${id}`;
  const directions = `directions-${id}`;

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

  const devices = useSelector((state) => state.devices.items);
  window.devices = useSelector((state) => state.devices.items);

  const mapCluster = useAttributePreference('mapCluster', true);
  const hours12 = usePreference('twelveHourFormat');
  const directionType = useAttributePreference('mapDirection', 'selected');

  const [recalculate, setRecalculate] = useState(new Date());

  const createFeature = (devices, position, selectedPositionId) => {
    const device = (devices || window.devices || {})[position?.deviceId];

    let showDirection;
    switch (directionType) {
      case 'none':
        showDirection = false;
        break;
      case 'all':
        showDirection = true;
        break;
      default:
        showDirection = selectedPositionId === position?.id;
        break;
    }
    return {
      id: position?.id,
      deviceId: position?.deviceId,
      name: device?.name || 'xdxdxd',
      fixTime: formatTime(position?.fixTime, 'seconds', hours12),
      category: mapIconKey(device?.category),
      // category: getStatusColor(device.status) === 'positive' ? mapIconKey(device.category) : mapIconKey('cross'),
      // category: ((hasPassedTime(new Date(device.lastUpdate), 40) || hasPassedTime(new Date(position.fixTime), 40)) ? mapIconKey('cross') : (hasPassedTime(new Date(position.fixTime), 10) ? mapIconKey('stop') : mapIconKey(device.category))),
      color: showStatus ? (position?.attributes.color || getStatusColor(device?.status)) : 'neutral',
      rotation: position?.course,
      direction: true,
      rotate: device?.category === 'carDirection',
      background: device?.attributes?.background || '#163b61',
    };
  };

  const dataGenerator = (visiblePositions, devices) => (
    {
      type: 'FeatureCollection',
      features: visiblePositions.map((position) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [position.longitude, position.latitude],
        },
        properties: createFeature(devices, position, selectedPosition && selectedPosition.id),
      })),
    }
  );

  const onMouseEnter = () => map.getCanvas().style.cursor = 'pointer';
  const onMouseLeave = () => map.getCanvas().style.cursor = '';

  const onMarkerClick = useCallback((event) => {
    event.preventDefault();
    const feature = event.features[0];
    if (onClick) {
      onClick(feature.properties.id, feature.properties.deviceId, map, event);
    }
  }, [onClick]);

  const onMapClick = useCallback((event) => {
    if (!event.defaultPrevented && onClick) {
      onClick();
    }
  }, [onClick]);

  const onClusterClick = useCallback((event) => {
    event.preventDefault();
    const features = map.queryRenderedFeatures(event.point, {
      layers: [clusters],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource(id).getClusterExpansionZoom(clusterId, (error, zoom) => {
      if (!error && features[0] && features[0].geometry) {
        map.easeTo({
          center: features[0]?.geometry?.coordinates,
          zoom,
        });
      }
    });
  }, [clusters]);

  useEffect(() => {
    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: mapCluster,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      // generateId: true,
    });

    map.addLayer({
      id: backgrounds,
      type: 'symbol',
      source: id,
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': `${(replay) ? 'altBackground' : 'background'}`,
        'icon-size': iconScale,
        'icon-allow-overlap': true,
      },
      paint: {
        'icon-color': ['get', 'background'],
        // 'icon-halo-color': '#fff',
        // 'icon-halo-width': 2,
      },
    });

    map.addLayer({
      id: icons,
      type: 'symbol',
      source: id,
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': `${(replay) ? 'replay-neutral' : '{category}-{color}'}`,
        'icon-size': replay ? 0.08 : iconScale / 2,
        'icon-allow-overlap': true,
        'text-field': `{${titleField || 'name'}}`,
        'text-allow-overlap': true,
        'text-anchor': 'bottom',
        'text-offset': [0, -2 * iconScale],
        'text-font': findFonts(map),
        'text-size': 12,
        'icon-rotate': replay ? ['get', 'rotation'] : ['case', ['==', ['get', 'rotate'], true], ['get', 'rotation'], 0],
        // 'icon-rotate': ['get', 'rotation'],
        'icon-rotation-alignment': 'map',
      },
      paint: {
        'text-halo-color': 'white',
        'text-halo-width': 1,
        // 'icon-color': '#00ff001a',
        // 'icon-halo-color': '#fff',
        // 'icon-halo-width': 2,
      },
    });

    map.addLayer({
      id: directions,
      type: 'symbol',
      source: id,
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

    map.addLayer({
      id: clusters,
      type: 'symbol',
      source: id,
      filter: ['has', 'point_count'],
      layout: {
        'icon-image': 'cluster',
        'icon-size': iconScale,
        'text-field': '{point_count_abbreviated}',
        'text-font': findFonts(map),
        'text-size': 14,
      },
    });

    map.on('mouseenter', icons, onMouseEnter);
    map.on('mouseleave', icons, onMouseLeave);
    map.on('mouseenter', clusters, onMouseEnter);
    map.on('mouseleave', clusters, onMouseLeave);
    map.on('click', icons, onMarkerClick);
    map.on('click', clusters, onClusterClick);
    map.on('click', onMapClick);
    // map.on('movestart', () => throttle(() => Object.keys(window.players ?? {}).forEach((id) => window.players[id].pause(true))));
    // map.on('moveend', () => setTimeout(() => {
    //   throttle(() => Object.keys(window.players ?? {}).forEach((id) => window.players[id].pause(true)));
    // }, 3000));
    // map.on('dragstart', () => Object.keys(window.players ?? {}).forEach((id) => window.players[id].pause(true)));
    // map.on('dragend', () => Object.keys(window.players ?? {}).forEach((id) => window.players[id].pause(false)));

    window.createFeature = createFeature;
    window.dataGenerator = dataGenerator;
    window.isEqual = isEqual;
    window.propPrint = propPrint;

    return () => {
      window.createFeature = null;
      window.devices = null;
      window.isEqual = null;
      window.propPrint = null;
      map.off('mouseenter', id, onMouseEnter);
      map.off('mouseleave', id, onMouseLeave);
      map.off('mouseenter', clusters, onMouseEnter);
      map.off('mouseleave', clusters, onMouseLeave);
      map.off('click', id, onMarkerClick);
      map.off('click', clusters, onClusterClick);
      map.off('click', onMapClick);

      [icons, backgrounds, clusters, directions, id].forEach((layer) => {
        if (map.getLayer(layer)) map.removeLayer(layer);
        if (map.getSource(layer)) map.removeSource(layer);
      });

      Object.keys(window.players ?? {}).forEach((id) => window.players[id].reset('unmount'));
    };
  }, []);

  useEffect(() => {
    if (!positions || positions.length <= 0) return;

    positions?.forEach((position) => {
      if (window.players) {
        if (!window.players?.hasOwnProperty(position.deviceId)) {
          window.players[position.deviceId] = new RealTimeMovement(position.deviceId, id, {});
        }
        window.players[position.deviceId].updateSelectedPosition(position);
      }
    });
    // measureExecutionTime(checkClusters, positions);
    checkClusters(positions);
  }, [mapCluster, clusters, onMarkerClick, onClusterClick, devices, positions, selectedPosition, index, recalculate]);

  return true;
};

export default memo(MapPositions);
