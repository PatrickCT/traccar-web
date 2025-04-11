/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-console */

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import * as turf from '@turf/turf';
import Notiflix from 'notiflix';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import wellknown from 'wellknown';
import QuantityInput from '../../main/components/NumberInput';
import NumericInput from '../../main/components/NumericInput';

const GeofenceCreator = forwardRef(({ position, existingGeofences, onCreate }, ref) => {
  const [overlapData, setOverlapData] = useState(null);
  const [openConfig, setOpenConfig] = useState(false);
  const [open, setOpen] = useState(false);
  const [pendingGeoJSON, setPendingGeoJSON] = useState(null);
  const [radius, setRadius] = useState(50);

  const handleCreate = () => {
    const center = [position.longitude, position.latitude];
    const newGeofence = turf.circle(center, radius, {
      steps: 64,
      units: 'meters',
    });

    const isLonLat = (coords) => Array.isArray(coords) &&
      coords.length === 2 &&
      Math.abs(coords[0]) <= 180 &&
      Math.abs(coords[1]) <= 90;

    const printCoordSample = (feature) => {
      const coords = feature.geometry.coordinates;
      const first = Array.isArray(coords[0][0]) ? coords[0][0] : coords[0];
      console.log('First coordinate sample:', first, isLonLat(first) ? '[lon, lat] ✅' : '[lat, lon] ❌');
    };

    const fixCoordinateOrder = (polygon) => {
      const fixed = turf.clone(polygon);
      fixed.geometry.coordinates = fixed.geometry.coordinates.map((ring) => ring.map(([x, y]) => [y, x]));
      return fixed;
    };

    const existingPolygons = existingGeofences
      .map((g) => wellknown.parse(g.area))
      .filter(Boolean)
      .map((poly) => turf.feature(poly));

    let overlaps = 0;
    let maxOverlap = 0;
    const overlaps_data = {};

    let index = 0;
    for (let existing of existingPolygons) {
      existing = fixCoordinateOrder(existing);

      const intersection = (turf.intersect(turf.featureCollection([existing, newGeofence])) || turf.booleanIntersects(existing, newGeofence));

      if (intersection) {
        overlaps += 1;
        const percent = (turf.area(intersection) / turf.area(newGeofence)) * 100;

        overlaps_data[existingGeofences[index].id] = { ...existingGeofences[index], percent };
        if (percent > maxOverlap) {
          maxOverlap = percent;
        }
      }
      index += 1;
    }

    if (overlaps > 0) {
      setOverlapData({ count: overlaps, maxOverlap, data: overlaps_data });
      setPendingGeoJSON(newGeofence);
      setOpen(true);
    } else {
      Notiflix.Loading.dots('Creando geocerca');
      onCreate(newGeofence);
    }
  };

  const handleForceCreate = () => {
    if (pendingGeoJSON) {
      onCreate(pendingGeoJSON);
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPendingGeoJSON(null);
    setOverlapData(null);
  };

  const handleCloseConfig = () => {
    setOpenConfig(false);
    setPendingGeoJSON(null);
    setOverlapData(null);
  };

  useImperativeHandle(ref, () => ({
    create: handleCreate,
    config: setOpenConfig,
  }));

  return (
    <>
      <Dialog open={openConfig} onClose={handleCloseConfig}>
        <DialogTitle>Radio de la geocerca</DialogTitle>
        <DialogContent>
          <NumericInput
            min={10}
            max={100}
            initialValue={50}
            onChange={(val) => setRadius(val)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfig}>Cancelar</Button>
          <Button
            onClick={() => {
              handleCloseConfig();
              handleCreate();
            }}
            color="primary"
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Superposición de geocercas detectada</DialogTitle>
        <DialogContent>
          <Typography>
            La geocerca que intentas crear choca con
            {' '}
            {overlapData?.count}
            {' '}
            geocercas existente
            {overlapData?.count > 1 ? 's' : ''}
            .
          </Typography>
          {Object.values(overlapData?.data ?? []).map((el) => (
            <Typography>
              {el.id}
              {' - '}
              {el.name}
              {' -> '}
              {Number(el.percent).toFixed(0)}
              %
            </Typography>
          ))}
          <Typography>
            Aun asi deseas generar la geocerca?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleForceCreate} color="primary">Crear de todas formas</Button>
        </DialogActions>
      </Dialog>
    </>

  );
});

export default GeofenceCreator;
