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
      return window.device?.name ?? '';
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
    case 'attribute.fuel': {
      const value = (obj['attribute.fuel'] ? obj['attribute.fuel'] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return value;
    }
    case 'attribute.hours': {
      const value = (obj['attribute.hours'] ? obj['attribute.hours'] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return value;
    }
    case 'attribute.totalDistance': {
      const value = (obj['attribute.totalDistance'] ? obj['attribute.totalDistance'] : (obj.attributes[attribute] !== undefined ? obj.attributes[attribute] : null));
      return value;
    }
    case 'dateTime': {
      let value = attsGetter(obj, 'fixTime');
      const dt = new Date(value);
      value = dt.toLocaleString();
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
    case 'lastAlarm': {
      const event = getEvent();
      return alarmTranslator((event?.type || '').toUpperCase());
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
      return `<b style="font-weight: bold;text-transform: uppercase;">Encendido:</b> ${attsGetter(obj, value)}<br>`;
    case 'io409':
      return `<b style="font-weight: bold;text-transform: uppercase;">Encendido:</b> ${attsGetter(obj, value)}<br>`;
    case 'motion':
      return `<b style="font-weight: bold;text-transform: uppercase;">Movimiento:</b> ${attsGetter(obj, value)}<br>`;
    case 'io173':
      return `<b style="font-weight: bold;text-transform: uppercase;">Movimiento:</b> ${attsGetter(obj, value)}<br>`;
    case 'dateTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Fecha:</b> ${attsGetter(obj, value)}<br>`;
    case 'fixTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Fecha:</b> ${attsGetter(obj, value)}<br>`;
    case 'status':
      return `<b style="font-weight: bold;text-transform: uppercase;">Estado:</b> ${attsGetter(obj, value)}<br>`;
    case 'speed':
      return `<b style="font-weight: bold;text-transform: uppercase;">Velocidad:</b> ${attsGetter(obj, value)}<br>`;
    case 'address':
      return `<div id='pop-up-address'><b style='font-weight: bold;text-transform: uppercase;'>Dirección:</b> ${attsGetter(obj, 'address')}</div>`;
    case 'fuel':
      return `<b style="font-weight: bold;text-transform: uppercase;">Combustible:</b> ${attsGetter(obj, value)}<br>`;
    case 'hours':
      return `<b style="font-weight: bold;text-transform: uppercase;">Horas:</b> ${attsGetter(obj, value)}<br>`;
    case 'totalDistance':
      return `<b style="font-weight: bold;text-transform: uppercase;">Distancia total :</b> ${attsGetter(obj, value)}<br>`;
    case 'temperaturaC':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °C:</b> ${attsGetter(obj, value)}<br>`;
    case 'temperaturaF':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °F:</b> ${attsGetter(obj, value)}<br>`;
    case 'temp2':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °C:</b> ${attsGetter(obj, value)}<br>`;
    case 'bateria':
      return `<b style="font-weight: bold;text-transform: uppercase;">Nivel de bateria:</b> ${attsGetter(obj, specialAtts(obj, value))}%<br>`;
    case 'lastAlarm':
      return `<b style="font-weight: bold;text-transform: uppercase;">Ultima alarma:</b> ${attsGetter(obj, value)}<br>`;
    case 'protocol':
      return `<b style="font-weight: bold;text-transform: uppercase;">Protocolo:</b> ${attsGetter(obj, value)}<br>`;
  }
  return '';
};

export const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);
