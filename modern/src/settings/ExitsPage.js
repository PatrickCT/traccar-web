import React, { useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import dayjs from 'dayjs';
import moment from 'moment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { useTranslation } from '../common/components/LocalizationProvider';

const ExitsPage = () => {
  const t = useTranslation();
  const [schedule, setSchedule] = useState();
  const [device, setDevice] = useState();
  const [hour, setHour] = useState(dayjs(new Date()));
  const [notifications, setNotifications] = useState([]);

  const darSalida = async () => {
    fetch('../api/salidas/crear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduleId: schedule, deviceId: device, date: hour.toDate() }) })
      .then((response) => response.status)
      .then((status) => {
        if (status === 400) {
          setNotifications([{ id: 0, show: true, message: 'Ya existe una salida', snackBarDurationLongMs: 2000 }]);
        } else {
          setNotifications([{ id: 0, show: true, message: 'Salida creada', snackBarDurationLongMs: 2000 }]);
        }
      });
  };

  const validate = () => schedule && device && hour;
  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedExits']}>
      <h1>Salidas</h1>
      <SelectField
        value={schedule || 0}
        onChange={(event) => setSchedule(event.target.value)}
        endpoint="/api/itinerarios"
        label="Itinerario"
      />
      <br />
      <SelectField
        value={device || 0}
        onChange={(event) => setDevice(event.target.value)}
        endpoint="/api/devices"
        label="Unidad"
      />
      <br />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['TimePicker', 'TimePicker']}>
          <DemoItem>
            <TimePicker
              label={t('reportStartTime')}
              value={dayjs(hour)}
              onChange={(newValue) => {
                setHour(moment.utc(newValue.toDate()));
              }}
            />
          </DemoItem>
        </DemoContainer>
      </LocalizationProvider>
      <br />
      <Button
        type="button"
        color="primary"
        variant="contained"
        onClick={darSalida}
        disabled={!validate()}
      >
        Dar salida
      </Button>

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
