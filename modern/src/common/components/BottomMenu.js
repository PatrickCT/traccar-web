import {
  Badge,
  BottomNavigation, BottomNavigationAction, Menu, MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import DescriptionIcon from '@mui/icons-material/Description';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

import { sessionActions } from '../../store';
import { useChecador, useRestriction } from '../util/permissions';
import { forgetMe } from '../util/utils';
import { useTranslation } from './LocalizationProvider';
import { nativePostMessage } from './NativeInterface';

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const checador = useChecador();

  const [anchorEl, setAnchorEl] = useState(null);

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) {
      return 'account';
    } if (location.pathname.startsWith('/settings')) {
      return 'settings';
    } if (location.pathname.startsWith('/reports')) {
      return 'reports';
    } if (location.pathname === '/') {
      return 'map';
    }
    return null;
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    forgetMe();
    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens: tokens.length > 1 ? tokens.filter((it) => it !== notificationToken).join(',') : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'map':
        navigate('/');
        break;
      case 'reports':
        navigate('/reports/route');
        break;
      case 'settings':
        navigate('/settings/preferences');
        break;
      case 'account':
        setAnchorEl(event.currentTarget);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Attach the function to the global window object
    window.handleLogout = handleLogout;

    // Clean up the function when the component unmounts
    return () => {
      delete window.handleLogout;
    };
  }, []);

  return (
    <Paper square elevation={3} id="bottomMenu">
      {checador && (
        <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
          {readonly ? (
            <BottomNavigationAction label={t('loginLogout')} icon={<ExitToAppIcon style={{ color: 'white' }} />} value="logout" />
          ) : (
            <BottomNavigationAction label={t('settingsUser')} icon={<PersonIcon style={{ color: 'white' }} />} value="account" />
          )}
        </BottomNavigation>
      )}

      {!checador && (
        <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
          <BottomNavigationAction
            label={t('mapTitle')}
            icon={(
              <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
                <MapIcon style={{ color: 'white' }} />
              </Badge>
            )}
            value="map"
          />
          {!disableReports && (
            <BottomNavigationAction id="btn-reports" label={t('reportTitle')} icon={<DescriptionIcon style={{ color: 'white' }} />} value="reports" />
          )}
          <BottomNavigationAction label={t('settingsTitle')} icon={<SettingsIcon style={{ color: 'white' }} />} value="settings" />
          {readonly ? (
            <BottomNavigationAction label={t('loginLogout')} icon={<ExitToAppIcon style={{ color: 'white' }} />} value="logout" />
          ) : (
            <BottomNavigationAction label={t('settingsUser')} icon={<PersonIcon style={{ color: 'white' }} />} value="account" />
          )}
        </BottomNavigation>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {!checador && (
          <MenuItem onClick={handleAccount}>
            <Typography color="textPrimary">{t('settingsUser')}</Typography>
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
