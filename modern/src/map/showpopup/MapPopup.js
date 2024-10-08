import {
  memo, useEffect, useMemo, useState,
} from 'react';
import { map } from '../core/MapView';
import './showpopup.css';

const statusClass = (status) => `maplibregl-ctrl-icon maplibre-ctrl-showpopup maplibre-ctrl-showpopup-${status}`;

class PopUpControl {
  constructor(enabled, eventHandler) {
    this.enabled = enabled;
    this.eventHandler = eventHandler;
  }

  onAdd() {
    this.button = document.createElement('button');
    this.button.className = statusClass(this.enabled ? 'on' : 'off');
    this.button.type = 'button';
    this.button.onclick = () => this.eventHandler(this);

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group maplibregl-ctrl';
    this.container.appendChild(this.button);

    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
  }

  setEnabled(enabled) {
    this.button.className = statusClass(enabled ? 'on' : 'off');
  }
}

const MapPopup = memo(() => {
  const [enabled, setEnabled] = useState((window.localStorage.getItem('showMapPopup') === 'true'));

  const onClick = () => {
    const newEnabled = !enabled;
    window.localStorage.setItem('showMapPopup', newEnabled);
    setEnabled(newEnabled);
  };

  const control = useMemo(() => new PopUpControl(enabled, onClick), [enabled]);

  useEffect(() => {
    map.addControl(control);
    return () => map.removeControl(control);
  }, [control]);

  return null;
});

export default MapPopup;
