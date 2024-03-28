// const getDevice = (deviceId) => {
//   const request = new XMLHttpRequest();
//   request.open('GET', `/api/devices/${deviceId}`, false);
//   request.send();

//   if (request.status === 200) {
//     const data = JSON.parse(request.responseText);
//     return data;
//   }
//   return null;
// };
// const lastIndexOf = (array, key) => {
//   // eslint-disable-next-line no-plusplus
//   for (let i = array.length - 1; i >= 0; i--) {
//     if (array[i].data.deviceId === key) { return i; }
//   }
//   return -1;
// };
const requestCache = {};
const alarmTranslator = (alarm) => {
  switch (alarm.toUpperCase()) {
    case 'General'.toUpperCase():

      return 'General';

    case 'Sos'.toUpperCase():

      return 'SOS';

    case 'Vibration'.toUpperCase():

      return 'Vibración';

    case 'Movement'.toUpperCase():

      return 'En movimiento';

    case 'Lowspeed'.toUpperCase():

      return 'Baja velocidad';

    case 'Overspeed'.toUpperCase():

      return 'Exceso de velocidad';

    case 'FallDown'.toUpperCase():

      return 'Alarma';

    case 'LowPower'.toUpperCase():

      return 'Energia baja';

    case 'LowBattery'.toUpperCase():

      return 'Bateria baja';

    case 'Fault'.toUpperCase():

      return 'Alarma de fallo';

    case 'PowerOff'.toUpperCase():

      return 'Apagado';

    case 'PowerOn'.toUpperCase():

      return 'Encendido';

    case 'Door'.toUpperCase():

      return 'Puerta';

    case 'Lock'.toUpperCase():

      return 'Bloqueado';

    case 'Unlock'.toUpperCase():

      return 'Desbloqueado';

    case 'Geofence'.toUpperCase():

      return 'Geocerca';

    case 'GeofenceEnter'.toUpperCase():

      return 'I.';

    case 'GeofenceExit'.toUpperCase():

      return 'S.';

    case 'GpsAntennaCut'.toUpperCase():

      return 'Señal de antena del GPS perdida';

    case 'Accident'.toUpperCase():

      return 'Accidente';

    case 'Tow'.toUpperCase():

      return 'Remolque';

    case 'Idle'.toUpperCase():

      return 'Reposo';

    case 'HighRpm'.toUpperCase():

      return 'Revoluciones altas';

    case 'HardAcceleration'.toUpperCase():

      return 'Aceleración brusca';

    case 'HardBraking'.toUpperCase():

      return 'Frenado brusco';

    case 'HardCornering'.toUpperCase():

      return 'Giro brusco';

    case 'LaneChange'.toUpperCase():

      return 'Cambio de carril';

    case 'FatigueDriving'.toUpperCase():

      return 'Conduciendo con cansancio';

    case 'PowerCut'.toUpperCase():

      return 'Desconexión de bateria';

    case 'PowerRestored'.toUpperCase():

      return 'Fuente de poder restaurada';

    case 'Jamming'.toUpperCase():

      return 'Interferencia';

    case 'Temperature'.toUpperCase():

      return 'Temperatura';

    case 'alarmMaxTemp'.toUpperCase():

      return 'Limite de temperatura maxima';

    case 'alarmMinTemp'.toUpperCase():

      return 'Limite de temperatura minima';

    case 'Parking'.toUpperCase():

      return 'Se estaciono';

    case 'Shock'.toUpperCase():

      return 'Choque';

    case 'Bonnet'.toUpperCase():

      return 'Alarma';

    case 'FootBrake'.toUpperCase():

      return 'Freno de mano';

    case 'FuelLeak'.toUpperCase():

      return 'Perdida de combustible';

    case 'Tampering'.toUpperCase():

      return 'Manipulación';

    case 'Removing'.toUpperCase():

      return 'Removiendo';

    case 'BleeTagLowPower'.toUpperCase():

      return 'Energia baja';

    case 'BleeTagDriver'.toUpperCase():

      return 'Conductor';

    case 'BleeOpenDoor'.toUpperCase():

      return 'Puerta abierta';

    case 'BleeCloseDoor'.toUpperCase():

      return 'Puerta cerrada';

    case 'DeviceOnline'.toUpperCase():

      return 'Dispositivo en linea';

    case 'DeviceOffline'.toUpperCase():

      return 'Dispositivo fuera de linea';

    case 'ignitionOn'.toUpperCase():

      return 'Encendido';

    case 'ignitionOff'.toUpperCase():

      return 'Apagado';

    default: return '';
  }
};

