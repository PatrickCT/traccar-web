/* eslint-disable import/no-extraneous-dependencies */

import React, {
  Fragment, useCallback, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
// import { GpsFixed, LocationSearching } from '@mui/icons-material';
import { Popup } from 'maplibre-gl';
import ReportFilter from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePersistedState from '../common/util/usePersistedState';
import PositionValue from '../common/components/PositionValue';
import ColumnSelect from './components/ColumnSelect';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import MapView, { map } from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import useReportStyles from './common/useReportStyles';
// import TableShimmer from '../common/components/TableShimmer';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import scheduleReport from './common/scheduleReport';
import {
  createPopUpReportRoute, generateRoute, streetView,
} from '../common/util/mapPopup';

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

const RouteReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const virtuosoRef = useRef(null);

  const positionAttributes = usePositionAttributes(t);

  const devices = useSelector((state) => state.devices.items);

  const [columns, setColumns] = usePersistedState('routeColumns', []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const fontSize = 14;

  const onMapPointClick = useCallback((positionId) => {
    Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
    setSelectedItem(items.find((it) => it.id === positionId));
    new Popup()
      .setMaxWidth('400px')
      .setHTML(createPopUpReportRoute(items.find((it) => it.id === positionId)))
      .setLngLat([items.find((it) => it.id === positionId).longitude, items.find((it) => it.id === positionId).latitude])
      .addTo(map);
    window.position = items.find((it) => it.id === positionId);
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: items.findIndex((item) => item.id === positionId),
        align: 'start', // or 'center' or 'end'
        behavior: 'smooth', // or 'auto'
      });
    }
  }, [items, setSelectedItem]);

  const handleSubmit = useCatch(async ({ deviceIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    if (type === 'export') {
      window.location.assign(`/api/reports/route/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/route/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/route?${query.toString()}`, {
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

  const fixedHeaderContent = () => (
    <TableRow style={{ backgroundColor: 'white' }}>
      <TableCell>{t('sharedDevice')}</TableCell>
      {columns.map((key) => (<TableCell key={key}>{positionAttributes[key]?.name || key}</TableCell>))}
    </TableRow>
  );
  const showPU = (positionId) => {
    Array.from(document.getElementsByClassName('mapboxgl-popup')).map((item) => item.remove());
    setSelectedItem(items.find((it) => it.id === positionId));
    new Popup()
      .setMaxWidth('400px')
      .setHTML(createPopUpReportRoute(items.find((it) => it.id === positionId)))
      .setLngLat([items.find((it) => it.id === positionId).longitude, items.find((it) => it.id === positionId).latitude])
      .addTo(map);
    window.position = items.find((it) => it.id === positionId);
  };
  const rowContent = (_index, item) => (
    <>
      <TableCell onClick={() => showPU(item.id)} style={{ fontSize, lineHeight: '1', padding: '4px', backgroundColor: (selectedItem === item ? 'rgba(22, 59, 97, .7)' : 'transparent') }}>{devices[item.deviceId].name}</TableCell>
      {columns.map((key) => (
        <TableCell onClick={() => showPU(item.id)} style={{ fontSize, lineHeight: '1', padding: '4px', backgroundColor: (selectedItem === item ? 'rgba(22, 59, 97, .7)' : 'transparent') }} key={key}>
          <PositionValue
            position={item}
            property={item.hasOwnProperty(key) ? key : null}
            attribute={item.hasOwnProperty(key) ? null : key}
          />
        </TableCell>
      ))}
    </>
  );

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportRoute']}>
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {[...new Set(items.map((it) => it.deviceId))].map((deviceId) => {
                const positions = items.filter((position) => position.deviceId === deviceId);
                return (
                  <Fragment key={deviceId}>
                    <MapRoutePath positions={positions} />
                    <MapRoutePoints positions={positions} onClick={onMapPointClick} />
                  </Fragment>
                );
              })}
              <MapPositions positions={[selectedItem]} titleField="fixTime" />
            </MapView>
            <MapCamera positions={items} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} multiDevice>
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsObject={Object.fromEntries(
                  Object.entries(positionAttributes)
                    .filter(([key]) => ['speed', 'altitude', 'deviceTime', 'odometer', 'hours', 'fuel', 'fuelConsumption'].includes(key)),
                )}
              />
            </ReportFilter>
          </div>
          {!loading && (
            <Paper style={{ height: 300, width: '100%' }}>
              <TableVirtuoso
                ref={virtuosoRef}
                data={items}
                components={VirtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
              />
            </Paper>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default RouteReportPage;
