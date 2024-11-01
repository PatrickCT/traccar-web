/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-floating-decimal */

import React, {
  useCallback, useEffect,
} from 'react';
import * as turf from '@turf/turf';
import { Marker, Popup } from 'maplibre-gl';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch } from 'react-redux';
import MapView, { map } from '../map/core/MapView';
import PoiMap from '../map/main/PoiMap';
import MapPadding from '../map/MapPadding';
import { devicesActions } from '../store';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapPositions from '../map/MapPositions';
import MapOverlay from '../map/overlay/MapOverlay';
import { createPopUp } from '../common/util/mapPopup';

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

  // replay replica
  const onMarkerClick = useCallback((_, deviceId) => {
    Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
    dispatch(devicesActions.selectId(deviceId));
    if (!_) dispatch(devicesActions.selectPosition(null));
  }, [dispatch]);

  useEffect(() => {
    if (window.rtmPopUp) {
      window.rtmPopUp(selectedPosition);
    }
    // dispatch(devicesActions.selectPosition(selectedPosition));
    window.position = selectedPosition;
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
      if (!position) return;

      Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
      const p = new Popup()
        .setMaxWidth('400px')
        .setOffset(30)
        .setHTML(createPopUp(position, false, true, ['streetView', 'maps']))
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
      {/* <NotificationsBanner /> */}
      <MapView>
        <MapOverlay />
        <MapPositions
          positions={filteredPositions}
          onClick={onMarkerClick}
          selectedPosition={selectedPosition}
          titleField="name"
          showStatus
        />
        <MapDefaultCamera />
        <PoiMap />
      </MapView>

      {desktop && (
        <MapPadding left={parseInt(theme.dimensions.drawerWidthDesktop, 10)} />
      )}
    </>
  );
};

export default MainMap;
