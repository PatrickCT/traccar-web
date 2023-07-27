import { React, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
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
import DropdownComponents from '../../common/components/DropdownComponent';
import { useEffectAsync } from '../../reactHelper';
import '../../common/tickets.css';
import { useTranslation } from '../../common/components/LocalizationProvider';

const TableExist = ({ deviceId, handleLoadInfo }) => {
  const t = useTranslation();

  const [info, setInfo] = useState({});
  const [toDay, setDate] = useState(null);
  const [optionSelected, setOption] = useState(null);
  const [visible, setVisible] = useState(false);
  const [conductores, setConductores] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [, setGeonames] = useState([]);
  const [hourSelected, setHour] = useState(dayjs('2022-04-17T15:30'));

  const user = useSelector((state) => state.session.user);

  useEffect(() => {
    setDate(moment().format('YYYY-MM-D'));
  }, [toDay]);

  useEffectAsync(async () => {
    const response = await fetch(`api/devices/${deviceId}/ticket`);
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
      setGeonames((information.geofencesNames ?? []));
    } else {
      throw Error(await response.text());
    }
  }, [info.vueltas]);

  const handleSelectedOption = (value) => {
    setOption(value);
  };

  const handleChangeHour = (newHour) => {
    setHour(newHour);
  };

  const handleChangeTime = async () => {
    // const timeZone = moment(tickets[0].expectedTime).format('Z');
    // let hour = hourSelected;
    // console.log(hour);
    // console.log(tickets[0].expectedTime);
    // console.log(tickets[0].enterTime);
    // console.log(timeZone);
    // if (timeZone.includes('-')) {
    //   hour = dayjs(hour).subtract(parseInt(timeZone.replace('-', '').split(':')[0], 10), 'hours');
    // } else {
    //   hour = dayjs(hour).add(parseInt(timeZone.replace('+', '').split(':')[0], 10), 'hours');
    // }
    // console.log(hour);
    const response = await fetch(`api/salidas/${info.salida.id}/adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        time: moment(hourSelected.$d).format('HH:mm'),
      }),
    });
    if (response.ok) {
      setInfo({});
    } else {
      throw Error(await response.text());
    }
  };

  const footerContent = (
    <div>
      <Button
        label="No"
        icon="pi pi-times"
        onClick={() => {
          setVisible(false);
        }}
        className="p-button-text"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        onClick={() => {
          setVisible(false);
          handleChangeTime();
        }}
        autoFocus
      />
    </div>
  );

  return (
    <div>
      <div className="btn-change">
        <Button label={t('changeExitTime')} icon="pi pi-external-link" onClick={() => setVisible(true)} />
      </div>
      <DropdownComponents
        setOption={handleSelectedOption}
        selectOption={optionSelected}
        label=""
        options={conductores}
      />
      <div className="checador">
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
        <div className="bodyExitst">
          <div className="columns bodyCol1">
            {`${t('geofence')} - ${ticket.geofeceId}`}
          </div>
          <div className="columns bodyCol2">
            {('expectedTime' in ticket) ? `${t('expectedTime')}: ${moment(ticket.expectedTime).tz('America/Mexico_City').format('HH:mm:ss')}` : `${t('no-data')}`}
            <br />
            {('enterTime' in ticket) ? `${t('arrive')}: ${moment(ticket.enterTime).tz('America/Mexico_City').format('HH:mm:ss')}` : `${t('no-data')}`}
          </div>
          <div className="columns bodyCol3" style={parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > 0 ? { color: 'red' } : parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= 0 && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > -3 ? { color: 'green' } : { color: 'orange' }}>
            {('enterTime' in ticket) && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10)}
          </div>
        </div>
      ))}
      <div className="card flex justify-content-center">
        <Dialog header={t('changeExitTime')} visible={visible} style={{ width: '16.5vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw', '1500px': '35vm', '1200px': '50vm' }} onHide={() => setVisible(false)} footer={footerContent}>
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
        </Dialog>
      </div>
    </div>
  );
};

export default TableExist;
