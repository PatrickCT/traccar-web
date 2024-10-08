import { useEffect, useMemo } from 'react';
import { map } from '../core/MapView';
import './promotions.css';
import { openModalPromociones } from '../../common/util/utils';

const statusClass = (status) => `maplibregl-ctrl-icon maplibre-ctrl-promotions maplibre-ctrl-promotions-${status}`;

class PromotionsControl {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
  }

  onAdd() {
    this.button = document.createElement('button');
    this.button.className = statusClass('off');
    this.button.type = 'button';
    this.button.style.width = '100%';
    this.button.innerText = 'Promociones';
    this.button.onclick = () => {
      // document.getElementById('jspanel-style').removeAttribute('disabled');
      // document.getElementById('jsmodal-style').removeAttribute('disabled');
      openModalPromociones();
    };

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group';
    this.container.style.position = 'absolute';
    this.container.style.width = '250px';
    this.container.style.right = '45px';
    this.container.style.top = '10px';
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

const MapPromotions = ({ enabled, onClick }) => {
  const control = useMemo(() => new PromotionsControl(onClick), [onClick]);

  useEffect(() => {
    map.addControl(control);
    return () => map.removeControl(control);
  }, [onClick]);

  useEffect(() => {
    control.setEnabled(enabled);
  }, [enabled]);

  return null;
};

export default MapPromotions;
