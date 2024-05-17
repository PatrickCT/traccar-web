import { useEffect, useMemo } from 'react';
import { map } from '../core/MapView';
import './promotions.css';

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
      window.jsPanel.modal.create({
        theme: 'primary',
        content: `
            <iframe title="Promociones" src="./promotions.html" frameBorder="0" width="100%" height="99%" />
            `, // Set the font size to 20px
        position: 'center', // 80% width, 30% height, centered
        draggable: { containment: 'viewport' }, // Make it draggable within the viewport
        contentSize: { width: '80%', height: '90%' }, // Responsive sizing
        borderRadius: 25, // Remove rounded corners for a more square appearance
        closeOnEscape: false, // Disable closing on ESC key
        closeOnOutsideClick: false, // Disable closing on outside click
        header: false, // Remove the header
        footer: false, // Remove the footer
        controls: { maximize: 'remove', minimize: 'remove', close: 'remove' }, // Remove all controls
        closeOnBackdrop: true,
        backdrop: true,
      });
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
