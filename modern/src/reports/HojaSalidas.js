import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Print } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress, Divider, TextField,
} from '@mui/material';
// import moment from 'moment';
import ReportFilter from './components/ReportFilter';
// import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { useCatch } from '../reactHelper';
import { map } from '../map/core/MapView';
import useReportStyles from './common/useReportStyles';
import scheduleReport from './common/scheduleReport';
import {
  generateRoute, streetView,
} from '../common/util/mapPopup';
import { formatDate } from '../common/util/utils';
// eslint-disable-next-line no-undef
const print = () => html2pdf(document.getElementById('printable'));
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

const HojaSalidaReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  // const t = useTranslation();

  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState({});

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
      await sleep(1);
      try {
        const response = await fetch(`/api/tickets/hoja?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          setSheet(await response.json());
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
            sheet && sheet.deviceId > 0 ? (
              <div id="printable">
                <br />
                <Divider flexItem style={{ background: 'black' }} />
                <Box
                  sx={{
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
                  <Button variant="text" disabled style={{ color: 'black' }}>
                    Dispositivo:
                    {' '}
                    {sheet.device || 'No name'}
                  </Button>
                  <Button variant="text" style={{ color: 'black' }} onClick={print}>
                    <Print />
                  </Button>
                </Box>
                <Divider flexItem style={{ background: 'black' }} />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Center the content horizontally
                    border: '1px solid',
                    borderColor: 'black',
                    borderRadius: 0,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    flex: 1, // Make the Box take the full width
                  }}
                >
                  <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                    IDA
                  </Button>
                  <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                  <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                    VUELTA
                  </Button>
                </Box>
                {/* tabla horas */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Center the content horizontally
                    border: '1px solid',
                    borderColor: 'black',
                    borderRadius: 0,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    flex: 1, // Make the Box take the full width
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the content horizontally
                      border: '1px solid',
                      borderColor: 'black',
                      borderRadius: 0,
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      flex: 1, // Make the Box take the full width
                    }}
                  >
                    <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                      ESPERADA
                    </Button>
                    <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                    <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                      REALIZADA
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the content horizontally
                      border: '1px solid',
                      borderColor: 'black',
                      borderRadius: 0,
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      flex: 1, // Make the Box take the full width
                    }}
                  >
                    <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                      ESPERADA
                    </Button>
                    <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                    <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                      REALIZADA
                    </Button>
                  </Box>
                </Box>
                {/* lista de horas */}
                {sheet.hours.map((hora) => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the content horizontally
                      border: '1px solid',
                      borderColor: 'black',
                      borderRadius: 0,
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      flex: 1, // Make the Box take the full width
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center', // Center the content horizontally
                        border: '1px solid',
                        borderColor: 'black',
                        borderRadius: 0,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        flex: 1, // Make the Box take the full width
                      }}
                    >
                      <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                        {hora.forward.expected ? formatDate(new Date(hora.forward.expected), 'yyyy-MM-dd HH:mm:ss') : 'Sin datos'}
                      </Button>
                      <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                        {hora.forward.difference ? hora.forward.difference : 'Sin datos'}
                      </Button>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center', // Center the content horizontally
                        border: '1px solid',
                        borderColor: 'black',
                        borderRadius: 0,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        flex: 1, // Make the Box take the full width
                      }}
                    >
                      <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                        {hora.backward.expected ? formatDate(new Date(hora.backward.expected), 'yyyy-MM-dd HH:mm:ss') : 'Sin datos'}
                      </Button>
                      <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
                      <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                        {hora.backward.difference ? hora.backward.difference : 'Sin datos'}
                      </Button>
                    </Box>
                  </Box>
                ))}
                {/* anotaciones */}
                <br />
                <Button variant="text" disabled style={{ color: 'black', flex: 1 }}>
                  Anotaciones:
                </Button>
                <TextField multiline fullWidth />
                <br />
                <Divider orientation="vertical" variant="middle" flexItem style={{ background: 'black' }} />
              </div>
            ) : (
              // If sheet is empty, show nothing
              sheet && sheet.deviceId ? (<h1>Sin datos</h1>) : (null)
            )

          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default HojaSalidaReportPage;
