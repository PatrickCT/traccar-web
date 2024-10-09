/* eslint-disable no-empty */
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import React, {
  useRef, useLayoutEffect, useEffect, useState,
} from 'react';
import { SwitcherControl } from '../switcher/switcher';
import { useAttributePreference, usePreference } from '../../common/util/preferences';
import usePersistedState, { savePersistedState } from '../../common/util/usePersistedState';
import { mapImages } from './preloadImages';
import useMapStyles from './useMapStyles';

const element = document.createElement('div');
element.style.width = '100%';
element.style.height = '100%';
element.style.boxSizing = 'initial';

export const map = new maplibregl.Map({
  container: element,
  attributionControl: false,
  version: 8,
  name: 'Empty',
  metadata: {
    'mapbox:autocomposite': true,
  },
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
});

let ready = false;
const readyListeners = new Set();

const addReadyListener = (listener) => {
  readyListeners.add(listener);
  listener(ready);
};

const removeReadyListener = (listener) => {
  readyListeners.delete(listener);
};

const updateReadyValue = (value) => {
  ready = value;
  readyListeners.forEach((listener) => listener(value));
};

const initMap = async () => {
  if (ready) return;
  try {
    if (!map.hasImage('background')) {
      Object.entries(mapImages).forEach(([key, value]) => {
        map.addImage(key, value, {
          pixelRatio: window.devicePixelRatio,
          ...(key === 'background' ? ({ sdf: true }) : ({})),
        });
      });
    }
    map.loadImage('../images/arrow.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('arrow', image);
    });
    map.loadImage('../images/arrowW.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('arrowW', image);
    });
    map.loadImage('../images/arrowB.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('arrowB', image);
    });
    map.loadImage('../images/replay-neutral.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('replay-neutral', image);
    });
    map.loadImage('../images/replay-positive.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('replay-positive', image);
    });
    map.loadImage('../images/replay-negative.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('replay-negative', image);
    });
    // markadores playback fijos
    map.loadImage('../images/p_start_en.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('replay-start', image);
    });
    map.loadImage('../images/p_end_en.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('replay-end', image);
    });
    map.loadImage('../images/stopicon.png', (err, image) => {
      if (err) {
        throw err;
      }
      map.addImage('replay-stop', image);
    });
    updateReadyValue(true);
  } catch (error) {
  }
};

map.addControl(new maplibregl.NavigationControl());

const switcher = new SwitcherControl(
  () => updateReadyValue(false),
  (styleId) => {
    savePersistedState('selectedMapStyle', styleId);
  },
  () => {
    map.once('styledata', () => {
      const waiting = () => {
        if (!map.loaded()) {
          setTimeout(waiting, 33);
        } else {
          initMap();
        }
      };
      waiting();
    });
  },
);

map.addControl(switcher);

const MapView = ({ children }) => {
  const containerEl = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttributePreference('activeMapStyles', 'locationIqStreets,osm,carto,googleRoad,googleSatellite,googleTraffic');
  const [defaultMapStyle] = usePersistedState('selectedMapStyle', usePreference('map', 'googleRoad'));
  const mapboxAccessToken = useAttributePreference('mapboxAccessToken');
  const maxZoom = useAttributePreference('web.maxZoom');

  useEffect(() => {
    if (maxZoom) {
      map.setMaxZoom(maxZoom < 23 ? maxZoom : 22);
    }
  }, [maxZoom]);

  useEffect(() => {
    maplibregl.accessToken = mapboxAccessToken;
  }, [mapboxAccessToken]);

  useEffect(() => {
    const filteredStyles = mapStyles.filter((s) => s.available && activeMapStyles.includes(s.id));
    const styles = filteredStyles.length ? filteredStyles : mapStyles.filter((s) => s.id === 'osm');
    switcher.updateStyles(styles, defaultMapStyle);
  }, [defaultMapStyle]);

  useEffect(() => {
    const listener = (ready) => setMapReady(ready);
    addReadyListener(listener);
    return () => {
      removeReadyListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    const currentEl = containerEl.current;
    currentEl.appendChild(element);
    map.resize();
    return () => {
      currentEl.removeChild(element);
    };
  }, [containerEl]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerEl}>
      {mapReady && children}
    </div>
  );
};

export default MapView;
