/* eslint-disable import/no-extraneous-dependencies */
import { LinearProgress, useMediaQuery } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import CachingController from './CachingController';
import BottomMenu from './common/components/BottomMenu';
import ConnectionStatus from './common/components/ConnectionStatus';
import theme from './common/theme';
import { useChecador } from './common/util/permissions';
import { useEffectAsync } from './reactHelper';
import SocketController from './SocketController';
import { sessionActions } from './store';

const useStyles = makeStyles(() => ({
  page: {
    flexGrow: 1,
    overflow: 'auto',
  },
  menu: {
    zIndex: 4,
  },
}));

const App = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const checador = useChecador();

  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  const newServer = useSelector((state) => state.session.server.newServer);
  const initialized = useSelector((state) => !!state.session.user);

  useEffectAsync(async () => {
    if (!initialized) {
      const response = await fetch('/api/session');
      if (response.ok) {
        dispatch(sessionActions.updateUser(await response.json()));
        const subusers = await fetch('/api/subusers');
        dispatch(sessionActions.updateSubusers(await subusers.json()));
      } else if (newServer) {
        navigate('/register');
      } else {
        navigate('/login');
      }
    }

    if (checador) {
      navigate('/exits');
    }

    return null;
  }, [initialized]);

  return !initialized ? (<LinearProgress />) : (
    <>
      <ConnectionStatus />
      <SocketController />
      <CachingController />
      <div className={classes.page}>
        <Outlet />
      </div>
      {!desktop && (
        <div className={classes.menu}>
          <BottomMenu />
        </div>
      )}
    </>
  );
};

export default App;
