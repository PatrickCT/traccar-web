import { Snackbar } from '@mui/material';
import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleConnectionChange = () => {
      setNotifications([{
        id: 1,
        show: true,
        message: navigator.onLine ? 'Back online' : 'Connection offline',
        duration: navigator.onLine ? 2750 : 9999999999999,
      }]);
    };

    const handleNetworkChange = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      // Check if the downlink speed is below a certain threshold (e.g., 2 Mbps)
      const isSlow = connection && connection.downlink && connection.downlink < 2;
      if (isSlow) {
        setNotifications([{
          id: 1,
          show: true,
          message: 'Slow connection',
          duration: 9999999999999,
        }]);
      }
    };

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('change', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      window.removeEventListener('change', handleNetworkChange);
    };
  }, []);

  return (
    <div>
      {
        notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={notification.show}
            message={notification.message}
            autoHideDuration={notification.duration}
            onClose={() => setNotifications([])}
          />
        ))
      }
    </div>
  );
};

export default ConnectionStatus;
