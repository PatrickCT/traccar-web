/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import {
  Alert,
  AlertTitle,
  Button, Container, Snackbar, TextField,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SelectField from '../common/components/SelectField';
import { useChecador } from '../common/util/permissions';
import { confirmDialog } from '../common/util/utils';
import { modalsActions } from '../store';
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

const ExitsPage = ({ showMenu = true }) => {
  const t = useTranslation();
  const dispatch = useDispatch();

  const [schedule, setSchedule] = useState();
  const [device, setDevice] = useState();
  const [hour, setHour] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupName2, setGroupName2] = useState('');
  const [group, setGroup] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const checador = useChecador();
  const classes = useStyles();

  const subroutesItems = useSelector((state) => state.subroutes.items);
  const schedulesItems = useSelector((state) => state.schedules.items);
  const groupsItems = useSelector((state) => state.groups.items);
  const devicesItems = useSelector((state) => state.devices.items);

  const subroutes = useMemo(
    () => Object.values(subroutesItems).filter((s) => s.groupId > 0),
    [subroutesItems],
  );

  const schedules = useMemo(
    () => Object.values(schedulesItems),
    [schedulesItems],
  );

  const groups = useMemo(
    () => Object.values(groupsItems),
    [groupsItems],
  );

  const devices = useMemo(
    () => Object.values(devicesItems),
    [devicesItems],
  );

  const darSalida = async () => {
    confirmDialog(() => {
      fetch(`./api/devices/${device}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...devices.find((d) => d.id === device), ...(group ? { groupId: group.id } : {}) }),
      }).then((_) => _);
      fetch('./api/salidas/crear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduleId: schedule, deviceId: device, date: hour }) })
        .then((response) => response.status)
        .then((status) => {
          if (status === 400) {
            setNotifications([{ id: 0, show: true, message: 'Ya existe una salida', snackBarDurationLongMs: 2000 }]);
          } else {
            setNotifications([{ id: 0, show: true, message: 'Salida creada', snackBarDurationLongMs: 2000 }]);
          }
        });

      setTimeout(() => dispatch(modalsActions.update({ showModalManualExits: false })), 0);
    });
  };

  const validate = () => schedule && device && hour;

  useEffect(() => {
    const _schedule = schedules.find((s) => s.id === schedule);
    const _subroute = subroutes.find((s) => s.id === _schedule?.subrouteId);
    const _group = groups.find((g) => g.id === _subroute?.groupId);
    const _device = devices.find((d) => d.id === device);

    if (_group && _device && _device.groupId !== _group.id) {
      const _group2 = groups.find((g) => g.id === _device.groupId);
      setGroupName(_group.name);
      setGroupName2(_group2?.name || 'NA');
      setGroup(_group);
      setShowInfo(true);
    } else {
      setShowInfo(false);
      setGroup(null);
    }
  }, [schedule, device]);

  return (
    <PageLayout menu={(showMenu === true) ? <ExitsMenu /> : null} breadcrumbs={['sharedExits']} allowBack={!checador}>
      <Container maxWidth="xl" className={classes.container}>
        <h1>Salidas</h1>
        <SelectField
          fullWidth
          value={schedule || 0}
          onChange={(event) => setSchedule(event.target.value)}
          label="Itinerario"
          endpoint="/api/itinerarios"
        />
        <br />
        <br />
        <SelectField
          fullWidth
          value={device || 0}
          onChange={(event) => setDevice(event.target.value)}
          label="Unidad"
          endpoint="/api/devices"
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
        {showInfo && (
          <>
            <Alert severity="info" variant="outlined">
              <AlertTitle>Información</AlertTitle>
              Esta unidad sera movida del grupo
              {' '}
              {groupName2}
              {' '}
              al grupo
              {' '}
              {groupName}
              {' '}
              para coincidir con el itinerario seleccionado
            </Alert>
            <br />
          </>
        )}

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
