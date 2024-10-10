import { useTheme } from '@mui/styles';
import { useId, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import { map } from './core/MapView';
import { findFonts } from './core/mapUtil';
import { attConverter } from '../common/util/utils';

const MapRoutePath = ({ name, positions, coordinates, values }) => {
  const id = useId();

  const theme = useTheme();

  const reportColor = useSelector((state) => {
    const position = positions?.find(() => true);
    if (position) {
      const attributes = state.devices.items[position.deviceId]?.attributes;
      if (attributes) {
        const color = attributes['web.reportColor'];
        if (color) {
          return color;
        }
      }
    }
    return '#036104';
    // return `#${(`${Math.random().toString(16)}000000`).slice(2, 8)}`;
  });

  useEffect(() => {
    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      },
    });
    map.addLayer({
      source: id,
      id: `${id}-line`,
      type: 'line',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 8,
      },
    });
    if (name) {
      map.addLayer({
        source: id,
        id: `${id}-title`,
        type: 'symbol',
        layout: {
          'text-field': '{name}',
          'text-font': findFonts(map),
          'text-size': 12,
        },
        paint: {
          'text-halo-color': 'white',
          'text-halo-width': 10,
        },
      });
    }

    return () => {
      if (map.getLayer(`${id}-title`)) {
        map.removeLayer(`${id}-title`);
      }
      if (map.getLayer(`${id}-line`)) {
        map.removeLayer(`${id}-line`);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, []);

  useEffect(() => {
    const coordinatesColors = [];
    const colors = [];

    if (!coordinates) {
      let currentType = 0;
      let section = [];
      positions.forEach((position, index) => {
        let speed = 0;
        try {
          speed = parseFloat((attConverter(position, 'speed') ?? (attConverter(positions[(index - 1) > 0 ? index - 1 : 0], 'speed') ?? '0 -'))?.split(' ')[0]) || 0;
        } catch (error) { /* empty */ }
        if (currentType === 0 || currentType !== (speed < values[0] ? 1 : (speed < values[1] ? 2 : 3))) { // primer seccion o nueva seccion
          if (section.length > 0) {
            coordinatesColors.push(section);
          }
          section = [];
          currentType = (speed < values[0] ? 1 : (speed < values[1] ? 2 : 3));
          colors.push((currentType === 1 ? reportColor : (currentType === 2 ? 'orange' : 'red')));
          // colors.push(`#${(`${Math.random().toString(16)}000000`).slice(2, 8)}`);
          section.push([position.longitude, position.latitude]);
        } else { // misma seccion
          section.push([position.longitude, position.latitude]);
        }
      });
    }

    if (!coordinates) {
      coordinates = positions.map((item) => [item.longitude, item.latitude]);
    }

    const features = [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
      properties: {
        name,
        color: reportColor,
      },
    }, ...coordinatesColors.map((coords, index) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
      properties: {
        name,
        color: colors[index], // Assign color from the colors array
      },
    }))];

    map.getSource(id)?.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [theme, positions, coordinates, reportColor, values]);

  return null;
};

export default memo(MapRoutePath);
