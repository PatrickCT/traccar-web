/* eslint-disable func-names */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-use-before-define */
/* eslint-disable dot-notation */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-eval */

import { distanceFromMeters } from './converter';

/* eslint-disable no-bitwise */
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

window.getUser = () => JSON.parse(atob(localStorage.getItem(btoa('user')) || 'e30='));

window.updatePushId = (pushId) => {
  let user = window.getUser();
  fetch(`${window.createBaseURL()}/api/users/${user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...user,
      pushId,
    }),
  });
};

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

export const attConverter = (obj, attribute) => {
  switch (attribute) {
    case 'status': {
      const value = attVariantsEvaluator(obj, attribute);
      return { online: 'En linea', offline: 'Fuera de linea', unknown: 'Desconocido' }[value] || null;
    }
    case 'temperaturaC': {
      const value = attVariantsEvaluator(obj, 'temperature');
      return value ? (obj.protocol === 'teltonika' ? (value * 10) : value).toFixed(1) : null;
    }
    case 'temperaturaF': {
      const value = attVariantsEvaluator(obj, 'temperature');
      return value ? ((value * 1.8) + 32).toFixed(1) : null;
    }
    case 'name': {
      return window.device?.name || window.deviceName || window.devices[obj.deviceId]?.name || null;
    }
    case 'ignition': {
      const motion = attConverter(obj, 'motion');
      const value = attVariantsEvaluator(obj, attribute);
      return (value != null ? (value ? 'Si' : 'No') : null) || motion || null;
    }
    case 'motion': {
      const value = attVariantsEvaluator(obj, attribute);
      return (value != null ? (value ? 'Si' : 'No') : null) || null;
    }
    case 'fuel': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'hours': {
      const value = attVariantsEvaluator(obj, attribute);
      return `${Math.floor(value / 3600000)}H ${Math.floor((value % 3600000) / 60000)}m` || null;
    }
    case 'totalDistance': {
      const value = attVariantsEvaluator(obj, attribute);
      return `${distanceFromMeters(value).toFixed(2)} Km` || null;
    }
    case 'dateTime': {
      const value = attVariantsEvaluator(obj, 'fixTime');
      return value ? formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') : null;
    }
    case 'fixTime': {
      const value = attVariantsEvaluator(obj, attribute);
      return value ? formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') : null;
    }
    case 'serverTime': {
      const value = attVariantsEvaluator(obj, attribute);
      return value ? formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') : null;
    }
    case 'deviceTime': {
      const value = attVariantsEvaluator(obj, attribute);
      return value ? formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') : null;
    }
    case 'speed': {
      const value = attVariantsEvaluator(obj, attribute);
      return `${Math.round(value * 1.85200)} Km/h` || null;
    }
    case 'rawspeed': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'bateria': {
      const value = attVariantsEvaluator(obj, attribute);
      return value?.toFixed(2) || null;
    }
    case 'bateriapercentage': {
      const value = attVariantsEvaluator(obj, 'bateria');
      return ((Math.min(value ?? 0, 3.96) * 100) / 3.96).toFixed(2) || null;
    }
    case 'lastAlarm': {
      const user = window.getUser() || {};
      const event = user.id ? getEvent() : {};
      return alarmTranslator((event?.type || '').toUpperCase());
    }
    case 'policy': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'expiration': {
      const value = attVariantsEvaluator(obj, attribute);
      return formatDate(new Date(value), 'yyyy-MM-dd', 'es-MX') || null;
    }
    case 'lastUpdate': {
      const value = attVariantsEvaluator(obj, attribute);
      return formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') || null;
    }
    case 'phone': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'imei': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'groupName': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'startTime': {
      const value = attVariantsEvaluator(obj, attribute);
      return formatDate(new Date(value), 'yyyy-MM-dd', 'es-MX') || null;
    }
    case 'endTime': {
      const value = attVariantsEvaluator(obj, attribute);
      return formatDate(new Date(value), 'yyyy-MM-dd', 'es-MX') || null;
    }
    case 'deviceName': {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
    case 'alarm': {
      const value = attVariantsEvaluator(obj, attribute);
      return alarmTranslator(value) || null;
    }
    case 'simType': {
      const value = { 1: 'PT', 2: 'RT', 3: 'Ox' }[obj.simType];
      return value || null;
    }
    case 'simKey': {
      const value = obj.simKey;
      return value || null;
    }
    case 'duration': {
      const value = attVariantsEvaluator(obj, attribute);
      // return `${Math.floor(value / 3600000)}H ${Math.floor((value % 3600000) / 60000)}m` || null;
      return dateDifference(new Date(), new Date().setDate(), ['hours', 'minutes'], value) || null;
    }
    default: {
      const value = attVariantsEvaluator(obj, attribute);
      return value || null;
    }
  }
};

let attVariantsEvaluator = (obj, attribute) => attsGetter(obj, attVariants(attribute).find((key) => attsGetter(obj, key) != null)) ?? null;

let attVariants = (att) => {
  switch (att) {
    case 'temperature': return ['deviceTemp', 'temp1', 'bleeTemperature', 'temp2', 'bleTemp2'];
    case 'motion': return ['motion', 'io173'];
    case 'group': return ['group', 'groupName'];
    case 'imei': return ['uniqueId'];
    default: return [att];
  }
};

export const attsGetter = (obj, attribute) => (obj[specialAtts(obj, attribute)] ?? obj['attributes']?.[specialAtts(obj, attribute)] ?? obj[`attributes.${specialAtts(obj, attribute)}`] ?? obj[`attribute.${specialAtts(obj, attribute)}`] ?? null) ?? (obj[specialAtts(obj, attribute)] || obj['attributes']?.[specialAtts(obj, attribute)] || obj[`attributes.${specialAtts(obj, attribute)}`] || obj[`attribute.${specialAtts(obj, attribute)}`] || null);

export const specialAtts = (obj, attribute) => {
  switch (obj.protocol || '') {
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

export const valueParser = (obj, value) => {
  if (!attConverter(obj, value)) {
    return '';
  }
  // eslint-disable-next-line default-case
  switch (value) {
    case 'name':
      return `<h3><b>${attConverter(obj, value)}</b></h3>`;
    case 'ignition':
      return `<b style="font-weight: bold;text-transform: uppercase;">Encendido:</b> ${attConverter(obj, value)} `;
    case 'io409':
      return `<b style="font-weight: bold;text-transform: uppercase;">Encendido:</b> ${attConverter(obj, value)} `;
    case 'motion':
      return `<b style="font-weight: bold;text-transform: uppercase;">Movimiento:</b> ${attConverter(obj, value)} `;
    case 'io173':
      return `<b style="font-weight: bold;text-transform: uppercase;">Movimiento:</b> ${attConverter(obj, value)} `;
    case 'dateTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Posición:</b> ${attConverter(obj, value)} `;
    case 'fixTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Fecha:</b> ${attConverter(obj, value)} `;
    case 'status':
      return `<b style="font-weight: bold;text-transform: uppercase;">Estado:</b> ${attConverter(obj, value)} `;
    case 'speed':
      return `<b style="font-weight: bold;text-transform: uppercase;">⏲:</b> ${attConverter(obj, value)} `;
    case 'address':
      return `<div id='pop-up-address'><b style='font-weight: bold;text-transform: uppercase;'>Dirección:</b> ${attConverter(obj, 'address')}</div>`;
    case 'fuel':
      return `<b style="font-weight: bold;text-transform: uppercase;">Combustible:</b> ${attConverter(obj, value)} `;
    case 'hours':
      return `<b style="font-weight: bold;text-transform: uppercase;">Horas:</b> ${attConverter(obj, value)} `;
    case 'totalDistance':
      return `<b style="font-weight: bold;text-transform: uppercase;">Distancia total :</b> ${attConverter(obj, value)} `;
    case 'temperaturaC':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °C:</b> ${attConverter(obj, value)} `;
    case 'temperaturaF':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °F:</b> ${attConverter(obj, value)} `;
    case 'temp2':
      return `<b style="font-weight: bold;text-transform: uppercase;">Temperatura °C:</b> ${attConverter(obj, value)} `;
    case 'bateria':
      return `<b style="font-weight: bold;text-transform: uppercase;">🔋:</b> ${attConverter(obj, value)}% `;
    case 'lastAlarm':
      return `<b style="font-weight: bold;text-transform: uppercase;">❗:</b> ${attConverter(obj, value)} `;
    case 'protocol':
      return `<b style="font-weight: bold;text-transform: uppercase;">Protocolo:</b> ${attConverter(obj, value)} `;
    case 'policy':
      return `<b style="font-weight: bold;text-transform: uppercase;">Poliza:</b> ${attConverter(obj, value)} `;
    case 'expiration':
      return `<b style="font-weight: bold;text-transform: uppercase;">Expiración:</b> ${attConverter(obj, value)} `;
    case 'lastUpdate':
      return `<b style="font-weight: bold;text-transform: uppercase;">Conexión:</b> ${attConverter(obj, value)} `;
    case 'phone':
      return `<b style="font-weight: bold;text-transform: uppercase;">Telefono:</b> ${attConverter(obj, value)} `;
    case 'imei':
      return `<b style="font-weight: bold;text-transform: uppercase;">IMEI:</b> ${attConverter(obj, value)} `;
    case 'group':
      return `<b style="font-weight: bold;text-transform: uppercase;">Grupo:</b> ${attConverter(obj, value)} `;
    case 'deviceName':
      return `<b style="font-weight: bold;text-transform: uppercase;">Nombre:</b> ${attConverter(obj, value)} `;
    case 'startTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Hora inicial:</b> ${attConverter(obj, value)} `;
    case 'endTime':
      return `<b style="font-weight: bold;text-transform: uppercase;">Hora final:</b> ${attConverter(obj, value)} `;
    case 'duration':
      return `<b style="font-weight: bold;text-transform: uppercase;">Duración:</b> ${attConverter(obj, value)} `;
    case 'simType':
      return `<b style="font-weight: bold;text-transform: uppercase;">Tipo de sim:</b> ${attConverter(obj, value)} `;
    case 'simKey':
      return `<b style="font-weight: bold;text-transform: uppercase;">Clave de sim:</b> ${attConverter(obj, value)} `;
    case 'latitude':
      return `<b style="font-weight: bold;text-transform: uppercase;">Latitud:</b> ${attConverter(obj, value)} `;
    case 'longitude':
      return `<b style="font-weight: bold;text-transform: uppercase;">Longitud:</b> ${attConverter(obj, value)} `;
  }
  return '';
};

