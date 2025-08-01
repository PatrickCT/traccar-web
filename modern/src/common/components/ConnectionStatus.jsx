import { Alert, Snackbar } from '@mui/material';
import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleConnectionChange = () => {
      setNotifications([{
        id: 1,
        show: true,
        message: navigator.onLine ? 'Conexión reestablecida' : 'Fuera de linea',
        duration: navigator.onLine ? 2750 : 9999999999,
        keep: !navigator.onLine,
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
          message: 'Conexión lenta',
          duration: 10000,
          keep: false,
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
            // message={notification.message}
            autoHideDuration={notification.duration}
            onClose={() => {
              if (notification.keep) {
                setNotifications([notification]);
              } else {
                setNotifications([]);
              }
            }}
          >
            <Alert variant="outlined" severity="info">
              {notification.message}
            </Alert>
          </Snackbar>
        ))
      }
    </div>
  );
};

export default ConnectionStatus;
