/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-this-in-sfc */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  useMediaQuery, InputLabel, Select, MenuItem, FormControl, Button, TextField, Link, Snackbar, IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { encode } from 'base-64';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import { handleLoginTokenListeners, nativeEnvironment, nativePostMessage } from '../common/components/NativeInterface';
import LogoImage from './LogoImage';
import { useCatch } from '../reactHelper';
import { loginTour } from './login_tour';
import VideoPlayer from '../common/components/VideoPlayer';
import ctheme from '../common/theme';
import { openModalPromociones } from '../common/util/utils';

const useStyles = makeStyles((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  loginContainer: {
    backgroundColor: '#ffffffb3',
    zIndex: 9,
    position: 'relative',
    padding: '30px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  videocontainer: {
    position: 'fixed',
    right: 0,
    bottom: -100,
    minWidth: '100%',
    minHeight: '105%',
  },
  extraContainer: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: 'unset',
    display: 'none',
  },
  resetPassword: {
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },

}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], name: values[1].name }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const languageEnabled = useSelector((state) => !state.session.server.attributes['ui.disableLoginLanguage']);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector((state) => state.session.server.openIdEnabled && state.session.server.openIdForce);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);
  const desktop = useMediaQuery(ctheme.breakpoints.up('md'));

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = '';
      try {
        const expiration = moment().add(6, 'months').toISOString();
        const response = await fetch('/api/session/token', {
          method: 'POST',
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = '';
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(`email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`),
      });
      if (response.ok) {
        localStorage.setItem('UGFzc3dvcmRVc2Vy', encode(password));
        const user = await response.json();
        localStorage.setItem('dXNlcg==', encode(JSON.stringify(user)));
        localStorage.setItem('aXNBZG1pbg==', user.administrator);
        localStorage.setItem('aXNSZXZpc29y', (user.attributes.hasOwnProperty('Revisor') && user.attributes.Revisor));
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate('/');
        const promosTimeout = setTimeout(() => {
          fetch('https://crmgpstracker.mx:4040/api/external/promotions/list').then((response) => response.json()).then((result) => {
            if (result.data.length > 0) {
              openModalPromociones();
            }
          });
        }, 3000);
        window.navigation.addEventListener('navigate', (_) => {
          clearTimeout(promosTimeout);
        });
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate('/');
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password) {
      handlePasswordLogin(e);
    }
  };

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    localStorage.removeItem('dXNlcg==');
    localStorage.removeItem('UGFzc3dvcmRVc2Vy');
    localStorage.removeItem('aXNBZG1pbg==');
    localStorage.removeItem('aXNSZXZpc29y');
    window.internalTools?.destroy();
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    // Attach the function to the global window object
    window.loginTour = loginTour;
    // Clean up the function when the component unmounts
    return () => {
      delete window.loginTour;
    };
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return (<LinearProgress />);
  }

  return (
    <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && (
          <Tooltip title={t('settingsServer')}>
            <IconButton onClick={() => navigate('/change-server')}>
              <LockOpenIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className={classes.videocontainer}>
        <VideoPlayer videoSrc="./videos/file.mp4" />
      </div>
      <div style={{ backgroundColor: desktop ? '#ffffffb3' : '#163b6100' }} className={classes.loginContainer}>
        <div className={classes.container}>

          {useMediaQuery(theme.breakpoints.down('lg')) && <LogoImage color={theme.palette.primary.main} />}
          <TextField
            required
            error={failed}
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            autoFocus={!email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyUp={handleSpecialKey}
            helperText={failed && 'Usuario o Contraseña invalidos'}
            id="user"
          // inputLabelProps={{ style: { color: desktop ? '#000000' : '#fff', backgroundColor: desktop ? '#ffffff' : '#163b61' } }}
          />
          <TextField
            required
            error={failed}
            label={t('userPassword')}
            name="password"
            value={password}
            type="password"
            autoComplete="current-password"
            autoFocus={!!email}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={handleSpecialKey}
            id="pass"
          // inputLabelProps={{
          //   style: {
          //     color: desktop ? '#000000' : '#ffffff',
          //     backgroundColor: desktop ? '#ffffff' : '#163b61',
          //     WebkitBoxShadow: desktop
          //       ? '0 0 0 1000px #ffffff inset' // Set the background color even for autofilled input
          //       : '0 0 0 1000px #163b61 inset', // Set the background color for autofilled input
          //   },
          // }}

          />
          <Button
            onClick={handlePasswordLogin}
            onKeyUp={handleSpecialKey}
            variant="contained"
            color="secondary"
            disabled={!email || !password}
            id="btn-login"
          >
            {t('loginLogin')}
          </Button>
          {openIdEnabled && (
            <Button
              onClick={() => handleOpenIdLogin()}
              variant="contained"
              color="secondary"
            >
              {t('loginOpenId')}
            </Button>
          )}
          <div className={classes.extraContainer}>
            <Button
              className={classes.registerButton}
              onClick={() => navigate('/register')}
              disabled={!registrationEnabled}
              color="secondary"
            >
              {t('loginRegister')}
            </Button>
            {languageEnabled && (
              <FormControl fullWidth>
                <InputLabel style={{ color: desktop ? '#000' : '#fff' }}>{t('loginLanguage')}</InputLabel>
                <Select
                  label={t('loginLanguage')}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ color: desktop ? '#000' : '#fff', backgroundColor: desktop ? '#fff' : '#163b61' }}
                >
                  {languageList.map((it) => <MenuItem key={it.code} value={it.code}>{it.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </div>
          {emailEnabled && (
            <Link
              style={{ color: desktop ? '#000000' : '#ffffff' }}
              onClick={() => navigate('/reset-password')}
              className={classes.resetPassword}
              underline="none"
              variant="caption"
            >
              {t('loginReset')}
            </Link>
          )}

          <Tooltip title={`${t('help')} ${t('loginTitle')}`}>
            <Link
              onClick={() => loginTour()}
              className={classes.resetPassword}
              underline="none"
              variant="caption"
            >
              <InfoOutlined style={{ width: '20px', color: desktop ? '#000000' : '#ffffff' }} />
            </Link>
          </Tooltip>
        </div>
      </div>
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={(
          <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      />
    </LoginLayout>
  );
};

export default LoginPage;
