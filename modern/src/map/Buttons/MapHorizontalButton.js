import { useEffect, useMemo } from 'react';
import { map } from '../core/MapView';
import './style.css';
import { isMobile } from '../../common/util/utils';

const statusClass = (status) => `maplibregl-ctrl-icon maplibre-ctrl-promotions maplibre-ctrl-promotions-${status}`;

class PromotionsControl {
  constructor(title, eventHandler) {
    this.eventHandler = eventHandler;
    this.title = title;
  }

  onAdd() {
    this.button = document.createElement('button');
    this.button.className = statusClass('off');
    this.button.type = 'button';
    this.button.style.width = '100%';
    this.button.innerText = this.title;
    this.button.onclick = () => {
      // document.getElementById('jspanel-style').removeAttribute('disabled');
      // document.getElementById('jsmodal-style').removeAttribute('disabled');
      this.eventHandler();
    };
    const mobile = isMobile();
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group';
    this.container.style.position = 'absolute';
    this.container.style.width = '250px';
    this.container.style.right = mobile ? '45px' : '300px';
    this.container.style.top = mobile ? '50px' : '10px';
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

const MapHorizontalButton = ({ title, enabled, onClick }) => {
  const control = useMemo(() => new PromotionsControl(title, onClick), [onClick]);

  useEffect(() => {
    map.addControl(control);
    return () => map.removeControl(control);
  }, [onClick]);

  useEffect(() => {
    control.setEnabled(enabled);
  }, [enabled]);

  return null;
};

export default MapHorizontalButton;
