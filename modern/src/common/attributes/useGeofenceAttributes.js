import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  color: {
    name: t('attributeColor'),
    type: 'color',
  },
  speedLimit: {
    name: t('attributeSpeedLimit'),
    type: 'number',
    subtype: 'speed',
  },
  polylineDistance: {
    name: t('attributePolylineDistance'),
    type: 'number',
    subtype: 'distance',
  },
  groupChange: {
    name: t('attributeGroupChangeFlag'),
    type: 'geofence',
  },
  colorChange: {
    name: t('attributeColorChangeFlag'),
    type: 'color',
  },
  allowedTime: {
    name: t('attributeAllowedTime'),
    type: 'number',
  },
  prohibitedGeofence: {
    name: t('attributeShutdownGeofence'),
    type: 'boolean',
  },
}), [t]);
