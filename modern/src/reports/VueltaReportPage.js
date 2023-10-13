/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import ReportFilter from './components/ReportFilter';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { useCatch } from '../reactHelper';
import { map } from '../map/core/MapView';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import scheduleReport from './common/scheduleReport';
import {
  generateRoute, streetView,
} from '../common/util/mapPopup';
import { formatDate } from '../common/util/utils';

const VueltaReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();

  const devices = useSelector((state) => state.devices.items);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    if (type === 'export') {
      window.location.assign(`/api/reports/vueltas/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/vueltas/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/vueltas?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const itemst = await response.json();
          const groupedData = itemst.reduce((grouped, item) => {
            const { itinerarioId } = item;
            if (!grouped[itinerarioId]) {
              grouped[itinerarioId] = [];
            }
            grouped[itinerarioId].push(item);
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
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} includeGroups ignoreDevice />
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />

                <TableCell>Salida</TableCell>
                <TableCell>Dispositivo</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Asignada</TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {!loading ? Object.keys(groups).map((itinerario) => (
                // Create a row for each group
                <React.Fragment key={itinerario}>
                  <TableRow>
                    <TableCell colSpan={8}>{`Itinerario: ${itinerario}`}</TableCell>
                  </TableRow>
                  {groups[itinerario].map((item) => (
                    // Create rows for items within the group
                    item.data?.map((info, index) => (
                      <TableRow
                        key={`${itinerario}-${index}`}
                        style={{
                          backgroundColor: info.asignado ? '#9dc5ff' : 'inherit', // Default background color
                          ...(hoveredRowIndex === index
                            ? {
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Apply box-shadow on hover
                              transform: 'translateY(-5px)', // Move the row up on hover
                            }
                            : {}),
                          transition: 'box-shadow 0.3s ease, transform 0.3s ease', // Add smooth transitions
                        }}
                        onMouseEnter={() => setHoveredRowIndex(index)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
                      >
                        <TableCell className={classes.columnAction} padding="none" />
                        <TableCell>
                          {info.salida}
                        </TableCell>
                        <TableCell>
                          {devices[info.dispositivo]?.name}
                        </TableCell>

                        <TableCell>
                          {formatDate(new Date(info.hora), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          {info.asignado ? 'Si' : 'No'}
                        </TableCell>

                      </TableRow>
                    ))
                  ))}
                  <TableRow>
                    <TableCell>
                      <br />
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              )) : (
                <TableShimmer columns={4} startAction />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default VueltaReportPage;
