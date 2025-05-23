/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import { LinearProgress, useMediaQuery } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import CachingController from './CachingController';
import BottomMenu from './common/components/BottomMenu';
import ConnectionStatus from './common/components/ConnectionStatus';
import { useTranslation } from './common/components/LocalizationProvider';
import theme from './common/theme';
import { toast } from './common/util/toasts';
import AdBanner from './main/components/BannerAds';
import { useEffectAsync } from './reactHelper';
import SocketController from './SocketControllerNoAuth';

const useStyles = makeStyles(() => ({
  page: {
    flexGrow: 1,
    overflow: 'auto',
  },
  menu: {
    zIndex: 4,
  },
}));

const ShareNoAuth = () => {
  const classes = useStyles();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const t = useTranslation();

  const [pass, setPass] = useState(null);
  const [obj, setObj] = useState(null);

  const verifyPass = () => {
    try {
      window.alertify.prompt('Ingrese el codigo del enlace (deje en blanco si no requiere contraseña)', '', (evt, value) => {
        if (value === pass) {
          setInitialized(true);
        } else {
          window.alertify.alert('Error', `${t('password_wrong')}`, () => { verifyPass(); });
        }
      }, () => {
        toast.toast('Ingrese la contraseña para continuar');
        setTimeout(() => {
          verifyPass();
        }, 500);
      })
        // .set('onclose', () => { window.alertify.message(''); })
        .set('labels', { ok: 'Ok', cancel: `${t('sharedCancel')}` })
        .set('title', `${t('userPassword')}`)
        .set('closable', false);
      // .set('type', 'number');
    } catch (error) {
      verifyPass();
    }
  };

  const verifyCode = async (_code) => {
    const r = await fetch('/api/links/verify', {
      method: 'POST', // or 'PUT'
      body: JSON.stringify({ code: _code }), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (r.ok) {
      const obj = await r.json();
      setObj(obj);
      setPass(obj.pass);
    } else {
      window.Notiflix.Report.failure(
        'Notiflix Success',
        'Enlace invalido',
        'Okay',
      );
    }
  };

  useEffectAsync(async () => {
    if (!initialized) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('code')) {
        window.alertify.alert('Error', 'Link invalido', () => { navigate('/login'); });
        // navigate('/login');
      }
      await verifyCode(urlParams.get('code'));
    }
    return null;
  }, []);

  useEffect(() => {
    if (pass !== null) {
      verifyPass();
    }
  }, [pass]);

  return !initialized ? (<LinearProgress />) : (
    <>
      <ConnectionStatus />
      <SocketController />
      <CachingController />
      <div className={classes.page}>
        <Outlet />
      </div>
      <AdBanner>
        <p className="ad-banner-text">
          CONTRATA NUESTRO SERVICIO DE RASTREO AL
          {' '}
          <span>
            <a href="tel:4434521162">4434521162</a>
          </span>
        </p>
        <a href="https://www.gpstracker.mx">
          <button type="button" className="ad-banner-cta">GPS TRACKER MX &#8594;</button>
        </a>
      </AdBanner>
      <AdBanner
        align="top"
        width={desktop ? '97%' : '85%'}
        delay={5}
        animationName="ad-banner-dropBanner"
      >
        <p className="ad-banner-text">
          ESTE ENLACE EXPIRA EL:
          {' '}
          {(new Date(obj.limitDate || new Date())).toLocaleDateString()}
        </p>
      </AdBanner>
    </>
  );
};

export default ShareNoAuth;
