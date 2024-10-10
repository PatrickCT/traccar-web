/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
import {
  attConverter,
  hasPassedTime,
  isMobile,
  valueParser,
  isAdmin,
  createBaseURL,
  dateDifference,
} from './utils';

window.extraDiv = 'none';

window.showExtraDiv = () => { window.extraDiv = (window.extraDiv === 'none' ? 'block' : 'none'); document.getElementById('extra').style.display = window.extraDiv; };

window.makeRequest = async (url, method = 'GET', payload = null) => {
  const options = {
    method: method.toUpperCase(),
    headers: {},
  };

  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    // No content to parse
    return null;
  }

  const data = await response.json();
  return data;
};

window.engineLock = () => {
  window.jsPanel.create({
    theme: '#163b61',
    content: '<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><button id="myButton" style="background-color: #2196f3; color: #ffffff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Apagar</button></div>',
    contentSize: {
      width: window.innerWidth * (isMobile() ? 0.4 : 0.1),
      height: window.innerHeight * (isMobile() ? 0.1 : 0.1),
    },
    headerTitle: 'Apagar',
    headerControls: {
      minimize: 'remove',
      smallify: 'remove',
      maximize: 'remove',
    },
    position: { my: 'center-bottom', at: 'center-center', offsetY: 0 },
    callback: (panel) => {
      document.getElementById('myButton').addEventListener('click', async () => {
        window.confirmDialog(1);
        panel.close();
      });
    },
  });
};

window.engineReactivate = () => {
  window.jsPanel.create({
    theme: '#163b61',
    content: '<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><button id="myButton" style="background-color: #2196f3; color: #ffffff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Reactivar</button></div>',
    contentSize: {
      width: window.innerWidth * (isMobile() ? 0.4 : 0.1),
      height: window.innerHeight * (isMobile() ? 0.1 : 0.1),
    },
    headerTitle: 'Reactivar',
    headerControls: {
      minimize: 'remove',
      smallify: 'remove',
      maximize: 'remove',
    },
    position: { my: 'center-bottom', at: 'center-center', offsetY: 0 },
    callback: (panel) => {
      document.getElementById('myButton').addEventListener('click', async () => {
        window.confirmDialog(2);
        panel.close();
      });
    },
  });
};

