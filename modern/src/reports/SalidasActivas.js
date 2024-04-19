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
  const [perPage, setPerPage] = useState(5);
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
      setSubRoute(data[0]?.groupId || 0);
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
    }, 1 * 10 * 1000);

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
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
              <ArrowBack style={{ color: 'white' }} />
            </IconButton>
            <PageTitle breadcrumbs={['Salidas activas']} />
            <div style={{ width: '10%' }} />
            <Select
              style={{ flex: 1, backgroundColor: 'white', maxWidth: '5%' }}
              defaultValue={5}
              onChange={(event) => setPerPage(event.target.value)}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={salidas.length}>Todas</MenuItem>
            </Select>
            <div style={{ width: '1%' }} />
            <Select
              style={{ flex: 1, backgroundColor: 'white', maxWidth: '15%' }}
              defaultValue={0}
              onChange={(event) => setSubRoute(event.target.value)}
            >
              <MenuItem value={0}>Todas</MenuItem>
              {subroutes.map((item) => <MenuItem value={item.groupId}>{item.name}</MenuItem>)}
            </Select>
            <div style={{ width: '1%' }} />
            <Pagination
              style={{ flex: 2, backgroundColor: 'white', maxWidth: '20%' }}
              count={Math.ceil(salidas.length / perPage)}
              onChange={(event, page) => {
                setLoading(true);
                setPage(page);
                setLoading(false);
              }}
            />
          </Toolbar>

          <LoadingComponent
            isLoading={loading}
          >
            <Box sx={{ flexGrow: 1, height: '100vh' }}>
              <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 8, md: 12 }}>
                {visibles.map((device) => (
                  <Grid item xs={2} sm={2} md={2}>
                    <>
                      <Toolbar>
                        <PageTitle breadcrumbs={[`${device.name}`]} />
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