export const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

export const hasPassedTime = (date, min) => Math.abs((date - new Date()) / 60000) > min;

export const generateArray = (size, start = 1) => Array.from({ length: size }, (_, i) => start + i);

export const showCoberturaMap = () => {
  window.jsPanel.create({
    theme: '#011842 filled',
    headerTitle: 'Cobertura',
    contentSize: {
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8,
    },
    contentOverflow: 'hidden',
    content: `<iframe src="./cobertura.html?${window.position ? `lat=${window.position.latitude}&lng=${window.position.longitude}` : ''}" style="width: 100%; height: 100%;"></iframe>`,
  });
};

export const measureExecutionTime = (fn, ...args) => {
  const functionName = fn.name || 'Anonymous function';

  const startTime = performance.now(); // Start time in milliseconds

  const result = fn(...args); // Execute the function with the provided arguments

  const endTime = performance.now(); // End time in milliseconds

  const timeTaken = endTime - startTime; // Calculate time taken in milliseconds

  // eslint-disable-next-line no-console
  console.log(`Execution time for ${functionName}: ${timeTaken.toFixed(4)} milliseconds`);

  return result; // Return the result of the function execution
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const LayersManager = (function () {
  // Private variables or functions
  let instance;
  let layerGroups = [];
  let limit = 10;

  // Private constructor
  function LayersManagerSingleton() {
    return { layerGroups, addLayer, addDevice };
  }

  function addLayer(id, configs) {
    let l_id = `${id}-${layerGroups.length + 1}`;
    window.map?.addSource(l_id, configs.dataSourceConfig);
    window.map?.addLayer({ ...configs.backgroundConfig, id: `${configs.backgroundConfig.id}-${l_id}}`, source: l_id });
    window.map?.addLayer({ ...configs.iconConfig, id: `${configs.iconConfig.id}-${l_id}}`, source: l_id });
    window.map?.addLayer({ ...configs.directionConfig, id: `${configs.directionConfig.id}-${l_id}}`, source: l_id });
    window.map?.addLayer({ ...configs.clusterConfig, id: `${configs.clusterConfig.id}-${l_id}}`, source: l_id });

    let layer = { id: l_id, devices: [], layers: [`${configs.backgroundConfig.id}-${l_id}}`, `${configs.iconConfig.id}-${l_id}}`, `${configs.directionConfig.id}-${l_id}}`, `${configs.clusterConfig.id}-${l_id}}`] };
    layerGroups.push(layer);

    return layer;
  }

  function addDevice(device, id, configs) {
    let layer = layerGroups.find((item) => item.devices.length < limit);
    if (!layer) layer = addLayer(id, configs);

    layer.devices.push(device);
    return layer.id;
  }

  // Public API
  return {
    // Public method to get the singleton instance
    getInstance() {
      if (!instance) {
        instance = new LayersManagerSingleton();
      }
      return instance;
    },
  };
}());

window.createMenuItem = (iconClass, text, isSubmenu = false, callback = () => { }) => {
  if (document.querySelector('.menu') === null) window.generateMenu();
  let menu = document.querySelector('.menu');

  const li = document.createElement('li');
  li.classList.add('menu-item');
  if (isSubmenu) {
    li.classList.add('menu-item-submenu');
  }
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('menu-btn');
  if (iconClass) {
    const icon = document.createElement('i');
    icon.classList.add('fa', iconClass);
    button.appendChild(icon);
  }
  const span = document.createElement('span');
  span.classList.add('menu-text');
  span.textContent = text;
  button.appendChild(span);
  li.appendChild(button);

  button.onclick = callback;
  menu.appendChild(li);
  return li;
};

window.createMenuSeparator = () => {
  if (document.querySelector('.menu') === null) window.generateMenu();
  let menu = document.querySelector('.menu');

  const li = document.createElement('li');
  li.classList.add('menu-separator');

  menu.appendChild(li);
  return li;
};

window.createSubmenu = (items) => {
  if (document.querySelector('.menu') === null) window.generateMenu();
  let menu = document.querySelector('.menu');

  const ul = document.createElement('ul');
  ul.classList.add('menu');
  items.forEach((item) => {
    ul.appendChild(item);
  });

  menu.appendChild(ul);
  return ul;
};

window.generateMenu = () => {
  if (document.querySelector('.menu') !== null) return;
  const menuContainer = document.createElement('ul');
  menuContainer.classList.add('menu');
  document.body.appendChild(menuContainer);

  let menu = document.querySelector('.menu');

  function showMenu(x, y) {
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.add('menu-show');
  }

  function hideMenu() {
    menu.classList.remove('menu-show');
  }

  function onMouseDown(e) {
    if (e.target.className.split(' ').some((c) => /menu-.*/.test(c))) return;
    hideMenu();
    document.removeEventListener('mousedown', onMouseDown);
  }

  function onContextMenu(e) {
    e.preventDefault();
    showMenu(e.pageX, e.pageY);
    document.addEventListener('mousedown', onMouseDown, false);
  }

  document.addEventListener('contextmenu', onContextMenu, false);
};

export const openModalPromociones = () => {
  window.jsPanel.modal.create({
    theme: 'dark',
    content: `
        <iframe title="Promociones" src="./promotions.html" frameBorder="0" width="100%" height="99%" />
        `, // Set the font size to 20px
    position: 'center', // 80% width, 30% height, centered
    draggable: { containment: 'viewport' }, // Make it draggable within the viewport
    contentSize: { width: '80%', height: '90%' }, // Responsive sizing
    borderRadius: 10, // Remove rounded corners for a more square appearance
    closeOnEscape: false, // Disable closing on ESC key
    closeOnOutsideClick: false, // Disable closing on outside click
    header: true, // Remove the header
    footer: false, // Remove the footer
    controls: { maximize: 'remove', minimize: 'remove' }, // Remove all controls
    closeOnBackdrop: true,
    backdrop: true,
    headerTitle: 'Promociones',
  });
};

export const confirmDialog = (callBackYes, callBackNo = (() => { })) => {
  window.alertify.confirm('Confirmar', 'Estas segur@', (async () => {
    callBackYes();
  }), (() => {
    callBackNo();
  })).set({
    closableByDimmer: false,
    modal: true,
    labels: {
      // dialogs default title
      title: 'Confirmar',
      // ok button text
      ok: 'SI',
      // cancel button text
      cancel: 'No',
    },
  }).show();
};

export const infoDialog = (message, callbackYes = (() => { })) => {
  window.alertify.alert('Alerta', message, callbackYes);
};

export const isAdmin = () => ((window.getUser())?.administrator || false);
export const createBaseURL = () => `${window.location.protocol}//${window.location.hostname}${window.location.port !== '' ? `:${window.location.port}` : ''}`;

export class TreeWalker {
  constructor(obj) {
    this.obj = obj;
  }

  // Helper function to split path into keys and handle array indexing
  splitPath(path) {
    return path.split('.').flatMap((key) => key.split(/[\[\]]/).filter(Boolean));
  }

  // Function to check if a key or its variants exist in the object
  keyExists(path, variants = {}) {
    const keys = this.splitPath(path);
    return this.traverse(this.obj, keys, variants) !== undefined;
  }

  // Function to get the value of a key or its variants from the object
  getValue(path, variants = {}) {
    const keys = this.splitPath(path);
    return this.traverse(this.obj, keys, variants);
  }

  // Core traversal function that works with variants
  traverse(obj, keys, variants) {
    return keys.reduce((acc, key) => {
      if (acc === undefined) return undefined;

      // Get the variant list for the current key if it exists, otherwise use the key itself
      const variantKeys = variants[key] ? [key, ...variants[key]] : [key];

      // Find the first key that exists in the object, either the original key or a variant
      const foundKey = variantKeys.find((k) => acc.hasOwnProperty(k));

      return foundKey !== undefined ? acc[foundKey] : undefined;
    }, obj);
  }
}

export const dateDifference = (date1, date2, timeframes = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'], epoch = null) => {
  const diff = epoch || Math.abs(date2 - date1);
  let remaining = diff;

  const msPer = {
    years: 1000 * 60 * 60 * 24 * 365,
    months: 1000 * 60 * 60 * 24 * 30,
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60,
    seconds: 1000,
  };

  const msPerLang = {
    years: 'Años',
    months: 'Meses',
    days: 'Dias',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
  };

  const result = {};

  // Calculate the time differences for the selected timeframes
  timeframes.forEach((timeframe) => {
    if (msPer[timeframe]) {
      const amount = Math.floor(remaining / msPer[timeframe]);
      if (amount > 0) {
        result[timeframe] = amount;
        remaining -= amount * msPer[timeframe]; // Reduce the remaining time
      }
    }
  });

  // Create the result string, omitting zero values
  const formattedResult = Object.entries(result)
    .map(([unit, value]) => `${value} ${msPerLang[unit]}`)
    .join(', ');

  return formattedResult || ''; // If all values are zero, return a default message
};

export const randomColor = () => '#000000'.replace(/0/g, () => (~~(Math.random() * 16)).toString(16));

export const parseCookies = () => Object.fromEntries(document.cookie.split('; ').map((v) => v.split(/=(.*)/s).map(decodeURIComponent)));

export const rememberMe = () => {
  let user = btoa(document.querySelector('#user').value);
  let password = btoa(document.querySelector('#pass').value);
  let date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `user=${user}; expires=${date.toUTCString()}; path=/`;
  document.cookie = `password=${password}; expires=${date.toUTCString()}; path=/`;
};

export const forgetMe = () => {
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const haveSavedSession = () => ['user', 'password'].every((elem) => [...Object.keys(parseCookies())].includes(elem));
