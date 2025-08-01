/* eslint-disable logical-assignment-operators */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-string-refs */
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import TableShimmer from '../common/components/TableShimmer';
import '../common/tickets.css';
import {
  generateRoute, streetView,
} from '../common/util/mapPopup';
import { useAheadTimeThreshold } from '../common/util/permissions';
import { formatDate, isMobile } from '../common/util/utils';
import TableExitsReport from '../main/components/TableExitsReport';
import TimeUpdateBtn from '../main/components/TimeUpdateBtn';
import { map } from '../map/core/MapView';
import { useCatch } from '../reactHelper';
import scheduleReport from './common/scheduleReport';
import useReportStyles from './common/useReportStyles';
import ReportFilter from './components/ReportFilter';
import ReportsMenu from './components/ReportsMenu';

const TicketReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const tableBodyRef = useRef(null);

  const devices = useSelector((state) => state.devices.items);
  const subusers = useSelector((state) => state.session.subusers);
  const aheadTime = useAheadTimeThreshold();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validity, setValidity] = useState(0);

  const calcValidity = (tickets) => ((tickets.reduce((acc, obj) => acc + (obj.enterTime ? 1 : 0), 0) * 100) / tickets.length) >= validity;

  const handleDownload = (url) => {
    // Disable the button and set loading state to true
    setLoading(true);

    // URL of the file to download
    const downloadUrl = url;

    // Create a new XMLHttpRequest
    const xhr = new XMLHttpRequest();

    // Handle completion of the download
    xhr.addEventListener('load', () => {
      // Once the download is complete, enable the button and reset loading state
      setLoading(false);

      // Handle the downloaded data
      const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') });

      // Create a blob URL for the downloaded file
      const url = window.URL.createObjectURL(blob);

      // Create an anchor element for the download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'report.xlsx'; // Specify the desired file name
      document.body.appendChild(a);

      // Trigger a click event to start the download
      a.click();

      // Clean up by revoking the blob URL
      window.URL.revokeObjectURL(url);
    });

    // Handle any errors during the download
    xhr.addEventListener('error', () => {
      // Handle download error

      // Enable the button and reset loading state
      setLoading(false);
    });

    // Open the request and start the download
    xhr.open('GET', downloadUrl);
    xhr.responseType = 'blob'; // Set the response type to 'blob'
    xhr.send();
  };

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, type, unify }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    query.append('unify', unify);
    if (type === 'export') {
      handleDownload(`/api/reports/tickets/xlsx?${query.toString()}`);
      // window.location.assign(`/api/reports/tickets/xlsx?${query.toString()}`);
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

          const groupedData = itemst.reduce((acc, obj) => {
            acc[obj.salida] = acc[obj.salida] || { obj, ticket: [], s: obj.s, subroutes: [{ id: obj.s.subrouteId, groupId: obj.s.groupId, name: obj.subroute }] };
            acc[obj.salida].ticket.push(obj);
            return acc;
          }, {});

          // groupedData.sort((a, b) => new Date(b.fixedTime) - new Date(a.fixedTime));
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
      delete window.map;
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const tableBodyNode = tableBodyRef.current?.parentNode?.parentNode;
    if (tableBodyNode) {
      const handleScroll = (_) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            ticking = false;
          });

          ticking = true;
        }
      };

      tableBodyNode.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        tableBodyNode.removeEventListener('scroll', handleScroll, { passive: true });
      };
    }
    return () => null;
  }, [tableBodyRef]);

  const calcDiffColor = (ticket) => {
    let border = '#163b61';
    let backgroundColor = '#9dc5ff  ';

    if (ticket.enterTime === undefined || ticket.enterTime === null) {
      border = '#163b61';
      backgroundColor = '#9dc5ff';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= -aheadTime) {
      border = '#cc9c00';
      backgroundColor = '#ffe798';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= 0 && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > -aheadTime) {
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
            <ReportFilter
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
              multiDevice
              includeGroups
              unified
            >
              <FormControl style={{ width: '20vw' }}>
                <InputLabel>%</InputLabel>
                <Select
                  label="%"
                  value={validity}
                  onChange={(event) => setValidity(event.target.value)}
                >
                  <MenuItem key={`k-validity-${0}`} value={0}>-- Sin filtrar --</MenuItem>
                  <MenuItem key={`k-validity-${10}`} value={10}>10</MenuItem>
                  <MenuItem key={`k-validity-${20}`} value={20}>20</MenuItem>
                  <MenuItem key={`k-validity-${30}`} value={30}>30</MenuItem>
                  <MenuItem key={`k-validity-${40}`} value={40}>40</MenuItem>
                  <MenuItem key={`k-validity-${50}`} value={50}>50</MenuItem>
                  <MenuItem key={`k-validity-${60}`} value={60}>60</MenuItem>
                  <MenuItem key={`k-validity-${70}`} value={70}>70</MenuItem>
                  <MenuItem key={`k-validity-${80}`} value={80}>80</MenuItem>
                  <MenuItem key={`k-validity-${90}`} value={90}>90</MenuItem>
                  <MenuItem key={`k-validity-${100}`} value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </ReportFilter>
          </div>
          {(isMobile() === true) ? (
            !loading ? Object.keys(groups).filter((salida) => calcValidity(groups[salida].ticket)).map((salida) => (
              <>
                <div style={{ marginBottom: '2vh' }} />
                <TableExitsReport data={groups[salida]} />
                <div style={{ marginBottom: '5vh' }} />
              </>
            )) : (
              <div style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
              }}
              >
                <ClimbingBoxLoader
                  style={{
                    width: '50%',
                    height: '50%',
                    position: 'absolute',
                    top: '0%',
                    left: '30%',
                    margin: '-25px 0 0 -25px',
                  }}
                  color="#000000"
                  loading={loading}
                  cssOverride={{}}
                  size={10}
                  aria-label="Cargando información"
                  data-testid="loader"
                />
              </div>
            )
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.columnAction} />
                  <TableCell>{t('sharedDevice')}</TableCell>
                  <TableCell>{t('sharedGeofence')}</TableCell>
                  <TableCell>{t('groupParent')}</TableCell>
                  <TableCell>Hora programada</TableCell>
                  <TableCell>Hora de ingreso</TableCell>
                  <TableCell>Diferencia</TableCell>
                  <TableCell>Castigo</TableCell>
                </TableRow>
              </TableHead>

              <TableBody
                ref={tableBodyRef}
              >
                {!loading ? Object.keys(groups).filter((salida) => calcValidity(groups[salida].ticket)).map((salida) => (
                  // Create a row for each group
                  <React.Fragment key={salida}>
                    <TableRow>
                      <TableCell colSpan={2}>{`Salida: ${salida}`}</TableCell>
                      <TableCell colSpan={2}>
                        {`Salida generada el ${moment(groups[salida].s.date).locale('es').format('dddd D [de] MMMM [de] YYYY [a las] HH:mm:ss')}`}
                      </TableCell>
                      {(groups[salida].s?.modifiedBy > 0) ? (
                        <TableCell colSpan={3}>
                          {`La hora fue modificada por el sub-usuario: ${groups[salida].s.modifiedBy} - ${subusers.find((su) => su.id === groups[salida].s.modifiedBy)?.name} el dia: ${new Date(groups[salida].s.modifiedWhen).toLocaleString()}`}
                        </TableCell>
                      ) : <TableCell colSpan={3} />}
                      <TableCell colSpan={3}>
                        {(groups[salida]?.s?.modifiedBy === 0 || groups[salida]?.s?.modifiedBy === null) && (
                          <TimeUpdateBtn
                            id={salida}
                            subusers={subusers}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    {groups[salida].ticket.map((item) => (
                      // Create rows for items within the group
                      <TableRow style={calcDiffColor(item)} key={item.id}>
                        <TableCell className={classes.columnAction} padding="none" />
                        <TableCell>
                          {devices[item.device]?.name}
                        </TableCell>
                        <TableCell>
                          {item.geofence}
                        </TableCell>
                        <TableCell>
                          {item.group}
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
                          {item.difference > 0 ? item.punishment : 0}
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
                  <TableShimmer columns={9} startAction />
                )}
              </TableBody>
            </Table>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default TicketReportPage;
