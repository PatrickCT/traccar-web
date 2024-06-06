/* eslint-disable import/no-extraneous-dependencies */

import {
  React, memo, useEffect, useState,
} from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
// import { useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { Moment } from 'react-moment';
import moment from 'moment';
import 'moment-timezone';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from '@mui/material';
import DropdownComponents from '../../common/components/DropdownComponent';
import { useEffectAsync } from '../../reactHelper';
import '../../common/tickets.css';
import { useTranslation } from '../../common/components/LocalizationProvider';

const isEqual = require('react-fast-compare');

window.isEqual = isEqual;

// const propPrint = (prop) => {
//   switch (typeof prop) {
//     case 'object': return JSON.stringify(prop);
//     case 'undefined': return 'NULL';
//     default: return prop;
//   }
// };

const TableExist = ({ deviceId, handleLoadInfo, topDirectory = '', btnChangeTime = true, dropDrivers = true }) => {
  const t = useTranslation();

  const [info, setInfo] = useState({});
  const [toDay, setDate] = useState(null);
  const [optionSelected, setOption] = useState(null);
  const [visible, setVisible] = useState(false);
  const [conductores, setConductores] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [subroutes, setSubroutes] = useState([]);
  const [hourSelected, setHour] = useState(dayjs(new Date().toISOString()));
  const [passwordUser, setPasswordUser] = useState('');
  const [loading, setLoading] = useState(false);
  const geofences = useSelector((state) => state.geofences.items);
  const subusers = useSelector((state) => state.session.subusers);
  // const user = useSelector((state) => state.session.user);
  const loadInfoTable = async () => {
    if (loading) return;
    setLoading(false);
    const response = await fetch(`${topDirectory}api/devices/${deviceId}/ticket`);
    if (response.ok) {
      const information = await response.json();
      setInfo(information);
      handleLoadInfo(information);
      setConductores((information.choferes ?? []).map((e) => {
        setOption(e.id);
        return ({
          label: e.name,
          value: e.id,
        });
      }));
      setTickets((information.ticket ?? []));
      setSubroutes((information.subroutes ?? []));
      setLoading(false);
    } else {
      setLoading(false);
      throw Error(await response.text());
    }
  };

  const handler = {
    get(target, key) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], handler);
      }
      return target[key];
    },
    set(target, prop, value) {
      const equal = isEqual(target[prop], value);
      // console.log(`changed ${prop} from ${propPrint(target[prop])} to ${propPrint(value)}`);
      if (!equal) {
        target[prop] = value;
        if (deviceId === target.id) {
          loadInfoTable();
        }
      }
      target.changed = !equal;
      return true;
    },
  };

  const handleChangePassword = (event) => {
    setPasswordUser(event.target.value);
  };

  const passwordEquals = () => [...subusers.map((item) => item.pass)].includes(passwordUser);

  useEffect(() => {
    setDate(moment().format('YYYY-MM-D'));
  }, [toDay]);

  useEffectAsync(async () => {
    await loadInfoTable();
  }, []);

  const handleSelectedOption = (value) => {
    setOption(value);
  };

  const handleChangeHour = (newHour) => {
    setHour(newHour);
  };

  const handleChangeTime = async () => {
    const response = await fetch(`api/salidas/${info.salida.id}/adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        time: moment(hourSelected.$d).utc().format('HH:mm'),
        pass: passwordUser,
      }),
    });
    if (response.ok) {
      setInfo({});
    } else {
      throw Error(await response.text());
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await loadInfoTable();
    }, 1 * 15 * 1000);

    return () => {
      clearInterval(intervalId);
    }; // Clear interval on component unmount
  }, []);

  const calcDiffColor = (ticket) => {
    let border = '#163b61';
    let backgroundColor = '#9dc5ff  ';

    if (ticket.enterTime === undefined || ticket.enterTime === null) {
      border = '#163b61';
      backgroundColor = '#9dc5ff';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= -3) {
      border = '#cc9c00';
      backgroundColor = '#ffe798';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= 0 && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > -3) {
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

  const footerContent = (
    <div>
      <Button
        label={t('sharedNo')}
        icon="pi pi-times"
        onClick={() => {
          setVisible(false);
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
    <div>
      {btnChangeTime && (info?.salida?.modifiedBy === 0 || info?.salida?.modifiedBy === null) && (
        <div className="btn-change">
          <Button label={t('changeExitTime')} icon="pi pi-external-link" onClick={() => setVisible(true)} />
        </div>
      )}
      {dropDrivers && (
        <DropdownComponents
          key={`dd-${deviceId}`}
          setOption={handleSelectedOption}
          selectOption={optionSelected}
          label=""
          options={conductores}
        />
      )}
      {/* <div className="checador">
        <div className="columns col1">
          {t('checker')}
          <br />
          <div className="nameChecker">{user.name}</div>
        </div>
        <div className="columns col2">
          {t('date')}
          <br />
          <div className="nameChecker">{toDay}</div>
        </div>
      </div> */}
      <div>
        <div className="nameChecker">
          Ruta:&nbsp;
          {subroutes.find((item) => item.id === info?.salida?.subrouteId)?.name || ''}
        </div>
      </div>
      <div className="headerExitst">
        <div className="columns headerCol1">
          {t('referencePoint')}
        </div>
        <div className="columns headerCol2">
          {t('arrives')}
          /
          {t('exits')}
        </div>
        <div className="columns headerCol3">
          #
        </div>
      </div>
      {tickets.map((ticket) => (

        <div style={calcDiffColor(ticket)} key={`t-${ticket.id}`} className="bodyExitst">
          <div className="columns bodyCol1">
            {geofences[ticket.geofenceId] !== undefined ? `${geofences[ticket.geofenceId].name}` : `${t('geofence')} - ${ticket.geofenceId}`}
          </div>
          <div className="columns bodyCol2">
            {('expectedTime' in ticket) ? `${t('expectedTime')}: ${moment(ticket.expectedTime).tz('America/Mexico_City').format('HH:mm:ss')}` : `${t('no-data')}`}
            <br />
            {('enterTime' in ticket) ? `${t('arrive')}: ${moment(ticket.enterTime).tz('America/Mexico_City').format('HH:mm:ss')}` : `${t('no-data')}`}
          </div>
          <div className="columns bodyCol3 strike " style={ticket.excuse != null ? { color: 'black', textDecoration: 'line-through' } : { color: 'black' }}>
            {('enterTime' in ticket) && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10)}
          </div>
        </div>
      ))}
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
    </div>
  );
};

export default memo(TableExist);
