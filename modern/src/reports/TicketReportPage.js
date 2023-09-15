import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import moment from 'moment';
import { Popup } from 'maplibre-gl';
// import GpsFixedIcon from '@mui/icons-material/GpsFixed';
// import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import ReportFilter from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePersistedState from '../common/util/usePersistedState';

import { useCatch } from '../reactHelper';
import { map } from '../map/core/MapView';

import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';

import scheduleReport from './common/scheduleReport';
import {
  createPopUpReportRoute, generateRoute, streetView,
} from '../common/util/mapPopup';
import { formatDate } from '../common/util/utils';

const TicketReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const [columns] = usePersistedState('routeColumns', ['fixTime', 'latitude', 'longitude', 'speed', 'address']);
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const onMapPointClick = useCallback((positionId) => {
    Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
    setSelectedItem(items.find((it) => it.id === positionId));
    new Popup()
      .setMaxWidth('400px')
      .setHTML(createPopUpReportRoute(items.find((it) => it.id === positionId)))
      .setLngLat([items.find((it) => it.id === positionId).longitude, items.find((it) => it.id === positionId).latitude])
      .addTo(map);
    window.position = items.find((it) => it.id === positionId);
  }, [items, setSelectedItem]);

  const handleSubmit = useCatch(async ({ deviceIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    if (type === 'export') {
      window.location.assign(`/api/reports/tickets/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/tickets/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/tickets?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const itemst = await response.json();
          setItems(itemst);
          const groupedData = itemst.reduce((grouped, item) => {
            const { salida } = item;
            if (!grouped[salida]) {
              grouped[salida] = [];
            }
            grouped[salida].push(item);
            return grouped;
          }, {});
          setGroups(groupedData);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'route';
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  useEffect(() => {
    // Attach the function to the global window object
    window.navigate = navigate;
    window.streetView = streetView;
    window.generateRoute = generateRoute;
    window.position = selectedItem;
    window.map = map;

    // Clean up the function when the component unmounts
    return () => {
      delete window.navigate;
      delete window.streetView;
      delete window.position;
      delete window.map;
    };
  }, []);

  const calcDiffColor = (ticket) => {
    let border = '#163b61';
    let backgroundColor = '#9dc5ff  ';

    if (ticket.enterTime === undefined || ticket.enterTime === null) {
      border = '#163b61';
      backgroundColor = '#9dc5ff';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= -3) {
      border = '#cc9c00';
      backgroundColor = '#ffe798';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= 0 && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > -3) {
      border = '#065f46';
      backgroundColor = '#d1fae5';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > 0) {
      border = '#ff185d';
      backgroundColor = '#fde1f0';
    } else {
      border = '#163b61';
      backgroundColor = '#9dc5ff';
    }

    return { backgroundColor, border, borderStyle: 'solid', borderWidth: '3px', marginBottom: '3px', borderRadius: '8px' };
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportRoute']}>
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} multiDevice />
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                <TableCell>{t('sharedDevice')}</TableCell>
                <TableCell>{t('sharedExits')}</TableCell>
                <TableCell>{t('sharedGeofence')}</TableCell>
                <TableCell>Hora programada</TableCell>
                <TableCell>Hora de ingreso</TableCell>
                <TableCell>Diferencia</TableCell>
                <TableCell>Castigo</TableCell>
                {columns.map((key) => (<TableCell key={key}>{key}</TableCell>))}
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading ? Object.keys(groups).map((salida) => (
                // Create a row for each group
                <React.Fragment key={salida}>
                  <TableRow>
                    <TableCell colSpan={8}>{`Salida: ${salida}`}</TableCell>
                  </TableRow>
                  {groups[salida].map((item) => (
                    // Create rows for items within the group
                    <TableRow style={calcDiffColor(item)} onClick={() => onMapPointClick(item.id)} key={item.id}>
                      <TableCell className={classes.columnAction} padding="none" />
                      <TableCell>
                        {devices[item.device].name}
                      </TableCell>
                      <TableCell>
                        {item.salida}
                      </TableCell>
                      <TableCell>
                        {item.geofence}
                      </TableCell>
                      <TableCell>
                        {item.expectedTime ? formatDate(new Date(item.expectedTime), 'yyyy-MM-dd HH:mm:ss') : 'Sin registro'}
                      </TableCell>
                      <TableCell>
                        {item.enterTime ? formatDate(new Date(item.enterTime), 'yyyy-MM-dd HH:mm:ss') : 'Sin registro'}
                      </TableCell>
                      <TableCell>
                        {item.difference}
                      </TableCell>
                      <TableCell>
                        {item.punishment}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <br />
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              )) : (
                <TableShimmer columns={columns.length + 2} startAction />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default TicketReportPage;
