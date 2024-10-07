/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-floating-decimal */
import React, { useEffect, useRef, useState } from 'react';
import Leaflet from 'leaflet';
import { MapContainer, ZoomControl } from 'react-leaflet';
import html2canvas from 'html2canvas';
import MapLayerSwitch from '../switcher/MapLayerSwitch';

const newicon = new Leaflet.Icon({
  iconUrl: 'https://t-urban.com.mx/static/media/default.76fc53545ca53bf1d96addbf8dcc6cc7.svg',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [25, 55],
});

const MapView = () => {
  const [map, setMap] = useState(null);
  const mediaRecorderRef = useRef(null); // Keep a reference to the MediaRecorder
  const isRecordingRef = useRef(false); // Track whether recording is happening

  const recordMapWithMediaRecorder = async () => {
    try {
      const mapContainer = map; // Access the MapContainer element

      if (!mapContainer) {
        console.log('no map');
        return;
      }

      // Use html2canvas to capture the map as a canvas
      const canvas = await html2canvas(mapContainer);

      // Now we capture the canvas stream
      const stream = canvas.captureStream(30);  // 30 FPS recording

      // Create a MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];  // Array to store the video data

      // When data is available, push it to the chunks array
      mediaRecorder.ondataavailable = function (event) {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // When recording stops, create a Blob and trigger the download
      mediaRecorder.onstop = function () {
        if (!map) return;  // Check if the component is still mounted
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Create a link to download the video
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'leaflet-map-video.webm';  // Filename for the video

        document.body.appendChild(a);  // Append link to the DOM
        a.click();  // Programmatically click the link to start the download
        document.body.removeChild(a);  // Remove link after download
      };

      // Start recording
      mediaRecorder.start();
      isRecordingRef.current = true;

      // Stop the recording after 10 seconds (adjustable duration)
      setTimeout(() => {
        if (isRecordingRef.current) {
          mediaRecorder.stop();  // Stop recording and trigger the download
          isRecordingRef.current = false;
        }
      }, 10000);   // Capture for 10 seconds
    } catch (error) {
      console.error(error);

    }
  };

  useEffect(() => {
    window.lmap = map;
  }, []);

  return (
    <MapContainer
      ref={setMap}
      style={{ height: 1000, maxHeight: '100vh', zIndex: 0 }}
      center={[51.505, -0.09]}
      zoom={13}
      zoomControl={false}
      rotate={true}
      touchRotate={true}
      rotateControl={{
        closeOnZeroBearing: false
      }}
      scrollWheelZoom
    >
      <ZoomControl position="topright" />
      <MapLayerSwitch />
    </MapContainer>
  )
};

export default MapView
