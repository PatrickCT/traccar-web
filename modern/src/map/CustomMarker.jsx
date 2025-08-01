import React, { useEffect } from 'react';
import './CustomMarker.css';

const CustomMarker = ({ map, coordinates, backgroundId, icon, arrowRotation }) => {
    useEffect(() => {
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';

        // Get the base64 image from the map's background
        const backgroundBase64 = getImageAsBase64(map, backgroundId);

        if (backgroundBase64) {
            markerEl.innerHTML = `
        <div class="marker-background" style="background-image: url(${backgroundBase64});">
          <img src="${icon}" class="marker-icon"/>
          <img src="${arrow}" class="marker-arrow" style="transform: rotate(${arrowRotation}deg);"/>
        </div>
      `;

            // Add the custom marker to the map
            new maplibregl.Marker(markerEl)
                .setLngLat(coordinates)
                .addTo(map);
        }

        return () => markerEl.remove();
    }, [map, coordinates, backgroundId, icon, arrowRotation]);

    return null;
};
