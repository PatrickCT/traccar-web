/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-floating-decimal */

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as turf from '@turf/turf';
import { Marker, Popup } from 'maplibre-gl';
import React, {
  memo, useCallback, useEffect, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPopUp } from '../common/util/mapPopup';
import useFeatures from '../common/util/useFeatures';
import MapView, { map } from '../map/core/MapView';
import MapGeocoder from '../map/geocoder/MapGeocoder';
import MapAccuracy from '../map/main/MapAccuracy';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import PoiMap from '../map/main/PoiMap';
import MapCurrentLocation from '../map/MapCurrentLocation';
import MapGeofence from '../map/MapGeofence';
import MapPadding from '../map/MapPadding';
import MapPositions from '../map/MapPositions';
import MapScale from '../map/MapScale';
import MapNotification from '../map/notification/MapNotification';
import MapOverlay from '../map/overlay/MapOverlay';
import { devicesActions } from '../store';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const eventsAvailable = useSelector((state) => !!state.events.items.length);
  const features = useFeatures();

  // replay replica
  const onMarkerClick = useCallback((_, deviceId) => {
    dispatch(devicesActions.selectId(deviceId));
  }, [dispatch]);

  useEffect(() => {
    dispatch(devicesActions.selectPosition(selectedPosition));
    if (window.rtmPopUp) {
      window.rtmPopUp(selectedPosition);
    }
  }, [selectedPosition]);

  useEffect(() => {
    window.turf = turf;
    window.map = map;
    window.Marker = Marker;
    window.markers = [];

    if (window.players === undefined || window.players === null) {
      window.players = {};
    }

    window.sleep = sleep;
    window.createPopUp = createPopUp;

    window.rtmPopUp = (position) => {
      if (position === undefined || position === null || window.position === null || window.localStorage.getItem('showMapPopup') === 'false') {
        return;
      }
      Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
      const p = new Popup()
        .setMaxWidth('400px')
        .setOffset(30)
        .setHTML(createPopUp(position))
        .setLngLat([position?.longitude, position?.latitude])
        .addTo(map);
      p.getElement().id = position.deviceId;
      window.marker = p;
      window.marker._content.style = '--custom_color: #06376A';
      window.marker._content.classList.add('mapboxgl-popup-content-custom');
    };

    dispatch(devicesActions.selectPosition(null));
    dispatch(devicesActions.selectId(0));

    return () => {
      window.players = null;
    };
  }, []);

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes />
        <MapPositions
          positions={filteredPositions}
          onClick={onMarkerClick}
          selectedPosition={selectedPosition}
          titleField="name"
          showStatus
        />
        <MapDefaultCamera />
        <MapSelectedDevice />
        <PoiMap />
      </MapView>
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {!features.disableEvents && (
        <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
      )}
      {desktop && (
        <MapPadding left={parseInt(theme.dimensions.drawerWidthDesktop, 10)} />
      )}
    </>
  );
};

export default memo(MainMap);
