/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-floating-decimal */

import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';
import * as turf from '@turf/turf';
import { Marker } from 'mapbox-gl';
import { Popup } from 'maplibre-gl';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './components/BasicModal';
import MapView, { map } from '../map/core/MapView';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import MapAccuracy from '../map/main/MapAccuracy';
import MapGeofence from '../map/MapGeofence';
import MapCurrentLocation from '../map/MapCurrentLocation';
import PoiMap from '../map/main/PoiMap';
import MapPadding from '../map/MapPadding';
import { devicesActions } from '../store';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapPositions from '../map/MapPositions';
import MapOverlay from '../map/overlay/MapOverlay';
import MapGeocoder from '../map/geocoder/MapGeocoder';
import MapScale from '../map/MapScale';
import MapNotification from '../map/notification/MapNotification';
import useFeatures from '../common/util/useFeatures';
import { createPopUp } from '../common/util/mapPopup';
import MapPopup from '../map/showpopup/MapPopup';
import MapShare from '../map/share/MapShare';
import LinksPage from '../settings/LinksPage';
import MapCoverage from '../map/coverage/MapCoverage';
import { showCoberturaMap } from '../common/util/utils';
import { useAdministrator } from '../common/util/permissions';
import MapPromotions from '../map/promotions/MapPromotions';

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
  const admin = useAdministrator();
  const [showModalShareLocation, setShowModalShareLocation] = useState(false);

  // replay replica
  const onMarkerClick = useCallback((_, deviceId) => {
    dispatch(devicesActions.selectId(deviceId));
  }, [dispatch]);

  useEffect(() => {
    dispatch(devicesActions.selectPosition(selectedPosition));
  }, [selectedPosition]);

  useEffect(() => {
    window.turf = turf;
    window.map = map;
    window.Marker = Marker;

    if (window.players === undefined || window.players === null) {
      window.players = {};
    }

    window.sleep = sleep;
    window.createPopUp = createPopUp;
    window.rtmPopUp = (position) => {
      if (position === undefined || position === null || window.position === null || window.localStorage.getItem('showMapPopup') === 'false') {
        return;
      }
      Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
      const p = new Popup()
        .setMaxWidth('400px')
        .setOffset(40)
        .setHTML(createPopUp(position))
        .setLngLat([position?.longitude, position?.latitude])
        .addTo(map);
      p.getElement().id = position.deviceId;
      window.marker = p;
      window.marker._content.classList.add(`mapboxgl-popup-content-${'#06376A'}`);
    };

    return () => {
      window.players = null;
    };
  }, []);

  return (
    <>
      {/* <NotificationsBanner /> */}
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
      <MapPopup />
      <MapShare onClick={() => setShowModalShareLocation(true)} />
      {admin && (
        <MapCoverage onClick={() => showCoberturaMap()} />
      )}
      <MapPromotions />
      <Modal
        isOpen={showModalShareLocation}
        onClose={() => setShowModalShareLocation(false)} // Close modal when the overlay is clicked or Esc is pressed
        contentLabel="Links"
      >
        <LinksPage />
      </Modal>
    </>
  );
};

export default memo(MainMap);
