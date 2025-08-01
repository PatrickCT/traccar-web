import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { Popup } from 'maplibre-gl';
import Notiflix from 'notiflix';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AddressValue from '../common/components/AddressValue';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import TableShimmer from '../common/components/TableShimmer';
import {
  formatDistance, formatHours,
  formatTime,
  formatVolume,
} from '../common/util/formatter';
import { createPopUpSimple } from '../common/util/mapPopup';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import usePersistedState from '../common/util/usePersistedState';
import '../main/MainPage.css';
import { geometryToArea } from '../map/core/mapUtil';
import MapView, { map } from '../map/core/MapView';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import MapPositions from '../map/MapPositionsOriginal';
import { useCatch } from '../reactHelper';
import scheduleReport from './common/scheduleReport';
import useReportStyles from './common/useReportStyles';
import ColumnSelect from './components/ColumnSelect';
import GeofenceCreator from './components/GeofenceCreator';
import ReportFilter from './components/ReportFilter';
import ReportsMenu from './components/ReportsMenu';

const columnsArray = [
  ['startTime', 'reportStartTime'],
  ['startOdometer', 'positionOdometer'],
  ['address', 'positionAddress'],
  ['endTime', 'reportEndTime'],
  ['duration', 'reportDuration'],
  ['engineHours', 'reportEngineHours'],
  ['spentFuel', 'reportSpentFuel'],
];
const columnsMap = new Map(columnsArray);

const StopReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const geofenceRef = useRef();

  const distanceUnit = useAttributePreference('distanceUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const hours12 = usePreference('twelveHourFormat');
  const fontSize = 14;

  const [columns, setColumns] = usePersistedState('stopColumns', ['startTime', 'endTime', 'startOdometer', 'address', 'duration']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const geofences = useSelector((state) => state.geofences.items);

  const handleTriggerGeofence = () => {
    geofenceRef.current.config(true);
  };

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    if (type === 'export') {
      window.location.assign(`/api/reports/stops/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/stops/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/stops?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const i = await response.json();
          setItems(i);
          setSelectedItem(i[0] || null);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'stops';
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  const formatValue = (item, key) => {
    switch (key) {
      case 'startTime':
      case 'endTime':
        return formatTime(item[key], 'minutes', hours12);
      case 'startOdometer':
        return formatDistance(item[key], distanceUnit, t);
      case 'duration':
        return formatHours(item[key]);
      case 'engineHours':
        return formatHours(item[key]);
      case 'spentFuel':
        return formatVolume(item[key], volumeUnit, t);
      case 'address':
        return (<AddressValue latitude={item.latitude} longitude={item.longitude} originalAddress={item[key]} />);
      default:
        return item[key];
    }
  };

  const showPU = (position) => {
    Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
    new Popup()
      .setMaxWidth('400px')
      .setOffset(30)
      .setHTML(createPopUpSimple(position, ['streetView', 'geofence']))
      .setLngLat([position.longitude, position.latitude])
      .addTo(map);
  };

  useEffect(() => {
    window.createGeofence = handleTriggerGeofence;

    return () => {
      window.createGeofence = undefined;
      delete window.createGeofence;
    };
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportStops']}>
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              <MapPositions
                positions={[...items.map((i) => ({
                  deviceId: i.deviceId,
                  fixTime: i.startTime,
                  latitude: i.latitude,
                  longitude: i.longitude,
                }))]}
                titleField=""
              />
            </MapView>
            <MapCamera latitude={selectedItem.latitude} longitude={selectedItem.longitude} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule}>
              <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
            </ReportFilter>
          </div>
          <GeofenceCreator
            ref={geofenceRef}
            position={selectedItem}
            existingGeofences={Object.values(geofences)}
            radius={15}
            onCreate={async (geojson) => {
              // call your endpoint here
              const newItem = { name: '', area: geometryToArea(geojson?.geometry) };
              const response = await fetch('/api/geofences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
              });

              if (response.ok) {
                const item = await response.json();
                await fetch('/api/permissions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ deviceId: selectedItem.deviceId, geofenceId: item.id }),
                });
                navigate(`/settings/geofence/${item.id}`);
              } else {
                throw Error(await response.text());
              }
              Notiflix.Loading.remove();
            }}
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                {columns.map((key) => (<TableCell key={key}>{t(columnsMap.get(key))}</TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    showPU(item);
                  }}
                  style={{ backgroundColor: selectedItem === item ? 'rgba(22, 59, 97, .7)' : 'transparent' }}
                >
                  <TableCell key={`${item.id}-0`} className={classes.columnAction} padding="none" />
                  {columns.map((key) => (
                    <TableCell key={`${item.id}-${key}`} style={{ fontSize, lineHeight: '1', padding: '4px' }}>
                      {formatValue(item, key)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (<TableShimmer columns={columns.length + 1} startAction />)}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default StopReportPage;
