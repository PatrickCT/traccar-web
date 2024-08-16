/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */

import {
  React, memo, useEffect, useState,
} from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import { useEffectAsync } from '../../reactHelper';
import '../../common/tickets.css';
import { useTranslation } from '../../common/components/LocalizationProvider';

const TableExistReport = ({ data }) => {
  const t = useTranslation();

  const [info, setInfo] = useState(data);
  const [toDay, setDate] = useState(null);
  const [tickets, setTickets] = useState([]);
  const devices = useSelector((state) => state.devices.items);

  const loadInfoTable = async () => {
    setTickets((info.ticket ?? []));
  };

  useEffect(() => {
    setDate(moment().format('YYYY-MM-D'));
  }, [toDay]);

  useEffectAsync(async () => {
    await loadInfoTable();
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

  return (
    <div>
      <div>
        <div className="nameChecker">
          {devices[info.obj.device].name}
          &nbsp;|&nbsp;
          Ruta:&nbsp;
          {info.subroutes[0].name}
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
            {ticket.geofence !== null ? `${ticket.geofence}` : `${t('geofence')} - ${ticket.s.geofenceId}`}
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
    </div>
  );
};

export default memo(TableExistReport);
