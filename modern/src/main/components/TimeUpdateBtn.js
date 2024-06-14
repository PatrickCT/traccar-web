import {
  React, useState,
} from 'react';
import 'moment-timezone';
import moment from 'moment';
import dayjs from 'dayjs';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from '@mui/material';
import '../../common/tickets.css';
import { useTranslation } from '../../common/components/LocalizationProvider';

const TimeUpdateBtn = ({
  id, subusers,
}) => {
  const t = useTranslation();
  const [visible, setVisible] = useState(false);
  const [hourSelected, setHour] = useState(dayjs(new Date().toISOString()));
  const [passwordUser, setPasswordUser] = useState('');

  const handleChangeHour = (newHour) => {
    setHour(newHour);
  };

  const handleChangePassword = (event) => {
    setPasswordUser(event.target.value);
  };

  const handleChangeTime = async () => {
    await fetch(`api/salidas/${id}/adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        time: moment(hourSelected.$d).utc().format('HH:mm'),
        pass: passwordUser,
      }),
    });
  };

  const passwordEquals = () => [...subusers.map((item) => item.pass)].includes(passwordUser);

  const footerContent = (
    <div>
      <Button
        label={t('sharedNo')}
        icon="pi pi-times"
        onClick={() => {

        }}
        className="p-button-text"
      />
      <Button
        label={t('sharedYes')}
        icon="pi pi-check"
        onClick={() => {
          if (passwordEquals()) {
            setVisible(false);
            handleChangeTime();
            setPasswordUser('');
          }
        }}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <div className="btn-change">
        <Button label={t('changeExitTime')} icon="pi pi-external-link" onClick={() => setVisible(true)} />
      </div>
      <div className="card flex justify-content-center">
        <Dialog header={t('changeExitTime')} visible={visible} style={{ width: '16.5vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw', '1500px': '35vm', '1200px': '50vm' }} onHide={() => setVisible(false)} footer={(passwordEquals() && passwordUser !== '') ? footerContent : <div />}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={[
                'DesktopTimePicker',
              ]}
            >
              <DemoItem label="">
                <TimePicker value={hourSelected} onChange={handleChangeHour} defaultValue="" ampm={false} className="picker" timeSteps={{ hours: 1, minutes: 1 }} />
              </DemoItem>
            </DemoContainer>
          </LocalizationProvider>
          <TextField type="password" className="passwordUser" style={{ height: '3rem', width: '100%' }} label="Contraseña" value={passwordUser} onChange={handleChangePassword} />
          {(passwordUser !== '' && !passwordEquals()) && <span style={{ color: 'red' }}>{t('password_wrong')}</span>}
        </Dialog>
      </div>
    </>
  );
};

export default TimeUpdateBtn;
