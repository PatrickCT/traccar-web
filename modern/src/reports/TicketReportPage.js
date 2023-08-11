import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';

import { Popup } from 'maplibre-gl';
// import GpsFixedIcon from '@mui/icons-material/GpsFixed';
// import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import ReportFilter from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePersistedState from '../common/util/usePersistedState';
import PositionValue from '../common/components/PositionValue';

import { useCatch } from '../reactHelper';
import { map } from '../map/core/MapView';

import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';

import scheduleReport from './common/scheduleReport';
import {
  createPopUpReportRoute, generateRoute, streetView,
} from '../common/util/mapPopup';

const TicketReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const [columns] = usePersistedState('routeColumns', ['fixTime', 'latitude', 'longitude', 'speed', 'address']);
  const [items, setItems] = useState([]);
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
          setSelectedItem(itemst[0]);
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
                {columns.map((key) => (<TableCell key={key}>{key}</TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.slice(0, 4000).map((item) => (
                <TableRow onClick={() => onMapPointClick(item.id)}>
                  <TableCell className={classes.columnAction} padding="none" />
                  <TableCell>
                    {devices[item.deviceId].name}
                  </TableCell>
                  {columns.map((key) => (
                    <TableCell key={key}>
                      <PositionValue
                        position={item}
                        property={item.hasOwnProperty(key) ? key : null}
                        attribute={item.hasOwnProperty(key) ? null : key}
                      />
                    </TableCell>
                  ))}
                </TableRow>
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
