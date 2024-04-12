/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, IconButton, NativeSelect, Pagination, Toolbar,
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

  useEffect(() => {
    const asyncFn = async () => {
      const response = await fetch('/api/salidas/report', {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      setSalidas(data.map((salida) => salida.deviceId));
      setLoading(false);
    };
    asyncFn();
  }, []);

  useEffect(() => {
    const v = Object.values(devices).filter((device) => salidas.slice((page - 1) * perPage, page * perPage).includes(device.id));
    setVisibles(v);
    v.forEach((salida) => {
      visibles.push(salida);
      visibles.pop();
    });
  }, [salidas, page, perPage]);

  // setInterval(() => {
  //   fetch('/api/salidas/report', {
  //     headers: { Accept: 'application/json' },
  //   }).then((response) => response.json())
  //     .then((data) => setSalidas(data.map((salida) => salida.deviceId)));
  // }, 10000);

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
            <NativeSelect
              style={{ flex: 1, backgroundColor: 'white', maxWidth: '20%' }}
              defaultValue={5}
              onChange={(event) => setPerPage(event.target.value)}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={salidas.length}>Todas</option>
            </NativeSelect>
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
              <Grid container spacing={{ xs: 2, md: 4 }} columns={{ xs: 1, sm: 8, md: 12 }}>
                {visibles.map((device) => (
                  <Grid item xs={2} sm={4} md={4}>
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
                        autoUpdate
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