const formatDateToCustomString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

window.getUser = () => JSON.parse(atob(localStorage.getItem(btoa('user'))));

window.findServerName = (ip) => ({
  '173.255.203.21': 'Alba',
  '198.58.114.237': 'AutoKapital',
  '45.56.69.178': 'Cancun',
  '45.33.23.6': 'Cemex',
  '69.164.203.19': 'Merida',
  '45.56.79.216': 'Order',
  '23.239.29.228': 'Evolucion',
  '45.56.126.173': 'Rastreo',
  '45.79.45.108': 'Pruebas',
  '23.239.25.71': 'Transporte',
  '45.56.66.144': 'Comit',
  '45.33.116.80': 'Combis',
}[ip] || ip);

export const formatDate = (date, template = 'dd-MM-yyyy HH:mm:ss') => {
  const replacements = {
    dd: String(date.getDate()).padStart(2, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    yyyy: date.getFullYear(),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
  };

  return template.replace(/dd|MM|yyyy|HH|mm|ss/g, (token) => replacements[token] || token);
};

const getEvent = () => {
  // const today = new Date();
  // const nextday = new Date();
  // nextday.setDate(nextday.getDate() + 1);
  // const request = new XMLHttpRequest();
  // request.open('GET', `${window.location.protocol}//${window.location.host}/api/reports/events?deviceId=${window.device.id}&from=${formatDateToCustomString(today)}T06%3A00%3A00.000Z&to=${formatDateToCustomString(nextday)}T05%3A59%3A59.999Z&type=allEvents`, false);
  // request.setRequestHeader('Accept', 'application/json');
  // request.send();

  // if (request.status === 200) {
  //   const data = JSON.parse(request.responseText);
  //   return data[data.length - 1];
  // }
  // return null;
  const today = new Date();
  const nextday = new Date();
  nextday.setDate(nextday.getDate() + 1);
  const url = `${window.location.protocol}//${window.location.host}/api/reports/events?deviceId=1&from=${formatDateToCustomString(today)}T06%3A00%3A00.000Z&to=${formatDateToCustomString(nextday)}T05%3A59%3A59.999Z&type=allEvents`;

  // Check if the response is cached and not older than 3 minutes
  if (requestCache[url] && Date.now() - requestCache[url].timestamp < 1 * 60 * 1000) {
    return requestCache[url].data;
  }

  // If not cached or expired, make the actual request and update the cache
  const request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.setRequestHeader('Accept', 'application/json');
  request.send();

  if (request.status === 200) {
    const data = JSON.parse(request.responseText);
    const value = data[data.length - 1];

    // Store the response in the cache along with the timestamp
    requestCache[url] = {
      data: value,
      timestamp: Date.now(),
    };
    return value;
  }
  return null;
};

export const specialAtts = (obj, attribute) => {
  switch (obj.protocol) {
    case 'ruptela':
      switch (attribute) {
        case 'ignition':
          return 'io409';
        case 'motion':
          return 'motion';
        case 'odometer':
          return 'io65';
        default:
          return attribute;
      }
    case 'teltonika':
      switch (attribute) {
        case 'bateria':
          return 'io113';
        default:
          return attribute;
      }
    case 'startek':
      switch (attribute) {
        case 'bateria':
          return 'bateriapercentage';
        default:
          return attribute;
      }
    default:
      return attribute;
  }
};
export const attsGetter = (obj, attribute) => {
  // obj has the form {att, att2, att..., data{data_att, data_att2, data_att..., attributes:{atribute...}}}
  // access att like obj.get('att'), data_att like obj.get('data').get('data_att')
  // const att  = specialAtts(obj, attribute);
  // console.log('switch '+att)
  switch (attribute) {
    case 'status': {
      const status = (obj.status ? obj.status : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : ''));
      return (status === 'online') ? 'online' : (status === 'offline') ? 'offline' : null;
    }
    case 'temperaturaC': {
      const temperature = attsGetter(obj, 'temperature');
      return temperature ? temperature.toFixed(1) : null;
    }
    case 'temperaturaF': {
      const temperature = attsGetter(obj, 'temperature');
      return temperature ? ((temperature * 1.8) + 32).toFixed(1) : null;
    }
    case 'temperature': {
      const temperature = attsGetter(obj, 'deviceTemp') ? attsGetter(obj, 'deviceTemp') : attsGetter(obj, 'temp1') ? attsGetter(obj, 'temp1') : attsGetter(obj, 'bleeTemperature') ? attsGetter(obj, 'bleeTemperature') : attsGetter(obj, 'temp2') ? attsGetter(obj, 'temp2') : null;
      return temperature;
    }
    case 'attribute.deviceTemp': {
      const temperature = attsGetter(obj, 'temp1') !== '' ? attsGetter(obj, 'temp1') : attsGetter(obj);
      return temperature;
    }
    case 'name':
      return `${window.device?.name || ''} ${window.device?.maker || ''} ${window.device?.model || ''} ${window.device?.year || ''}`;
    case 'ignition': {
      const motion = attsGetter(obj, 'motion');
      const value = (obj.ignition ? obj.ignition : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : (obj.attributes[`attribute.${attribute}`] ? obj.attributes[`attribute.${attribute}`] : null)));
      return value ? 'Si' : (motion === 'Si') ? 'Si' : 'No';
    }
    case 'io409': {
      const value = (obj.io409 ? obj.io409 : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : attsGetter(obj, 'ignition')));
      return (value === 'Si' || value === 'No') ? value : (value !== null && value !== undefined && value === 1) ? 'Si' : 'No';
    }
    case 'motion': {
      const value = (obj.motion ? obj.motion : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : (obj.attributes[specialAtts(obj, attribute)] !== undefined ? obj.attributes[specialAtts(obj, attribute)] : null)));
      return value ? 'Si' : 'No';
    }
    case 'io173': {
      const value = (obj.io173 ? obj.io173 : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : attsGetter(obj, 'motion')));
      return (value !== null && value === 1 && value !== undefined) ? 'Si' : 'No';
    }
    case 'fuel': {
      const value = (obj['attribute.fuel'] ? obj['attribute.fuel'] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return value;
    }
    case 'hours': {
      const value = (obj['attribute.hours'] ? obj['attribute.hours'] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      const hours = Math.floor(value / 3600000);
      const minutes = Math.floor((value % 3600000) / 60000);
      return value ? `${hours}H ${minutes}m` : null;
    }
    case 'totalDistance': {
      const value = (obj['attribute.totalDistance'] ? obj['attribute.totalDistance'] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return value;
    }
    case 'dateTime': {
      let value = attsGetter(obj, 'fixTime');
      const dt = new Date(value);
      value = dt.toLocaleString().replace(',', '');
      return value;
    }
    case 'fixTime': {
      let value = (obj.fixTime ? obj.fixTime : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      const dt = new Date(value);
      value = dt.toISOString();
      return value;
    }
    case 'speed': {
      const value = obj.speed ? obj.speed : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null);
      return `${Math.round(value * 1.85200)} Km/h`;
    }
    case 'rawspeed': {
      const value = (obj.rawspeed ? obj.rawspeed : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return (value || 0);
    }
    case 'address': {
      const value = (obj.address ? obj.address : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return value !== null ? value : "<a href='#' onclick='Ext.fireEvent(\"stategeocode\")' style='font-weight: bold; color:white;'>Click para ver</a>";
    }
    case 'bateria': {
      const bat = obj.attributes.batteryLevel ? obj.attributes.batteryLevel : obj.attributes.battery ? obj.attributes.battery : null;
      return bat !== null ? bat.toFixed(2) : null;
    }
    case 'bateriapercentage': {
      const bat = obj.attributes.batteryLevel ? obj.attributes.batteryLevel : obj.attributes.battery ? obj.attributes.battery : null;
      const calculatedValue = bat !== null ? ((Math.min(bat, 3.96) * 100) / 3.96).toFixed(2) : null;
      return calculatedValue;
    }
    case 'lastAlarm': {
      const event = getEvent();
      return alarmTranslator((event?.type || '').toUpperCase());
    }
    case 'policy': {
      return window.device?.policy || '';
    }
    case 'expiration': {
      return formatDateToCustomString(new Date(window.device?.insuranceExpiration || ''));
    }
    case 'lastUpdate': {
      return formatDate(new Date(window.device?.lastUpdate || ''), 'dd/MM/yyyy HH:mm:ss');
    }
    case 'phone': {
      return window.device?.phone || '';
    }
    case 'imei': {
      return window.device?.uniqueId || '';
    }
    case 'group': {
      return window.groupsNames?.[window.device?.groupId]?.name || 'Sin grupo';
    }
    case 'startTime': {
      let value = (obj.startTime ? obj.startTime : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      const dt = new Date(value);
      value = dt.toLocaleString().replace(',', '');
      return value;
    }
    case 'endTime': {
      let value = (obj.endTime ? obj.endTime : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      const dt = new Date(value);
      value = dt.toLocaleString().replace(',', '');
      return value;
    }
    case 'deviceName': {
      return (obj.deviceName || obj[attribute] || obj.attributes[attribute] || '');
    }
    default: {
      return (obj[attribute] ? obj[attribute] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
    }
  }
};
export const valueParser = (obj, value) => {
  if (!attsGetter(obj, value)) {
    return '';
  }
  // eslint-disable-next-line default-case
  switch (value) {
    case 'name':
      return `<h3><b>${attsGetter(obj, value)}</b></h3>`;
    case 'ignition':
      return `<b style="font-weight: bold;text-transform: uppercase;">Encendido:</b> ${attsGetter(obj, value)} `;
    case 'io409':
      return `<b style="font-weight: bold;text-transform: uppercase;">Encendido:</b> ${attsGetter(obj, value)} `;
    case 'motion':
      return `<b style="font-weight: bold;text-transform: uppercase;">Movimiento:</b> ${attsGetter(obj, value)} `;
    case 'io173':
      return `<b style="font-weight: bold;text-transform: uppercase;">Movimiento:</b> ${attsGetter(obj, value)} `;
    case 'dateTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Posición:</b> ${attsGetter(obj, value)} `;
    case 'fixTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Fecha:</b> ${attsGetter(obj, value)} `;
    case 'status':
      return `<b style="font-weight: bold;text-transform: uppercase;">Estado:</b> ${attsGetter(obj, value)} `;
    case 'speed':
      return `<b style="font-weight: bold;text-transform: uppercase;">⏲:</b> ${attsGetter(obj, value)} `;
    case 'address':
      return `<div id='pop-up-address'><b style='font-weight: bold;text-transform: uppercase;'>Dirección:</b> ${attsGetter(obj, 'address')}</div>`;
    case 'fuel':
      return `<b style="font-weight: bold;text-transform: uppercase;">Combustible:</b> ${attsGetter(obj, value)} `;
    case 'hours':
      return `<b style="font-weight: bold;text-transform: uppercase;">Horas:</b> ${attsGetter(obj, value)} `;
    case 'totalDistance':
      return `<b style="font-weight: bold;text-transform: uppercase;">Distancia total :</b> ${attsGetter(obj, value)} `;
    case 'temperaturaC':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °C:</b> ${attsGetter(obj, value)} `;
    case 'temperaturaF':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °F:</b> ${attsGetter(obj, value)} `;
    case 'temp2':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °C:</b> ${attsGetter(obj, value)} `;
    case 'bateria':
      return `<b style="font-weight: bold;text-transform: uppercase;">🔋:</b> ${attsGetter(obj, specialAtts(obj, value))}% `;
    case 'lastAlarm':
      return `<b style="font-weight: bold;text-transform: uppercase;">❗:</b> ${attsGetter(obj, value)} `;
    case 'protocol':
      return `<b style="font-weight: bold;text-transform: uppercase;">Protocolo:</b> ${attsGetter(obj, value)} `;
    case 'policy':
      return `<b style="font-weight: bold;text-transform: uppercase;">Poliza:</b> ${attsGetter(obj, value)} `;
    case 'expiration':
      return `<b style="font-weight: bold;text-transform: uppercase;">Expiración:</b> ${attsGetter(obj, value)} `;
    case 'lastUpdate':
      return `<b style="font-weight: bold;text-transform: uppercase;">Conexión:</b> ${attsGetter(obj, value)} `;
    case 'phone':
      return `<b style="font-weight: bold;text-transform: uppercase;">Telefono:</b> ${attsGetter(obj, value)} `;
    case 'imei':
      return `<b style="font-weight: bold;text-transform: uppercase;">IMEI:</b> ${attsGetter(obj, value)} `;
    case 'group':
      return `<b style="font-weight: bold;text-transform: uppercase;">Grupo:</b> ${attsGetter(obj, value)} `;
    case 'deviceName':
      return `<b style="font-weight: bold;text-transform: uppercase;">Nombre:</b> ${attsGetter(obj, value)} `;
    case 'startTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Hora inicial:</b> ${attsGetter(obj, value)} `;
    case 'endTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Hora final:</b> ${attsGetter(obj, value)} `;
  }
  return '';
};

export const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

export const hasPassedTime = (date, min) => Math.abs((date - new Date()) / 60000) > min;

export const generateArray = (size, start = 1) => Array.from({ length: size }, (_, i) => start + i);
