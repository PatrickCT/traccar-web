import { useEffect, useMemo } from 'react';
import { map } from '../core/MapView';
import './notification.css';

const statusClass = (status) => `maplibregl-ctrl-icon maplibre-ctrl-notification maplibre-ctrl-notification-${status}`;

class NotificationControl {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
    this.notificationCount = 0;
  }

  onAdd() {
    this.button = document.createElement('button');
    this.button.className = statusClass('off');
    this.button.type = 'button';
    this.button.onclick = () => this.eventHandler(this);

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group maplibregl-ctrl';
    this.container.appendChild(this.button);

    // Badge element
    this.badge = document.createElement('span');
    this.badge.className = 'notification-badge';
    this.badge.textContent = '';
    this.container.appendChild(this.badge);

    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
  }

  setEnabled(enabled) {
    this.button.className = statusClass(enabled ? 'on' : 'off');
  }

  setNotificationCount(count) {
    this.notificationCount = count;
    this.badge.textContent = count > 0 ? String(count) : '';
    this.badge.style.display = count > 0 ? 'inline-block' : 'none';

    // Trigger "ring" animation
    if (count > 0) {
      this.button.classList.remove('bell-ring');
      void this.button.offsetWidth; // Force reflow to restart animation
      this.button.classList.add('bell-ring');
    }
  }
}

const MapNotification = ({ enabled, count, onClick }) => {
  const control = useMemo(() => new NotificationControl(onClick), [onClick]);

  useEffect(() => {
    map.addControl(control);
    return () => map.removeControl(control);
  }, [onClick]);

  useEffect(() => {
    control.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    control.setNotificationCount(count); // assuming you pass this prop
  }, [count]);

  return null;
};

MapNotification.displayName = 'MapNotification';

export default MapNotification;
