/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */

import { CancelOutlined } from '@mui/icons-material';
import { Button, Toolbar, Typography } from '@mui/material';
import moment from 'moment';
import 'moment-timezone';
import {
  React, memo, useEffect, useState,
} from 'react';
import { useSelector } from 'react-redux';
// import DropdownComponents from '../../common/components/DropdownComponent';
import { useTranslation } from '../../common/components/LocalizationProvider';
import '../../common/tickets.css';
import { useAheadTimeThreshold } from '../../common/util/permissions';
import { confirmDialog, createBaseURL } from '../../common/util/utils';
// import TimeUpdateBtn from './TimeUpdateBtn';

import isEqual from 'react-fast-compare';

window.isEqual = isEqual;

const TableExist = ({ deviceId, deviceName = '' }) => {
  const t = useTranslation();

  const [info, setInfo] = useState({});
  const [toDay, setDate] = useState(null);
  // const [optionSelected, setOption] = useState(null);
  // const [conductores, setConductores] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [subroutes, setSubroutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const geofences = useSelector((state) => state.geofences.items);
  const aheadTimeThreshold = useAheadTimeThreshold();

  const loadInfoTable = async () => {
    if (loading) return;
    setLoading(false);
    const response = await fetch(`${createBaseURL()}/api/devices/${deviceId}/ticket`);
    if (response.ok) {
      const information = await response.json();
      setInfo(information);
      // setConductores((information.choferes ?? []).map((e) => {
      //   setOption(e.id);
      //   return ({
      //     label: e.name,
      //     value: e.id,
      //   });
      // }));
      setTickets((information.ticket ?? []));
      setSubroutes((information.subroutes ?? []));
      // if (setHasSalida) {
      //   setHasSalida((information.ticket ?? []).length > 0);
      // }
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

  useEffect(() => {
    setDate(moment().format('YYYY-MM-D'));
  }, [toDay]);

  // const handleSelectedOption = (value) => {
  //   setOption(value);
  // };

  useEffect(() => {
    async function load() {
      await loadInfoTable();
    }
    load();
    const intervalId = setInterval(async () => {
      await loadInfoTable();
    }, 1 * 15 * 1000);

    return () => {
      clearInterval(intervalId);
    }; // Clear interval on component unmount
  }, []);

  const calcDiffColor = (ticket) => {
    let border = '#163b61';
    let backgroundColor = '#9dc5ff';

    if (ticket.enterTime === undefined || ticket.enterTime === null) {
      border = '#163b61';
      backgroundColor = '#9dc5ff';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= -aheadTimeThreshold) {
      border = '#cc9c00';
      backgroundColor = '#ffe798';
    } else if (parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) <= 0 && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10) > -aheadTimeThreshold) {
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

  const cancelarSalida = (id) => {
    fetch(`${createBaseURL()}/api/salidas/cancel/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }).then((_) => loadInfoTable());
  };

  return (
    <div>
      <Toolbar>
        <Typography key={`toolb-${deviceId}`} variant="h6" component="div" sx={{ flexGrow: 1 }} color="white">
          {deviceName}
        </Typography>
        <Button
          sx={{ backgroundColor: 'white' }}
          variant="outlined"
          startIcon={<CancelOutlined />}
          onClick={(evt) => confirmDialog(() => cancelarSalida(info?.salida?.id))}
        >
          Cancelar salida
        </Button>
      </Toolbar>

      {/* {btnChangeTime && (info?.salida?.modifiedBy === 0 || info?.salida?.modifiedBy === null) && (
        <TimeUpdateBtn
          id={info.salida.id}
          subusers={subusers}
        />
      )}
      {dropDrivers && (
        <DropdownComponents
          key={`dd-${deviceId}`}
          setOption={handleSelectedOption}
          selectOption={optionSelected}
          label=""
          options={conductores}
        />
      )} */}

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
            {('enterTime' in ticket && ticket.enterTime) ? `${t('arrive')}: ${moment(ticket.enterTime).tz('America/Mexico_City').format('HH:mm:ss')}` : `${t('no-data')}`}
          </div>
          <div className="columns bodyCol3 strike " style={ticket.excuse != null ? { color: 'black', textDecoration: 'line-through' } : { color: 'black' }}>
            {('enterTime' in ticket) && parseInt((moment.duration(moment(ticket.enterTime).tz('America/Mexico_City').diff(moment(ticket.expectedTime).tz('America/Mexico_City')))).asMinutes(), 10)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(TableExist);
