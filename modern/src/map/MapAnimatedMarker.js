/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import {
    useId, useCallback, useEffect, memo, useState,
} from 'react';
// import { Popup } from 'mapbox-gl';
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
    device,
}) => {
    const id = useId();
    const direction = `${id}-direction`;
    console.log('DynamicMovementPosition', device);
    const theme = useTheme();
    const desktop = useMediaQuery(theme.breakpoints.up('md'));
    const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

    const mapCluster = useAttributePreference('mapCluster', true);
    const hours12 = usePreference('twelveHourFormat');
    const directionType = useAttributePreference('mapDirection', 'selected');

    const [index, setIndex] = useState(0);

    // const [recalculate, setRecalculate] = useState(new Date());

    const createFeature = (devices, position, selectedPositionId) => {
        const device = devices[position.deviceId];
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
            name: device.name,
            fixTime: formatTime(position.fixTime, 'seconds', hours12),
            category: mapIconKey(device.category),
            // category: getStatusColor(device.status) === 'positive' ? mapIconKey(device.category) : mapIconKey('cross'),
            // category: ((hasPassedTime(new Date(device.lastUpdate), 40) || hasPassedTime(new Date(position.fixTime), 40)) ? mapIconKey('cross') : (hasPassedTime(new Date(position.fixTime), 10) ? mapIconKey('stop') : mapIconKey(device.category))),
            color: 'neutral',
            rotation: position.course,
            direction: true,
            rotate: device.category === 'carDirection',
        };
    };

    const onMouseEnter = () => map.getCanvas().style.cursor = 'pointer';
    const onMouseLeave = () => map.getCanvas().style.cursor = '';

    // const onMarkerClick = useCallback((event) => {
    //   event.preventDefault();
    //   const feature = event.features[0];
    //   if (onClick) {
    //     onClick(feature.properties.id, feature.properties.deviceId, map, event);
    //   }
    // }, [onClick]);

    // const onMapClick = useCallback((event) => {
    //   if (!event.defaultPrevented && onClick) {
    //     onClick();
    //   }
    // }, [onClick]);

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
                'icon-image': '{category}-{color}',
                'icon-size': iconScale,
                'icon-allow-overlap': true,
                'text-field': '{"name"}',
                'text-allow-overlap': true,
                'text-anchor': 'bottom',
                'text-offset': [0, -2 * iconScale],
                'text-font': findFonts(map),
                'text-size': 12,
                'icon-rotate': ['case', ['==', ['get', 'rotate'], true], ['get', 'rotation'], 0],
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

        map.on('mouseenter', id, onMouseEnter);
        map.on('mouseleave', id, onMouseLeave);
        // map.on('click', id, onMarkerClick);
        // map.on('click', onMapClick);
        // map.on('moveend', () => setRecalculate(new Date()));
        // map.on('zoom', () => setRecalculate(new Date()));

        return () => {
            map.off('mouseenter', id, onMouseEnter);
            map.off('mouseleave', id, onMouseLeave);
            // map.off('click', id, onMarkerClick);
            // map.off('click', onMapClick);
            // map.off('moveend', id, () => setRecalculate(new Date()));
            // map.off('zoom', id, () => setRecalculate(new Date()));

            if (map.getLayer(id)) {
                map.removeLayer(id);
            }

            if (map.getLayer(direction)) {
                map.removeLayer(direction);
            }
            if (map.getLayer('stops-layer')) {
                map.removeLayer('stops-layer');
            }
            if (map.getLayer('start-layer')) {
                map.removeLayer('start-layer');
            }
            if (map.getLayer('end-layer')) {
                map.removeLayer('end-layer');
            }

            if (map.getSource(id)) {
                map.removeSource(id);
            }
            if (map.getSource('stops')) {
                map.removeSource('stops');
            }
            if (map.getSource('start')) {
                map.removeSource('start');
            }
            if (map.getSource('end')) {
                map.removeSource('end');
            }

            // window.marker = null;
        };
    }, []);

    useEffect(() => {
        if (!positions || positions.length <= 0) return;
        const visiblePositions = (positions).filter((position) => {
            const coordinates = [position.longitude, position.latitude];
            const bounds = map.getBounds();

            return (
                coordinates[0] >= bounds._sw.lng &&
                coordinates[0] <= bounds._ne.lng &&
                coordinates[1] >= bounds._sw.lat &&
                coordinates[1] <= bounds._ne.lat
            );
        });
        // if (replay && map.getSource(id)?.)
        map.getSource(id)?.setData({
            type: 'FeatureCollection',
            features: visiblePositions.filter((it) => devices.hasOwnProperty(it.deviceId)).map((position) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [position.longitude, position.latitude],
                },
                properties: createFeature(devices, position, selectedPosition && selectedPosition.id),
            })),
        });
    }, [mapCluster, clusters, onMarkerClick, onClusterClick, devices, positions]);

    return null;
};


export default memo(DynamicMovementPosition);
