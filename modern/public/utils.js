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
/* eslint-disable no-bitwise */
const distanceConverter = (unit) => {
    switch (unit) {
        case 'mi':
            return 0.000621371;
        case 'nmi':
            return 0.000539957;
        case 'km':
        default:
            return 0.001;
    }
};

const distanceFromMeters = (value, unit) => value * distanceConverter(unit);

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


const formatDate = (date, template = 'dd-MM-yyyy HH:mm:ss') => {
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

const attConverter = (obj, attribute) => {
    switch (attribute) {
        case 'status': {
            const value = attVariantsEvaluator(obj, attribute);
            return { online: 'En linea', offline: 'Fuera de linea', unknown: 'Desconocido' }[value] || null;
        }
        case 'temperaturaC': {
            const value = attVariantsEvaluator(obj, 'temperature');
            return value ? value.toFixed(1) : null;
        }
        case 'temperaturaF': {
            const value = attVariantsEvaluator(obj, 'temperature');
            return value ? ((value * 1.8) + 32).toFixed(1) : null;
        }
        case 'name': {
            return window.device?.name || window.deviceName || null;
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
            return formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') || null;
        }
        case 'fixTime': {
            const value = attVariantsEvaluator(obj, attribute);
            return formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') || null;
        }
        case 'serverTime': {
            const value = attVariantsEvaluator(obj, attribute);
            return formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') || null;
        }
        case 'deviceTime': {
            const value = attVariantsEvaluator(obj, attribute);
            return formatDate(new Date(value), 'dd-MM-yyyy HH:mm:ss', 'es-MX') || null;
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
            const event = getEvent();
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

const attsGetter = (obj, attribute) => (obj[specialAtts(obj, attribute)] ?? obj['attributes']?.[specialAtts(obj, attribute)] ?? obj[`attributes.${specialAtts(obj, attribute)}`] ?? obj[`attribute.${specialAtts(obj, attribute)}`] ?? null) ?? (obj[specialAtts(obj, attribute)] || obj['attributes']?.[specialAtts(obj, attribute)] || obj[`attributes.${specialAtts(obj, attribute)}`] || obj[`attribute.${specialAtts(obj, attribute)}`] || null);

const specialAtts = (obj, attribute) => {
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

const valueParser = (obj, value) => {
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
    }
    return '';
};

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const hasPassedTime = (date, min) => Math.abs((date - new Date()) / 60000) > min;

const createBaseURL = () => `${window.location.protocol}//${window.location.hostname}${window.location.port !== '' ? `:${window.location.port}` : ''}`;

const dateDifference = (date1, date2, timeframes = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'], epoch = null) => {
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

const createPopUpFooterButtons = (include) => popupFooterButtons(include);

const createPopUpData = (position) => {
    let html = '';

    html += '<div style="text-align: center;">';
    html += `${valueParser(position, 'ignition')}  -  `;
    html += valueParser(position, 'motion');
    html += '<br />';
    html += valueParser(position, 'dateTime');
    html += '<br />';
    html += valueParser(window.devices[position.deviceId], 'lastUpdate');
    html += '<br />';
    html += valueParser(position, 'status');
    html += '<br />';
    html += valueParser(position, 'direccion');
    html += '<br />';
    html += valueParser(position, 'fuel');
    html += '<br />';
    html += valueParser(position, 'totalDistance');
    html += '<br />';
    html += valueParser(position, 'speed');
    html += valueParser(position, 'bateria');
    html += '<br />';
    html += valueParser(position, 'odometer');
    html += '<br />';
    html += valueParser(position, 'group');
    html += '<br />';
    html += valueParser(position, 'hours');
    html += '<br />';
    html += valueParser(position, 'temperaturaC');
    html += valueParser(position, 'temperaturaF');
    html += '<br />';
    html += valueParser(position, 'lastAlarm');
    html += '<br />';

    html += '<br />';

    html += '<a onclick="(function(){showExtraDiv();}());" style="color: #ffffff" href="#" >+</a>';
    html += '<br />';

    html += `<div id="extra" style="display: ${window.extraDiv};">`;
    if (window.devices[position.deviceId]?.attributes?.deviceImage) {
        html += `<img style="width: -webkit-fill-available; height: auto;" src="/api/media/${window.devices[position.deviceId].uniqueId}/${window.devices[position.deviceId].attributes?.deviceImage}" />`;
    }

    html += '<br />';

    html += '</div>';
    html += '</div>';

    html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');

    html += '<br />';

    return html;
};

window.createPopUpContent = (position, showFooterButtons = true, includeFooterButtons = ['streetView', 'maps']) => {
    try {
        const user = window.getUser();
        // sections
        let html = '';

        html += '<div align="center" style="text-align: center !important;text-transform: uppercase !important;">';

        // name
        html += `<h3><b>${valueParser(position, 'name')}</b></h3>`;
        html += '</div>';
        // stats
        html += createPopUpData(position);
        // policy
        // footer bottons
        if (showFooterButtons && !user.deviceReadonly) {
            html += createPopUpFooterButtons(includeFooterButtons);
        }
        return html;
    } catch (_) {
    }

    return '';
};

