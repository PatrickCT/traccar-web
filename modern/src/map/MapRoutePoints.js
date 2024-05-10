/* eslint-disable import/no-extraneous-dependencies */
import {
  useId, useCallback, useEffect, memo,
} from 'react';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { Expression } from 'mapbox-expression';

import { useAttributePreference } from '../common/util/preferences';
import { map } from './core/MapView';

const MapRoutePoints = ({
  positions, onClick, replay = false,
}) => {
  const id = useId();
  const clusters = `${id}-clusters`;

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

  const onMouseEnter = () => map.getCanvas().style.cursor = 'pointer';
  const onMouseLeave = () => map.getCanvas().style.cursor = '';

  const mapCluster = true;

  const onMarkerClick = useCallback((event) => {
    event.preventDefault();
    const feature = event.features[0];
    if (onClick) {
      if (!feature.properties.hasOwnProperty('cluster')) {
        onClick(feature.properties.id, feature.properties.index, map);
      } else {
        const clusterId = feature.properties.cluster_id;
        map.getSource(id).getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (!error) {
            map.easeTo({
              center: feature?.geometry.coordinates,
              zoom,
            });
          }
        });
      }
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
          center: features[0]?.geometry.coordinates,
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
      clusterProperties: {
        course: ['max', ['get', 'course']],
      },
    });

    // map.addLayer({
    //   id,
    //   type: 'circle',
    //   source: id,
    //   paint: {
    //     'circle-radius': 5,
    //     'circle-color': theme.palette.colors.geometry,
    //   },
    // });

    // map.addLayer({
    //   id: clusters,
    //   type: 'symbol',
    //   source: id,
    //   filter: ['has', 'point_count'],
    //   layout: {
    //     'icon-image': 'cluster',
    //     'icon-size': iconScale,
    //     'icon-rotate': ['get', 'course'],
    //     'icon-rotation-alignment': 'map',
    //     'symbol-placement': 'point',
    //     'icon-allow-overlap': true,
    //   },
    // });

    map.addLayer({
      id,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': replay ? 'arrowW' : 'arrow',
        'icon-size': replay ? iconScale : 0.4,
        'icon-allow-overlap': true,
        'icon-rotate': ['get', 'course'],
        'icon-rotation-alignment': 'map',
        'symbol-placement': 'point',
      },
      paint: replay ? {
        'icon-opacity': 1,
        'icon-color': '#FFFFFF',
      } : {
        'icon-opacity': 1,
      },
    });

    map.on('mouseenter', id, onMouseEnter);
    map.on('mouseleave', id, onMouseLeave);
    map.on('click', id, onMarkerClick);
    map.off('click', clusters, onClusterClick);

    return () => {
      map.off('mouseenter', id, onMouseEnter);
      map.off('mouseleave', id, onMouseLeave);
      map.off('click', id, onMarkerClick);
      map.off('click', clusters, onClusterClick);

      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getLayer(clusters)) {
        map.removeLayer(clusters);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [onMarkerClick]);

  useEffect(() => {
    const features = positions.map((position, index) => {
      if (position.hasOwnProperty('original')) {
        if (position.original === true) {
          return ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [position.longitude, position.latitude],
            },
            properties: {
              index,
              id: position.id,
              course: position.course,
            },
          });
        }
        return false;
      }
      return ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [position.longitude, position.latitude],
        },
        properties: {
          index,
          id: position.id,
          course: position.course,
        },
      });
    });
    map.getSource(id)?.setData({
      type: 'FeatureCollection',
      features,
    });

    window.feature = features;
    window.Expression = Expression;
  }, [onMarkerClick, positions]);

  return null;
};

export default memo(MapRoutePoints);
