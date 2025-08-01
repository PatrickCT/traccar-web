/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import { Alert, Box, LinearProgress, Link, Snackbar } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './common/components/LocalizationProvider';
import { snackBarDurationLongMs } from './common/util/duration';
import { useAttributePreference } from './common/util/preferences';
import useFeatures from './common/util/useFeatures';
import { isMobile } from './common/util/utils';
import { useEffectAsync } from './reactHelper';
import alarm from './resources/alarm.mp3';
import { devicesActions, sessionActions } from './store';
import { eventsActions } from './store/events';

const logoutCode = 4000;

function importAll(r) {
  return r.keys().map(r);
}

const sosFiles = import.meta.glob('./resources/alarms/sos/*.{mp3,wav}', { eager: true });
const powerCutFiles = import.meta.glob('./resources/alarms/powerCut/*.{mp3,wav}', { eager: true });

const SocketController = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const authenticated = useSelector((state) => !!state.session.user);
  const devices = useSelector((state) => state.devices.items);

  const socketRef = useRef();

  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const soundEvents = useAttributePreference('soundEvents', '');
  const soundAlarms = useAttributePreference('soundAlarms', 'sos');

  const features = useFeatures();

  const allowedFunctions = {
    refreshUser: async () => {
      const response = await fetch('/api/session');
      if (response.ok) {
        dispatch(sessionActions.updateUser(await response.json()));
      }
    },
    reload: async () => {
      window.location.reload();
    },
    logout: () => {
      window.handleLogout();
    },
  };

  const connectSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/api/socket`);
      socketRef.current = socket;
      window.traccarSocket = socket;

      const callCounters = {
        updateDevices: 0,
        updatePositions: 0,
        addEvents: 0,
      };

      const trackDispatch = (actionType) => {
        callCounters[actionType]++;
      };

      setInterval(() => {
        // console.log('Dispatch Call Counts per second:', callCounters);
        // Reset the counters
        callCounters.updateDevices = 0;
        callCounters.updatePositions = 0;
        callCounters.addEvents = 0;
      }, 1000);

      const positionQueue = [];

      // Add data to the queue
      const queuePositions = (positions) => {
        positionQueue.push(...positions);
      };

      // Process the queue every second
      setInterval(() => {
        if (positionQueue.length > 0) {
          trackDispatch('updatePositions');
          dispatch(sessionActions.updatePositions(positionQueue));
          // Clear the queue
          positionQueue.length = 0;
        }
      }, 1000);

      socket.onopen = () => {
        dispatch(sessionActions.updateSocket(true));
      };

      socket.onclose = async (event) => {
        dispatch(sessionActions.updateSocket(false));
        if (event.code !== logoutCode) {
          try {
            const devicesResponse = await fetch('/api/devices');
            if (devicesResponse.ok) {
              dispatch(devicesActions.update(await devicesResponse.json()));
            }
            const positionsResponse = await fetch('/api/positions');
            if (positionsResponse.ok) {
              dispatch(sessionActions.updatePositions(await positionsResponse.json()));
            }
            if (devicesResponse.status === 401 || positionsResponse.status === 401) {
              navigate('/login');
            }
          } catch (error) {
            // ignore errors
          }
          setTimeout(() => connectSocket(), 60000);
        }
      };

      socket.onmessage = (event) => {
        if (document.hidden) return;
        const data = JSON.parse(event.data);

        if (data.devices) {
          trackDispatch('updateDevices');
          dispatch(devicesActions.update(data.devices));
        }
        if (data.positions) {
          queuePositions(data.positions);
          // if (!document.hidden) {
          //   // dispatch(sessionActions.updatePositions(data.positions));
          //   queuePositions(data.positions);
          // }
        }
        if (data.events) {
          if (!features.disableEvents) {
            trackDispatch('addEvents');
            dispatch(eventsActions.add(data.events));
          }
          setEvents(data.events);
        }
        if (data.custom) {
          (allowedFunctions[JSON.parse(data.custom).command] ?? (() => { }))();
        }
      };
    } catch (error) {
      console.error(error);
    }
  };

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
      connectSocket();
      window.reconnectSocket = async () => {
        const socket = socketRef.current;
        if (socket) {
          await socket.close();
          connectSocket();
        }
      };

      return () => {
        const socket = socketRef.current;
        if (socket) {
          socket.close(logoutCode);
        }
      };
    }
    return null;
  }, [authenticated]);

  useEffect(() => {
    if (!isMobile()) {
      setNotifications(events.map((event) => ({
        id: event.id,
        message: event.attributes.message,
        show: true,
        position: { vertical: 'bottom', horizontal: 'right' }
      })));
    }
  }, [events, devices, t]);

  useEffect(() => {
    events.forEach((event) => {
      if (soundEvents.includes(event.type) || (event.type === 'alarm' && soundAlarms.includes(event.attributes.alarm))) {
        let audioFile = alarm;

        if (event.attributes.alarm) {
          switch (event.attributes.alarm) {
            case 'sos':
              audioFile = sosFiles[Math.floor(Math.random() * sosFiles.length)];
              break;
            case 'powerCut':
              audioFile = powerCutFiles[Math.floor(Math.random() * powerCutFiles.length)];
              break;
            default: break;
          }
        }

        new Audio(audioFile).play();
      }
    });
  }, [events, soundEvents, soundAlarms]);

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          anchorOrigin={notification.position}
          key={notification.id}
          open={notification.show}
          autoHideDuration={snackBarDurationLongMs}
          onClose={() => setEvents(events.filter((e) => e.id !== notification.id))}
        >
          <Alert
            severity="info"
            onClose={() => setEvents(events.filter((e) => e.id !== notification.id))}
            variant="filled"
            sx={{
              fontSize: '12px',
              maxHeight: '20dvh',
              maxWidth: '90dvw',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'black',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              transition: 'background-color 0.3s, opacity 0.3s',
              '&:hover': {
                backgroundColor: 'transparent',
                opacity: 0.0,
                backdropFilter: 'none',
              },
            }}
          >
            {notification.message.split('\\n').map((line, i) => (
              <React.Fragment key={i}>
                {line.includes('http') ? <Link href={line} target='_blank'>{line}</Link> : line}
                <br />
              </React.Fragment>
            ))}
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(9, 12, 155, 0.9)',
                  transformOrigin: 'left',
                  animation: `shrink ${snackBarDurationLongMs}ms linear forwards`,
                },
                '@keyframes shrink': {
                  from: { transform: 'scaleX(1)' },
                  to: { transform: 'scaleX(0)' },
                },
              }}
            />
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default connect()(SocketController);
