/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import {
  memo,
  useCallback, useEffect,
  useId,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { formatTime, getStatusColor } from '../common/util/formatter';
import { checkClusters } from '../common/util/geospatial';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { findFonts } from './core/mapUtil';
import { map } from './core/MapView';
import { mapIconKey } from './core/preloadImages';

const isEqual = require('react-fast-compare');

const propPrint = (prop) => {
  switch (typeof prop) {
    case 'object': return JSON.stringify(prop);
    case 'undefined': return 'NULL';
    default: return prop;
  }
};

const MapPositions = ({
  positions, onClick, titleField, selectedPosition, showStatus = true, index,
}) => {
  const id = useId();
  window.id = id;
  window.map = map;

  const icons = `icons-${id}`;
  const backgrounds = `backgrounds--${id}`;
  const clusters = `clusters-${id}`;
  const directions = `directions-${id}`;

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

  const devices = useSelector((state) => state.devices.items);
  window.devices = useSelector((state) => state.devices.items);

  const mapCluster = useAttributePreference('mapCluster', false);
  const hours12 = usePreference('twelveHourFormat');
  const directionType = useAttributePreference('mapDirection', 'selected');

  const createFeature = (devices, position) => {
    const device = (devices || window.devices || {})[position?.deviceId];

    return {
      id: position?.id,
      deviceId: position?.deviceId,
      name: device?.name || '',
      fixTime: formatTime(position?.fixTime, 'seconds', hours12),
      category: mapIconKey(device?.category),
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
    });

    map.addLayer({
      id: backgrounds,
      type: 'symbol',
      source: id,
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': 'background',
        'icon-size': iconScale,
        'icon-allow-overlap': true,
      },
      paint: {
        'icon-color': ['get', 'background'],
      },
    });

    map.addLayer({
      id: icons,
      type: 'symbol',
      source: id,
      filter: ['!has', 'point_count'],
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      layout: {
        'icon-image': '{category}-{color}',
        'icon-size': iconScale / 2,
        'icon-allow-overlap': true,
        'text-field': titleField ? `{${titleField}}` : '',
        'text-allow-overlap': true,
        'text-anchor': 'bottom',
        'text-offset': [0, -2 * iconScale],
        'text-font': findFonts(map),
        'text-size': 14,
        'icon-rotate': ['case', ['==', ['get', 'rotate'], true], ['get', 'rotation'], 0],
        'icon-rotation-alignment': 'viewport',
      },
      paint: {
        'text-halo-color': 'white', // The color of the outline (or border) around each character.
        'text-halo-width': 2, // Reduced width for a more character-specific border.
        'text-halo-blur': 0, // Ensures that the halo stays sharp, you can adjust this value for subtle blur.
        'text-color': '#000000', // The actual text color.
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
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
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

    map.getSource(id)?.setData({
      type: 'FeatureCollection',
      features: positions.filter((it) => devices.hasOwnProperty(it.deviceId))
        .map((position) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [position.longitude, position.latitude],
          },
          properties: createFeature(devices, position, selectedPosition && selectedPosition.id),
        })),
    });
    checkClusters(positions);
  }, [mapCluster, clusters, onMarkerClick, onClusterClick, devices, positions, selectedPosition, index]);

  return true;
};

export default memo(MapPositions);
