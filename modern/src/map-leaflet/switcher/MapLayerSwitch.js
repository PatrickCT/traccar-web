/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-floating-decimal */
import React from 'react';
import { TileLayer, LayersControl } from 'react-leaflet';
import useMapStyles from '../../map/core/useMapStyles';
import usePersistedState from '../../common/util/usePersistedState';
import { usePreference } from '../../common/util/preferences';
import { useTranslation } from '../../common/components/LocalizationProvider';

const { BaseLayer } = LayersControl;

const MapLayerSwitch = () => {
  const t = useTranslation();
  const layers = useMapStyles();
  const [defaultMapStyle] = usePersistedState('selectedMapStyle', usePreference('map', 'googleRoad'));

  return (
    <LayersControl>
      <BaseLayer checked name={t('mapGoogleRoad')}>
        <TileLayer
          url={`https://mt${'0'}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga`}
          attribution="© Google"
          maxNativeZoom={8}
        />
      </BaseLayer>
      <BaseLayer name={t('mapGoogleSatellite')}>
        <TileLayer
          url={`https://mt${'0'}.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Gaa`}
          attribution="© Google"
          maxNativeZoom={8}
        />
      </BaseLayer>
      <BaseLayer name={t('mapGoogleTraffic')}>
        <TileLayer
          url={`https://mt${'0'}.google.com/vt/lyrs=r,traffic&hl=en&x={x}&y={y}&z={z}&s=Ga`}
          attribution="© Google"
          maxNativeZoom={8}
        />
      </BaseLayer>
      <BaseLayer name="Open Street Maps">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
      </BaseLayer>
    </LayersControl>
  );
};

export default MapLayerSwitch;
