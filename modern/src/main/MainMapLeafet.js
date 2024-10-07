/* eslint-disable no-unused-vars */
import React from 'react';
import MapView from '../map-leaflet/core/MapView';
import 'leaflet/dist/leaflet.css';
import MapPopup from '../map/showpopup/MapPopup';

const MainMapLeafet = () => {
  const [positions] = [];

  return (
    <>
      <MapView />
      <MapPopup />
    </>
  );
};

export default MainMapLeafet;
