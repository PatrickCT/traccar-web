import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import {
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead, TableRow,
} from '@mui/material';
import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import TableShimmer from '../common/components/TableShimmer';
import { formatSpeed, formatTime } from '../common/util/formatter';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { prefixString } from '../common/util/stringUtils';
import usePersistedState from '../common/util/usePersistedState';
import MapView from '../map/core/MapView';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import MapPositions from '../map/MapPositions';
import MapRoutePoints from '../map/MapRoutePoints';
import { useCatch, useEffectAsync } from '../reactHelper';
import scheduleReport from './common/scheduleReport';
import useReportStyles from './common/useReportStyles';
import ColumnSelect from './components/ColumnSelect';
import ReportFilter from './components/ReportFilter';
import ReportsMenu from './components/ReportsMenu';

const filters = ['Unknown', 'Offline', 'Online'];
const columnsArray = [
  ['eventTime', 'positionFixTime'],
  ['type', 'sharedType'],
  ['geofenceId', 'sharedGeofence'],
  ['maintenanceId', 'sharedMaintenance'],
  ['attributes', 'commandData'],
];
const columnsMap = new Map(columnsArray);

const EventReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const geofences = useSelector((state) => state.geofences.items);

  const speedUnit = useAttributePreference('speedUnit');
  const hours12 = usePreference('twelveHourFormat');

  const [allEventTypes, setAllEventTypes] = useState([['allEvents', 'eventAll']]);

  const [columns, setColumns] = usePersistedState('eventColumns', ['eventTime', 'type', 'attributes']);
  const [eventTypes, setEventTypes] = useState(['allEvents']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [position, setPosition] = useState(null);
  const fontSize = 14;

  useEffectAsync(async () => {
    if (selectedItem) {
      const response = await fetch(`/api/positions?id=${selectedItem.positionId}`);
      if (response.ok) {
        const positions = await response.json();
        if (positions.length > 0) {
          setPosition(positions[0]);
        }
      } else {
        throw Error(await response.text());
      }
    } else {
      setPosition(null);
    }
  }, [selectedItem]);

  useEffectAsync(async () => {
    const response = await fetch('/api/notifications/types');
    if (response.ok) {
      const types = await response.json();
      setAllEventTypes([...allEventTypes, ...types.map((it) => [it.type, prefixString('event', it.type)])]);
    } else {
      throw Error(await response.text());
    }
  }, []);

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));

    eventTypes.forEach((it) => query.append('type', it));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    if (type === 'export') {
      window.location.assign(`/api/reports/events/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/events/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/events?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const i = await response.json();
          setItems(i);
          // setSelectedItem(i.filter((it) => !filters.some((term) => it.type.includes(term)))[0]);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'events';
    if (eventTypes[0] !== 'allEvents') {
      report.attributes.types = eventTypes.join(',');
    }
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  const formatValue = (item, key) => {
    switch (key) {
      case 'eventTime':
        return formatTime(item[key], 'seconds', hours12);
      case 'type':
        return t(prefixString('event', item[key]));
      case 'geofenceId':
        if (item[key] > 0) {
          const geofence = geofences[item[key]];
          return geofence && geofence.name;
        }
        return null;
      case 'maintenanceId':
        return item[key] > 0 ? item[key] > 0 : null;
      case 'attributes':
        switch (item.type) {
          case 'alarm':
            return t(prefixString('alarm', item.attributes.alarm));
          case 'deviceOverspeed':
            return formatSpeed(item.attributes.speed, speedUnit, t);
          case 'driverChanged':
            return item.attributes.driverUniqueId;
          case 'media':
            return (<Link href={`/api/media/${devices[item.deviceId]?.uniqueId}/${item.attributes.file}`} target="_blank">{item.attributes.file}</Link>);
          case 'commandResult':
            return item.attributes.result;
          default:
            return '';
        }
      default:
        return item[key];
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportEvents']}>
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {position && [...new Set(items.map((it) => it.deviceId))].map((deviceId) => (
                <Fragment key={deviceId}>
                  <MapRoutePoints positions={[position]} onClick={setSelectedItem} />
                </Fragment>
              ))}
              {position && <MapPositions positions={[position]} titleField="fixTime" />}
            </MapView>
            {position && <MapCamera latitude={position.latitude} longitude={position.longitude} />}
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} includeGroups multiDevice>
              <div className={classes.filterItem}>
                <FormControl fullWidth>
                  <InputLabel>{t('reportEventTypes')}</InputLabel>
                  <Select
                    label={t('reportEventTypes')}
                    value={eventTypes}
                    onChange={(event, child) => {
                      let values = event.target.value;
                      const clicked = child.props.value;
                      if (values.includes('allEvents') && values.length > 1) {
                        values = [clicked];
                      }
                      setEventTypes(values);
                    }}
                    multiple
                  >
                    {allEventTypes.map(([key, string]) => (
                      <MenuItem key={key} value={key}>{t(string)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
            </ReportFilter>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                <TableCell>{t('sharedDevice')}</TableCell>
                {columns.map((key) => (<TableCell key={key}>{t(columnsMap.get(key))}</TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.map((item) => (
                <TableRow key={item.id} onClick={() => (!filters.some((term) => item.type.includes(term)) ? setSelectedItem(item) : null)} style={{ backgroundColor: (selectedItem === item ? 'rgba(22, 59, 97, .7)' : 'transparent') }}>
                  <TableCell className={classes.columnAction} padding="none">
                    {item.positionId ? selectedItem === item ? (
                      <IconButton size="small" onClick={() => setSelectedItem(null)}>
                        <GpsFixedIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" onClick={() => setSelectedItem(item)}>
                        <LocationSearchingIcon fontSize="small" />
                      </IconButton>
                    ) : ''}
                  </TableCell>
                  <TableCell>
                    {devices[item.deviceId]?.name}
                  </TableCell>

                  {columns.map((key) => (
                    <TableCell style={{ fontSize, lineHeight: '1', padding: '4px' }} key={key}>
                      {formatValue(item, key)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (<TableShimmer columns={columns.length + 1} />)}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventReportPage;
