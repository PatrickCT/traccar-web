/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, IconButton, MenuItem, Pagination, Select, Toolbar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import PageLayout, { PageTitle } from '../common/components/PageLayout';
import useReportStyles from './common/useReportStyles';
import TableExist from '../main/components/TableExits';
import LoadingComponent from '../settings/components/LoadingComponent';

const SalidasActivas = () => {
  const devices = useSelector((state) => state.devices.items);
  const classes = useReportStyles();
  const navigate = useNavigate();
  const [salidas, setSalidas] = useState([]);
  const [visibles, setVisibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(6);
  const [page, setPage] = useState(1);
  const [subroutes, setSubRoutes] = useState([]);
  const [subroute, setSubRoute] = useState(0);

  useEffect(() => {
    const loadSubRutas = async () => {
      const response = await fetch('/api/subroutes', {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      setSubRoutes(data);
      setSubRoute(0);
    };
    loadSubRutas();
    const asyncFn = async () => {
      const response = await fetch('/api/salidas/report', {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      // setSalidas(data.map((salida) => salida.deviceId));
      setSalidas(data);
      setLoading(false);
    };
    asyncFn();
    const intervalId = setInterval(async () => {
      await asyncFn();
    }, 1 * 30 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const salidasTemp = salidas.filter((item) => (subroute === 0 ? true : item.groupId === subroute));
    const v = Object.values(devices).filter((device) => salidasTemp.slice((page - 1) * perPage, page * perPage).map((item) => item.deviceId).includes(device.id));
    setVisibles(v);

    v.forEach((salida) => {
      if (salida.groupId === subroute || subroute === 0) {
        visibles.push(salida);
        visibles.pop();
      }
    });
  }, [salidas, page, perPage, subroute]);

  return (
    <PageLayout breadcrumbs={['reportTitle', 'reportRoute']}>
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <Toolbar style={{ maxHeight: '10%' }}>
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
              <ArrowBack style={{ color: 'white' }} />
            </IconButton>
            <PageTitle breadcrumbs={['Salidas activas']} />
            <div style={{ width: '10%' }} />
            <Grid key="main-grid" container spacing={{ xs: 1, md: 0.5 }} columns={{ xs: 1, sm: 6, md: 12 }}>
              <Select
                style={{ flex: 1, backgroundColor: 'white' }}
                defaultValue={6}
                onChange={(event) => setPerPage(event.target.value)}
              >
                <MenuItem key={`mi.${6}`} value={6}>6</MenuItem>
                <MenuItem key={`mi.${7}`} value={7}>7</MenuItem>
                <MenuItem key={`mi.${8}`} value={8}>8</MenuItem>
                <MenuItem key={`mi.${9}`} value={9}>9</MenuItem>
                <MenuItem key={`mi.${10}`} value={10}>10</MenuItem>
                <MenuItem key={`mi.${20}`} value={20}>20</MenuItem>
                <MenuItem key={`mi.${30}`} value={30}>30</MenuItem>
                <MenuItem key={`mi.${50}`} value={50}>50</MenuItem>
                <MenuItem key={`mi.${salidas.length}`} value={salidas.length}>Todas</MenuItem>
              </Select>
              <div style={{ width: '1%' }} />
              <Select
                style={{ flex: 1, backgroundColor: 'white' }}
                defaultValue={0}
                onChange={(event) => setSubRoute(event.target.value)}
              >
                <MenuItem key="mi-default" value={0}>Todas</MenuItem>
                {subroutes.map((item) => <MenuItem key={`mi-${item.groupId}`} value={item.groupId}>{item.name}</MenuItem>)}
              </Select>
              <div style={{ width: '1%' }} />
              <Pagination
                style={{ flex: 2, backgroundColor: 'white' }}
                count={Math.ceil(salidas.length / perPage)}
                onChange={(event, page) => {
                  setLoading(true);
                  setPage(page);
                  setLoading(false);
                }}
              />
            </Grid>
          </Toolbar>

          <LoadingComponent
            isLoading={loading}
          >
            <Box sx={{ flexGrow: 1, height: '100vh' }}>
              <Grid key="devices-grid" container spacing={{ xs: 1, md: 0.5 }} columns={{ xs: 1, sm: 6, md: 12 }}>
                {visibles.map((device) => (
                  <Grid key={`grid-device-${device.id}`} item xs={2} sm={2} md={2} lg={2}>
                    <>
                      <Toolbar>
                        <PageTitle key={`toolb-${device.id}`} breadcrumbs={[`${device.name}`]} />
                      </Toolbar>
                      <TableExist
                        key={device.id}
                        deviceId={device.id}
                        handleLoadInfo={() => { }}
                        topDirectory="../"
                        btnChangeTime={false}
                        dropDrivers={false}
                      />
                    </>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </LoadingComponent>
        </div>
      </div>
    </PageLayout>
  );
};

export default SalidasActivas;
