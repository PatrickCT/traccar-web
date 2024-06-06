/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-use-before-define */
/* eslint-disable radix */
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import './BroadcastAlert.css'; // Ensure to create this CSS file

const BroadcastAlert = ({ notifications }) => {
  const [visible, setVisible] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState(notifications);
  const lapsCompleted = useRef({});
  const timers = useRef({});

  useEffect(() => {
    setActiveNotifications(notifications.map((notification, index) => ({ id: index + 1, ...notification })));
    setVisible(notifications.length > 0);
  }, [notifications]);

  useEffect(() => {
    activeNotifications.forEach((notification) => {
      if (!notification.permanent) {
        if (notification.type.endsWith('l')) {
          if (!lapsCompleted.current[notification.id]) {
            lapsCompleted.current[notification.id] = parseInt(notification.type.toString().replace('l', ''));
          }
        } else if (notification.type.endsWith('t')) {
          const seconds = parseInt(notification.type.toString().replace('t', ''));
          if (!timers.current[notification.id]) {
            timers.current[notification.id] = setTimeout(() => {
              removeNotification(notification.id);
            }, seconds * 1000);
          }
        }
      }
    });

    return () => {
      Object.values(timers.current).forEach((timer) => clearTimeout(timer));
    };
  }, [activeNotifications]);

  useEffect(() => {
    setVisible(activeNotifications.length > 0);
  }, [activeNotifications, lapsCompleted, timers]);

  useEffect(() => {
    window.updateBroadcastNotifications = (notification) => {
      if (typeof notification === 'string') {
        notification = { text: notification, permanent: false, type: '1l' };
      }
      setActiveNotifications((prev) => [
        ...prev,
        { ...notification, id: prev.length + 1 },
      ]);
    };

    return () => {
      delete window.updateBroadcastNotifications;
    };
  }, []);

  const removeNotification = (id) => {
    setActiveNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleAnimationIteration = (id) => {
    if (lapsCompleted.current[id] !== undefined) {
      lapsCompleted.current[id] -= 1;
      if (lapsCompleted.current[id] <= 0) {
        removeNotification(id);
      }
    }
  };

  const handleManualClose = () => {
    if (window.confirm('Realmente desea ocultar las notificaciones?')) {
      setActiveNotifications([]);
      setVisible(false);
    }
  };

  return (
    <div style={{ display: `${visible ? 'block' : 'none'}` }} className="broadcast-alert" onClick={handleManualClose}>
      <div className="sliding-text-wrapper">
        <div className="sliding-text">
          {activeNotifications.map((notification, index) => (
            <span
              key={index}
              onAnimationIteration={() => handleAnimationIteration(notification.id)}
              className="sliding-text-item"
            >
              {notification.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BroadcastAlert;
