/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Print } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Modal,
  TextField,
} from '@mui/material';
import moment from 'moment';
import { makeStyles } from '@mui/styles';
import ReportFilter from './components/ReportFilter';
// import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { useCatch } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import scheduleReport from './common/scheduleReport';

const useStyles = makeStyles({
  disabledInput: {
    color: 'black', // Set your desired color
  },
});
// eslint-disable-next-line no-undef
const print = () => html2pdf(document.getElementById('printable'));
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

const calculateSumOfPunishments = (arr) => {
  let sumOfPunishments = 0;

  // Iterate through each object in the array
  arr.forEach((obj) => {
    // Check if the 'rows' array exists and is not empty
    if (obj.rows && obj.rows.length > 0) {
      // Iterate through each row in the 'rows' array
      obj.rows.forEach((row) => {
        // Check if 'excuse_going' is an empty string
        if (row.excuse_going === '') {
          // Add 'punishment_going' to the sum
          sumOfPunishments += row.punishment_going;
        }

        // Check if 'excuse_return' is an empty string
        if (row.excuse_return === '') {
          // Add 'punishment_return' to the sum
          sumOfPunishments += row.punishment_return;
        }
      });
    }
  });

  return sumOfPunishments;
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
};

const HojaSalidaReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  // const translator = useTranslation();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);
  const [rows, setRows] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [excuse, setExcuse] = useState('');
  const [ticket, setTicket] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitParams, setSubmitParams] = useState(null);

  const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, unify }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    query.append('unify', unify);
    setLoading(true);
    setRows([]);
    setSubmitParams({ deviceIds, groupIds, from, to, unify });
    await sleep(1);
    try {
      const response = await fetch(`/api/tickets/hoja?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const result = await response.json();
        let result2 = [...result];
        for (let index = 0; index < Math.round(Math.random() * 10); index += 1) {
          result2 = [...result2, { ...result[0], day: randomDate(new Date(from), new Date(to)) }];
        }

        const r = [];
        setReport(result2);
        result2.forEach((item, index) => {
          const maxItems = Math.max(item.going.length, item.return.length);

          for (let i = 0; i < maxItems; i += 1) {
            const vuelta = {
              item: index,
              rows: [],
              device: item.device,
              day: item.day,
              route: item.route,
            };
            const goingItem = item.going[i] || null;
            const returnItem = item.return[i] || null;

            const maxTickets = Math.max(goingItem.tickets.length, returnItem.tickets.length);
            for (let i = 0; i < maxTickets; i += 1) {
              const goingTicket = goingItem.tickets[i] || null;
              const returnTicket = returnItem.tickets[i] || null;
              const row = {};
              /* eslint-disable dot-notation */
              row['globalExcuse_going'] = '';
              row['expectedTime_going'] = '';
              row['punishment_going'] = '';
              row['tramo_going'] = '';
              row['salidaId_going'] = '';
              row['difference_going'] = '';
              row['id_going'] = '';
              row['geofenceId_going'] = '';
              row['enterTime_going'] = '';
              row['excuse_going'] = '';
              row['globalExcuse_return'] = '';
              row['expectedTime_return'] = '';
              row['punishment_return'] = '';
              row['tramo_return'] = '';
              row['salidaId_return'] = '';
              row['difference_return'] = '';
              row['id_return'] = '';
              row['geofenceId_return'] = '';
              row['enterTime_return'] = '';
              row['excuse_return'] = '';
              if (goingTicket) {
                row['globalExcuse_going'] = goingTicket.globalExcuse;
                row['expectedTime_going'] = goingTicket.expectedTime;
                row['punishment_going'] = goingTicket.punishment;
                row['tramo_going'] = goingTicket.tramo;
                row['salidaId_going'] = goingTicket.salidaId;
                row['difference_going'] = goingTicket.difference;
                row['id_going'] = goingTicket.id;
                row['geofenceId_going'] = goingTicket.geofenceId;
                row['enterTime_going'] = goingTicket.enterTime;
                row['excuse_going'] = goingTicket.excuse || '';
              }
              if (returnTicket) {
                row['globalExcuse_return'] = returnTicket.globalExcuse;
                row['expectedTime_return'] = returnTicket.expectedTime;
                row['punishment_return'] = returnTicket.punishment;
                row['tramo_return'] = returnTicket.tramo;
                row['salidaId_return'] = returnTicket.salidaId;
                row['difference_return'] = returnTicket.difference;
                row['id_return'] = returnTicket.id;
                row['geofenceId_return'] = returnTicket.geofenceId;
                row['enterTime_return'] = returnTicket.enterTime;
                row['excuse_return'] = returnTicket.excuse || '';
              }
              vuelta.rows.push(row);
            }
            r.push(vuelta);
          }
        });
        setRows(r);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
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

  const updateTicket = (ticket) => {
    fetch(`/api/tickets/${ticket.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    handleSubmit(submitParams);
  };

  useEffect(() => {
    fetch('/api/geofences')
      .then((response) => response.json())
      .then((data) => setGeofences(data));
  }, []);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportRoute']}>
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} showOnly forceDisabled={loading} />
          </div>
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90vh', // 100% of the viewport height
              }}
            >
              <CircularProgress />
            </div>

          ) : (
            report && report.length > 0 ? (
              <div id="printable" style={{ fontSize: 12 }}>
                <br />
                <Box
                  sx={{
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Align buttons to the extremes
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    padding: '8px', // Add padding for better appearance
                  }}
                >
                  <div />

                  <Button variant="text" style={{ color: 'black' }} onClick={print}>
                    <Print />
                  </Button>
                </Box>
                {report.map((item, reportIndex) => (
                  <>
                    <Divider flexItem style={{ background: 'black' }} />
                    <Box
                      sx={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between', // Align buttons to the extremes
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        padding: '8px', // Add padding for better appearance
                      }}
                    >
                      <div style={{ color: 'black', display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        <span style={{ fontWeight: 'bolder' }}>Fecha:</span>
                        &nbsp;
                        {moment(new Date(item.day)).format('dddd D [de] MMMM [de] YYYY') || moment(new Date()).format('dddd d de MMMM de YYYY')}
                        &nbsp;
                        <span style={{ fontWeight: 'bolder' }}>Unidad:</span>
                        &nbsp;
                        {item.device || 'Sin nombre'}
                        &nbsp;
                        <span style={{ fontWeight: 'bolder' }}>Ruta:</span>
                        &nbsp;
                        {item.route || 'Sin nombre'}
                        &nbsp;
                        <span style={{ fontWeight: 'bolder' }}>Operador:</span>
                        &nbsp;
                      </div>
                    </Box>
                    <Box
                      sx={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between', // Align buttons to the extremes
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        padding: '0px', // Add padding for better appearance
                      }}
                    >
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        IDA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        VUELTA
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center', // Center the content horizontally
                        border: '1px solid',
                        borderColor: 'divider', // black
                        borderRadius: 0,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        flex: 1, // Make the Box take the full width
                      }}
                    >
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        GEOCERCA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        PROGRAMADA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        REALIZADA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        DIFERENCIA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        CASTIGO
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        EXCUSA
                      </Button>
                      <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        GEOCERCA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        PROGRAMADA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        REALIZADA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        DIFERENCIA
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        CASTIGO
                      </Button>
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        EXCUSA
                      </Button>
                    </Box>
                    {/* lista de horas */}
                    {rows.filter((item) => item.item === reportIndex).map((item) => (
                      item.rows.map((row, rowIndex) => (

                        <Box
                          sx={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center', // Center the content horizontally
                            border: '1px solid',
                            borderColor: 'divider', // black
                            borderRadius: 0,
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                            flex: 1, // Make the Box take the full width
                          }}
                        >
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {geofences.find((geofence) => geofence.id === row.geofenceId_going).name || 'Sin nombre'}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {moment(new Date(row.expectedTime_going)).format('HH:mm:ss')}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {moment(new Date(row.enterTime_going)).format('HH:mm:ss')}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {row.difference_going}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {row.excuse_going !== '' ? (
                              <>
                                <span style={{ textDecoration: 'line-through' }}>{row.punishment_going}</span>
                                &nbsp;
                                <span>0</span>
                              </>
                            ) : row.punishment_going}
                          </Button>
                          <Button
                            key={row.id_going}
                            variant="text"
                            style={{ color: 'black', flex: 1, fontSize: 12 }}
                            onDoubleClick={() => {
                              setTicket(row.id_going);
                              setShowModal(true);
                            }}
                            disabled={rows.filter((item) => item.item === reportIndex).reduce((acc, obj) => acc + obj.rows.reduce((acc, obj) => acc + ((obj.excuse_going !== '' && obj.globalExcuse_going === false ? 1 : 0) + (obj.excuse_return !== '' && obj.globalExcuse_return === false ? 1 : 0)), 0), 0) >= 3}
                          >
                            {row.excuse_going || 'Sin excusa'}

                          </Button>

                          <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {geofences.find((geofence) => geofence.id === row.geofenceId_return)?.name || 'Sin nombre'}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {moment(new Date(row.expectedTime_return))?.format('HH:mm:ss') || 'Sin datos'}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {moment(new Date(row.enterTime_return))?.format('HH:mm:ss') || 'Sin datos'}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {row.difference_return}
                          </Button>
                          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                            {row.excuse_return !== '' ? (
                              <>
                                <span style={{ textDecoration: 'line-through' }}>{row.punishment_return}</span>
                                &nbsp;
                                <span>0</span>
                              </>
                            ) : row.punishment_return}
                          </Button>
                          <Button
                            key={row.id_return}
                            variant="text"
                            style={{ color: 'black', flex: 1, fontSize: 12 }}
                            onDoubleClick={() => {
                              setTicket(row.id_return);
                              setShowModal(true);
                            }}
                            disabled={rows.filter((item) => item.item === reportIndex).reduce((acc, obj) => acc + obj.rows.reduce((acc, obj) => acc + ((obj.excuse_going !== '' && obj.globalExcuse_going === false ? 1 : 0) + (obj.excuse_return !== '' && obj.globalExcuse_return === false ? 1 : 0)), 0), 0) >= 3}
                          >
                            {row.excuse_return || 'Sin excusa'}
                          </Button>
                        </Box>

                      ))
                    ))}
                    <Box
                      sx={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center', // Center the content horizontally
                        border: '1px solid',
                        borderColor: 'divider', // black
                        borderRadius: 0,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        flex: 1, // Make the Box take the full width
                      }}
                    >
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button />

                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 12 }}>
                        {`Subtotal: ${calculateSumOfPunishments(rows.filter((item) => item.item === reportIndex))}`}
                      </Button>
                    </Box>
                  </>
                ))}
              </div>
            ) : (
              // If sheet is empty, show nothing
              report && report.length === 0 ? (<h1>Sin datos</h1>) : (null)
            )

          )}
        </div>
      </div>
      <Modal
        open={showModal}
        onClose={(event) => {

        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField onChange={(event) => setExcuse(event.target.value)} />
          <Divider orientation="vertical" />
          <Button onClick={() => {
            updateTicket({ id: ticket, excuse, globalExcuse: false });
            setShowModal(false);
            setTicket(0);
            setExcuse('');
          }}
          >
            Guardar
          </Button>
        </Box>
      </Modal>

    </PageLayout>

  );
};

export default HojaSalidaReportPage;
