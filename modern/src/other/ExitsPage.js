import {
  Button, Container, Snackbar, TextField,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SelectField from '../common/components/SelectField';
import { useChecador } from '../common/util/permissions';
import { confirmDialog } from '../common/util/utils';
import ExitsMenu from './ExitsMenu';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-evenly',
    '& > *': {
      flexBasis: '33%',
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

const timeStringToDate = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();

  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hours,
    minutes,
    0,
  );
};

const ExitsPage = () => {
  const t = useTranslation();
  const [schedule, setSchedule] = useState();
  const [device, setDevice] = useState();
  const [hour, setHour] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const checador = useChecador();
  const classes = useStyles();

  const darSalida = async () => {
    confirmDialog(() => {
      fetch('./api/salidas/crear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduleId: schedule, deviceId: device, date: hour }) })
        .then((response) => response.status)
        .then((status) => {
          if (status === 400) {
            setNotifications([{ id: 0, show: true, message: 'Ya existe una salida', snackBarDurationLongMs: 2000 }]);
          } else {
            setNotifications([{ id: 0, show: true, message: 'Salida creada', snackBarDurationLongMs: 2000 }]);
          }
        });
    });
  };

  const validate = () => schedule && device && hour;
  return (
    <PageLayout menu={<ExitsMenu />} breadcrumbs={['sharedExits']} allowBack={!checador}>
      <Container maxWidth="xl" className={classes.container}>
        <h1>Salidas</h1>
        <SelectField
          fullWidth
          value={schedule || 0}
          onChange={(event) => setSchedule(event.target.value)}
          endpoint="/api/itinerarios"
          label="Itinerario"
        />
        <br />
        <br />
        <SelectField
          fullWidth
          value={device || 0}
          onChange={(event) => setDevice(event.target.value)}
          endpoint="/api/devices"
          label="Unidad"
        />
        <br />
        <br />
        <TextField
          label={t('reportFrom')}
          type="time"
          value={moment(hour).local().locale('es').format(moment.HTML5_FMT.TIME)}
          onChange={(e) => {
            setHour(moment.utc(timeStringToDate(e.target.value)));
          }}
          fullWidth
        />
        <br />
        <br />

        <Button
          fullWidth
          type="button"
          color="primary"
          variant="contained"
          onClick={darSalida}
          disabled={!validate()}
        >
          Dar salida
        </Button>
      </Container>

      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={notification.snackBarDurationLongMs}
          onClose={() => setNotifications(notifications.filter((e) => e.id !== notification.id))}
        />
      ))}
    </PageLayout>
  );
};

export default ExitsPage;
