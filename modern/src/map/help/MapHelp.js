import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from '../core/MapView';
import './help.css';

const statusClass = (status) => `maplibregl-ctrl-icon maplibre-ctrl-help maplibre-ctrl-help-${status}`;

class HelpControl {
  constructor(eventHandler, navigate) {
    this.eventHandler = eventHandler;
    this.navigate = navigate;
  }

  onAdd() {
    this.button = document.createElement('button');
    this.button.className = statusClass('off');
    this.button.type = 'button';
    this.button.style.width = '100%';
    this.button.innerText = 'Ayuda';
    this.button.onclick = () => {
      // document.getElementById('jspanel-style').removeAttribute('disabled');
      // document.getElementById('jsmodal-style').removeAttribute('disabled');
      this.navigate('help');
    };

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group';
    this.container.style.position = 'absolute';
    this.container.style.width = '250px';
    this.container.style.right = '45px';
    this.container.style.top = '45px';
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

const MapHelp = ({ enabled, onClick }) => {
  const navigate = useNavigate();
  const control = useMemo(() => new HelpControl(onClick, navigate), [onClick]);

  useEffect(() => {
    map.addControl(control);
    return () => map.removeControl(control);
  }, [onClick]);

  useEffect(() => {
    control.setEnabled(enabled);
  }, [enabled]);

  return null;
};

export default MapHelp;
