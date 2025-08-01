/* eslint-disable no-unused-vars */
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment-timezone';
// import { Dialog } from 'primereact/dialog';
import { CancelOutlined, CheckOutlined } from '@mui/icons-material';
import {
  React, memo, useState,
} from 'react';
import { useTranslation } from '../../common/components/LocalizationProvider';
import TimePickerComponent from '../../common/components/TimePicker';
import { createBaseURL } from '../../common/util/utils';

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
    await fetch(`${createBaseURL()}/api/salidas/${id}/adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        time: moment(hourSelected._d).utc().format('HH:mm'),
        pass: passwordUser,
      }),
    });
  };

  const passwordEquals = () => [...subusers.map((item) => item.pass)].includes(passwordUser);

  const footerContent = (
    <div>
      <Button
        startIcon={<CancelOutlined />}
        onClick={() => {
          setVisible(false);
          setPasswordUser('');
        }}
        variant="outlined"
      >
        {t('sharedNo')}
      </Button>
      <Button
        autoFocus
        startIcon={<CheckOutlined />}
        onClick={() => {
          if (passwordEquals()) {
            setVisible(false);
            handleChangeTime();
            setPasswordUser('');
          }
        }}
        variant="outlined"
      >
        {t('sharedYes')}
      </Button>
    </div>
  );

  return (
    <>
      <div className="btn-change">
        <Button onClick={() => setVisible(true)} variant="outlined">
          {t('changeExitTime')}
        </Button>
      </div>
      <div className="card flex justify-content-center">
        <Dialog open={visible} onClose={() => setVisible(false)}>
          <DialogTitle>{t('changeExitTime')}</DialogTitle>
          <DialogContent>
            <TimePickerComponent hour={hourSelected} setHour={handleChangeHour} t={t} />
            <TextField type="password" className="passwordUser" style={{ height: '3rem', width: '100%' }} label="Contraseña" value={passwordUser} onChange={handleChangePassword} />
            {(passwordUser !== '' && !passwordEquals()) && <span style={{ color: 'red' }}>{t('password_wrong')}</span>}
          </DialogContent>
          <DialogActions>
            {(passwordEquals() && passwordUser !== '') ? footerContent : <div />}
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default memo(TimeUpdateBtn);