window.confirmDialog = (type) => {
  window.alertify.confirm('Confirmar', 'Estas segur@', (async () => {
    if (type === 1) {
      await window.makeRequest('./api/commands/send', 'POST', {
        type: 'engineStop',
        attributes: {},
        deviceId: window.position.deviceId,
      });
    } else if (type === 2) {
      await window.makeRequest('./api/commands/send', 'POST', {
        id: 0,
        attributes: {},
        deviceId: window.position.deviceId,
        type: 'engineResume',
        textChannel: false,
        description: null,
      });
    }
  }), (() => {

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

const openInNewTab = (url) => {
  const win = window.open(url, '_blank');
  win.focus();
};

export const generateRoute = () => {
  let url = '';
  url = `https://www.google.com/maps/place/${window.position.latitude},${window.position.longitude}`;
  openInNewTab(url);
};

export const streetView = (position = null) => {
  const pos = position || window.replayPosition || window.position;
  if (pos.latitude != null && pos.longitude != null) {
    window.jsPanel.create({
      theme: {
        colorHeader: '#fff',
        bgPanel: 'rgb(49,80,126)',
      },
      content: `<iframe src="../VistaCalle.html?lat=${pos.latitude}&lng=${pos.longitude}" style="position:relative; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;">Your browser doesnt support iframes</iframe>`,
      contentSize: {
        width: window.innerWidth * (isMobile() ? 0.9 : 0.6),
        height: window.innerHeight * (isMobile() ? 0.8 : 0.6),
      },
      headerTitle: 'Vista de calle',
      headerControls: {
        minimize: 'remove',
        smallify: 'remove',
      },
      top: '56px',
    });
  }
};

const popupHeaderButtons = (position) => {
  let html = '';
  html += "<div align = 'center' style = 'text-align: center;' >";

  html += `<a onclick="(function(){navigate('/settings/device/${position.deviceId}/connections');}());"><img src="${createBaseURL()}${'/images/botones-popup/connection.svg'}" width="14" height="14" /></a>`;

  html += `<a onclick="(function(){navigate('/settings/device/${position.deviceId}');}());"><img src="${createBaseURL()}${'/images/botones-popup/edit.svg'}" width="14" height="14" /></a>`;

  html += `<a onclick="(function(){navigate('/settings/accumulators/${position.deviceId}');}());"><img src="${createBaseURL()}${'/images/botones-popup/accumulator.svg'}" width="14" height="14" /></a>`;

  if (isAdmin()) {
    html += `<a onclick="(function(){navigate('/settings/device/${position.deviceId}/command');}());"><img src="${createBaseURL()}${'/images/botones-popup/command.svg'}" width="14" height="14" /></a>`;

    html += `<a onclick="(function(){navigate('/position/${position.id}');}());"><img src="${createBaseURL()}${'/images/botones-popup/position.svg'}" width="14" height="14" /></a>`;
  }

  html += '</div>';

  return html;
};

const popupFooterButtons = (include = ['engineLock', 'engineResume', 'streetView', 'maps', 'report', 'replay']) => {
  let html = '';
  html += "<div align = 'center' style = 'text-align: center;' >";
  if (include.includes('engineLock')) {
    html += `<a onclick="(function(){engineLock();}());"><img src="${createBaseURL()}${'/images/botones-popup/apagar.svg'}" width="14" height="14" /></a>`;
  }
  if (include.includes('enginResume')) {
    html += `<a onclick="(function(){engineReactivate();}());"><img src="${createBaseURL()}${'/images/botones-popup/encender.svg'}" width="14" height="14" /></a>`;
  }
  if (include.includes('streetView')) {
    html += `<a onclick="(function(){streetView();}());"><img src="${createBaseURL()}${'/images/botones-popup/calle.svg'}" width="14" height="14" /></a>`;
  }
  if (include.includes('maps')) {
    html += `<a onclick="(function(){generateRoute();}());"><img src="${createBaseURL()}${'/images/botones-popup/maps.svg'}" width="14" height="14" /></a>`;
  }
  if (include.includes('report')) {
    html += `<a onclick="(function(){navigate('/reports/route');}());"><img src="${createBaseURL()}${'/images/botones-popup/recorrido.svg'}" width="14" height="14" /></a>`;
  }
  if (include.includes('replay')) {
    html += `<a onclick="(function(){navigate('/replay');}());"><img src="${createBaseURL()}${'/images/botones-popup/replay.svg'}" width="14" height="14" /></a>`;
  }

  html += '</div>';

  return html;
};

const popupBtns = () => {
  let html = '';
  html += "<div style='display: table; margin: auto'>";

  html += "<div style='float: left; padding: 2px;' >";
  html += '<a class="link-google-maps" onclick="(function(){engineLock();}());" ><img src="./././images/botones-popup/apagar.svg" width="35" height="35" style="border-radius:6px;"/></a>';
  html += '</div>';

  html += "<div style='float: left; padding: 2px;' >";
  html += '<a class="link-google-maps" onclick="(function(){engineReactivate();}());" ><img src="./././images/botones-popup/encender.svg" width="35" height="35" style="border-radius:6px;"/></a>';
  html += '</div>';

  html += "<div style='float: left; padding: 2px;' >";
  html += "<a class='link-google-maps' onclick='(function(){streetView();}());' ><img src='./././images/botones-popup/calle.svg' width='35' height='35' style='border-radius:6px;'/></a>";
  html += '</div>';

  html += "<div style='float: left; padding: 2px;'>";
  html += '<a class="link-google-maps" onclick="(function(){generateRoute();}());"><img src="./././images/botones-popup/maps.svg" width="35" height="35" style="border-radius:6px;"/></a>';
  html += '</div>';

  html += "<div style='float: left; padding: 2px;' >";
  html += "<a class='link-google-maps' onclick='(function(){navigate(`/reports/route`);}());'><img src='./././images/botones-popup/recorrido.svg' width='35' height='35' style='border-radius:6px;'/></a>";
  html += '</div>';

  html += "<div id='div_replay' style='float: left; padding:2px;' >";
  html += '<a class="link-google-maps" onClick="(function(){navigate(`/replay`);}());"><img src="./././images/botones-popup/replay.svg" width="35" height="35" style="border-radius:6px;"/></a>';
  html += '</div>';

  html += '</div>';

  return html;
};

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

  if (isAdmin()) {
    html += valueParser(position, 'protocol');
    html += '<br />';
    html += valueParser(window.devices[position.deviceId], 'phone');
    html += '<br />';
    html += valueParser(window.devices[position.deviceId], 'imei');
    html += '<br />';
    html += valueParser(window.devices[position.deviceId], 'simType');
    html += '<br />';
    html += valueParser(window.devices[position.deviceId], 'simKey');
    html += '<br />';
    if (hasPassedTime(new Date(position.fixTime || new Date()), 40)) {
      html += `<b style="font-weight: bold; color: red;">* ${dateDifference(new Date(position.fixTime || new Date()), new Date(), ['days', 'hours', 'minutes'])} sin reportar</b>`;
    }
  }

  html += '<br />';

  html += '<a onclick="(function(){showExtraDiv();}());" style="color: #ffffff" href="#" >+</a>';
  html += '<br />';

  html += `<div id="extra" style="display: ${window.extraDiv};">`;
  if (window.devices[position.deviceId]?.attributes?.deviceImage) {
    html += `<img style="width: -webkit-fill-available; height: auto;" src="/api/media/${window.devices[position.deviceId].uniqueId}/${window.devices[position.deviceId].attributes?.deviceImage}" />`;
  }

  html += '<br />';
  // html += valueParser(position, 'policy');
  // html += valueParser(position, 'expiration');
  html += '</div>';
  html += '</div>';

  html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');

  html += '<br />';

  return html;
};

const popupButton = (icon, onClick, restrictions = [], overrides = { w: 14, h: 14 }) => {
  if (restrictions.some((value) => value)) return '';

  const baseUrlIcon = `${createBaseURL()}${icon}`;

  // Convert the function to string properly to avoid it being treated as text
  const onClickString = onClick.toString().replace(/^.*?\{(.*)\}$/, '$1').trim();

  return `
    <a href="javascript:void(0);" onclick="(${onClickString})">
      <img src="${baseUrlIcon}" width="${overrides.w}" height="${overrides.h}" style="border-radius: 6px;" />
    </a>`;
};

const createPopUpHeadersButtons = (position) => popupHeaderButtons(position);

const createPopUpFooterButtons = (include = ['engineLock', 'engineResume', 'streetView', 'maps', 'report', 'replay']) => popupFooterButtons(include);

const createPopUpContent = (position, showHeaderButtons = true, showFooterButtons = true) => {
  try {
    const user = window.getUser();
    // sections
    let html = '';

    html += '<div align="center" style="text-align: center !important;text-transform: uppercase !important;">';
    // header buttons
    if (showHeaderButtons && !user.deviceReadonly) {
      html += createPopUpHeadersButtons(position);
    }
    // name
    html += `<h3><b>${valueParser(position, 'name')}</b></h3>`;
    html += '</div>';
    // stats
    html += createPopUpData(position);
    // policy
    // footer bottons
    if (showFooterButtons && !user.deviceReadonly) {
      html += createPopUpFooterButtons();
    }
    return html;
  } catch (_) {
  }

  return '';
};

export const createPopUp = (position, showHeaderButtons = true, showFooterButtons = true) => createPopUpContent(position, showHeaderButtons, showFooterButtons);

window.createPopUp = createPopUp;

export const createPopUpReport = (position) => {
  let html = '<div>';
  html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";

  html += `<h3> <b>${attConverter(position, 'name')}</b></h3></div> `;
  html += valueParser(position, 'ignition');
  html += '<br />';
  html += valueParser(position, 'motion');
  html += '<br />';
  html += valueParser(position, 'dateTime');
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
  html += '<br />';
  html += valueParser(position, 'hours');
  html += '<br />';
  html += valueParser(position, 'temperaturaC');
  html += '<br />';
  html += valueParser(position, 'temperaturaC');
  html += '<br />';
  html += valueParser(position, 'bateria');
  html += '<br />';
  html += valueParser(position, 'simType');
  html += '<br />';
  html += valueParser(position, 'simKey');
  html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');

  html += '</div>';
  html += '</div>';
  return html;
};

export const createPopUpReportRoute = (position) => {
  let html = '<div>';
  html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";

  html += `<h3 style = "margin: 0px" > <b>${window.deviceName || ''}</b></h3></div> `;
  html += valueParser(position, 'ignition');
  html += '<br />';
  html += valueParser(position, 'motion');
  html += '<br />';
  html += valueParser(position, 'dateTime');
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
  html += '<br />';
  html += valueParser(position, 'hours');
  html += '<br />';
  html += valueParser(position, 'temperaturaC');
  html += '<br />';
  html += valueParser(position, 'temperaturaC');
  html += '<br />';
  html += valueParser(position, 'bateria');
  html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');
  html += '<br>';
  html += "<div style='display: table; margin: auto'>";

  html += "<div style='float: left; padding: 2px;' >";
  html += "<a class='link-google-maps' onclick='(function(){streetView();}());' ><img src='../images/botones-popup/calle.svg' width='35' height='35' style='border-radius:6px;'/></a>";
  html += '</div>';

  html += "<div style='float: left; padding: 2px;'>";
  html += '<a class="link-google-maps" onclick="(function(){generateRoute();}());"><img src="../images/botones-popup/maps.svg" width="35" height="35" style="border-radius:6px;"/></a>';
  html += '</div>';

  html += '</div>';
  html += '</div>';
  return html;
};

export const createPopUpSimple = (position) => {
  window.replayPosition = position;
  let html = '<div>';
  window.sv = (pos) => window.streetView(pos);
  html += valueParser(position, 'startTime');
  html += '<br />';
  html += valueParser(position, 'endTime');
  html += '<br />';
  html += valueParser(position, 'duration');
  html += '<br />';
  html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');
  html += '<br>';
  html += "<div style='float: left; padding: 2px;' >";
  html += "<a class='link-google-maps' onclick='(function(){streetView();}());' ><img src='./././images/botones-popup/calle.svg' width='35' height='35' style='border-radius:6px;'/></a>";
  html += '</div>';
  html += '</div>';
  return html;
};
