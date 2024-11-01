/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import {
  useId, useCallback, useEffect, memo, useState,
} from 'react';
// import { Popup } from 'mapbox-gl';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import { map } from './core/MapView';
import { formatTime, getStatusColor } from '../common/util/formatter';
import { mapIconKey } from './core/preloadImages';
import { findFonts } from './core/mapUtil';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { hasPassedTime } from '../common/util/utils';
import { devicesActions } from '../store';

const isEqual = require('react-fast-compare');

const propPrint = (prop) => {
  switch (typeof prop) {
    case 'object': return JSON.stringify(prop);
    case 'undefined': return 'NULL';
    default: return prop;
  }
};

const MapPositions = ({
  positions, onClick, titleField, selectedPosition, stops, showStatus = true, index, replay = false, main = false,
}) => {
  const id = useId();
  const dispatch = useDispatch();
  window.id = id;
  window.map = map;
  const clusters = `${id}-clusters`;
  const direction = `${id}-direction`;

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

  const devices = useSelector((state) => state.devices.items);

  const mapCluster = useAttributePreference('mapCluster', false);
  const hours12 = usePreference('twelveHourFormat');
  const directionType = useAttributePreference('mapDirection', 'selected');

  // const [recalculate, setRecalculate] = useState(new Date());

  const createFeature = (devices, position, selectedPositionId) => {
    const device = (devices || window.devices || {})[position.deviceId];

    let showDirection;
    switch (directionType) {
      case 'none':
        showDirection = false;
        break;
      case 'all':
        showDirection = true;
        break;
      default:
        showDirection = selectedPositionId === position.id;
        break;
    }
    return {
      id: position.id,
      deviceId: position.deviceId,
      name: device?.name || '',
      fixTime: formatTime(position.fixTime, 'seconds', hours12),
      category: mapIconKey(device?.category),
      color: showStatus ? (position.attributes.color || getStatusColor(device?.status)) : 'neutral',
      rotation: position.course,
      direction: true,
      rotate: device?.category === 'carDirection' || true,
    };
  };

  const dataGenerator = (visiblePositions) => (
    {
      type: 'FeatureCollection',
      features: visiblePositions.filter((it) => devices.hasOwnProperty(it?.deviceId)).map((position) => ({
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
    event.preventDefault();

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
      if (!error) {
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
      id,
      type: 'symbol',
      source: id,
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': `${(replay) ? 'replay-neutral' : '{category}-{color}'}`,
        'icon-size': replay ? 0.08 : iconScale,
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

    map.addLayer({
      id: direction,
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

    if (replay && !main) {
      map.addSource('stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [...stops.map((stop, index) => (
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [stop.longitude, stop.latitude],
              },
              properties: {
                index,
              },
            }
          ))],
        },
        cluster: mapCluster,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'stops-layer',
        type: 'symbol',
        source: 'stops',
        filter: ['!has', 'point_count'],
        layout: {
          'icon-image': 'replay-stop',
          'icon-size': iconScale,
          'icon-offset': [0, -30],
          'icon-allow-overlap': false,
          'text-anchor': 'bottom',
          'text-offset': [0, -2 * iconScale],
          'text-font': findFonts(map),
          'text-size': 12,
        },
        paint: {
          'text-halo-color': 'white',
          'text-halo-width': 1,
        },
      });

      if (positions?.length > 0) {
        map.addSource('start', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [positions[0].longitude, positions[0].latitude],
                },
              },
            ],
          },
          cluster: mapCluster,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: 'start-layer',
          type: 'symbol',
          source: 'start',
          filter: ['!has', 'point_count'],
          layout: {
            'icon-image': 'replay-start',
            'icon-size': iconScale,
            'icon-allow-overlap': true,
            'text-allow-overlap': true,
            'text-anchor': 'bottom',
            'text-offset': [0, -2 * iconScale],
            'text-font': findFonts(map),
            'text-size': 12,
          },
          paint: {
            'text-halo-color': 'white',
            'text-halo-width': 1,
          },
        });

        map.addSource('end', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [positions[positions.length - 1].longitude, positions[positions.length - 1].latitude],
                },
              },
            ],
          },
          cluster: mapCluster,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: 'end-layer',
          type: 'symbol',
          source: 'end',
          filter: ['!has', 'point_count'],
          layout: {
            'icon-image': 'replay-end',
            'icon-size': iconScale,
            'icon-allow-overlap': true,
            'text-allow-overlap': true,
            'text-anchor': 'bottom',
            'text-offset': [0, -2 * iconScale],
            'text-font': findFonts(map),
            'text-size': 12,
          },
          paint: {
            'text-halo-color': 'white',
            'text-halo-width': 1,
          },
        });
      }
    }

    map.on('mouseenter', id, onMouseEnter);
    map.on('mouseleave', id, onMouseLeave);
    map.on('mouseenter', clusters, onMouseEnter);
    map.on('mouseleave', clusters, onMouseLeave);
    map.on('click', 'stops', onMarkerClick);
    map.on('click', clusters, onClusterClick);
    map.on('click', onMapClick);
    // map.on('moveend', () => setRecalculate(new Date()));
    // map.on('zoom', () => setRecalculate(new Date()));

    window.createFeature = createFeature;
    window.devices = devices;
    window.dataGenerator = dataGenerator;
    window.isEqual = isEqual;
    window.propPrint = propPrint;
    window.deviceName = null;

    return () => {
      window.createFeature = null;
      window.devices = null;
      window.dataGenerator = null;
      window.isEqual = null;
      window.propPrint = null;
      map.off('mouseenter', id, onMouseEnter);
      map.off('mouseleave', id, onMouseLeave);
      map.off('mouseenter', clusters, onMouseEnter);
      map.off('mouseleave', clusters, onMouseLeave);
      map.off('click', 'stops', onMarkerClick);
      map.off('click', clusters, onClusterClick);
      map.off('click', onMapClick);
      // map.off('moveend', id, () => setRecalculate(new Date()));
      // map.off('zoom', id, () => setRecalculate(new Date()));

      [clusters, direction, 'stops-layer', 'start-layer', 'end-layer', 'stops', 'start', 'end', id, `${direction}2`, 'realTime'].forEach((layer) => {
        if (map.getLayer(layer)) map.removeLayer(layer);
        if (map.getSource(layer)) map.removeSource(layer);
      });
      dispatch(devicesActions.selectId(null));
    };
  }, []);

  useEffect(() => {
    if (!positions || positions.length <= 0) return;
    const visiblePositions = (replay ? [positions[index]] : positions).filter((position) => {
      const coordinates = [position.longitude, position.latitude];
      const bounds = map.getBounds();

      return true;
    });

    // if (replay && map.getSource(id)?.)
    map.getSource(id)?.setData(dataGenerator(visiblePositions));
  }, [mapCluster, clusters, onMarkerClick, onClusterClick, devices, positions, selectedPosition, index]);

  return null;
};

export default memo(MapPositions);
