import {
  attsGetter,
  isMobile,
  specialAtts,
  valueParser,
} from './utils';

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
    callback: (panel) => {
      document.getElementById('myButton').addEventListener('click', async () => {
        await window.makeRequest('./api/commands/send', 'POST', {
          type: 'engineStop',
          attributes: {},
          deviceId: window.position.deviceId,
        });
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
    callback: (panel) => {
      document.getElementById('myButton').addEventListener('click', async () => {
        await window.makeRequest('./api/commands/send', 'POST', {
          id: 0,
          attributes: {},
          deviceId: window.position.deviceId,
          type: 'engineResume',
          textChannel: false,
          description: null,
        });
        panel.close();
      });
    },
  });
};

function openInNewTab(url) {
  const win = window.open(url, '_blank');
  win.focus();
}
export const generateRoute = () => {
  let url = '';
  url = `http://www.google.com/maps/place/${window.position.latitude},${window.position.longitude}`;
  openInNewTab(url);
};

export const test = () => { generateRoute(); };
export const createPopUp = (position) => {
  let html = '<div>';
  html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";
  //   if (!Traccar.app.getUser().get('attributes').hasOwnProperty('ui.disableReport') || !Traccar.app.getUser().get('attributes')['ui.disableReport']) {
  //     html += `<span class='hover tooltipNotifications'><i class='fa fa-bell' aria-hidden='true' onClick='openNotifications(${attsGetter(position, 'deviceId')})'></i></span>`;
  //     html += '<span>                                                                                 </span>';
  //     html += `<i class='fa fa-cogs' aria-hidden='true' onClick='openNotificationsConfig(${attsGetter(position, 'deviceId')})'></i>`;
  //     html += '<span>                                                                                 </span>';
  //     html += `<i class='fa fa-street-view' aria-hidden='true' onClick='openGeofences(${attsGetter(position, 'deviceId')})'></i>`;
  //   }
  html += `<h3><b>${attsGetter(position, 'name')}</b></h3></div>`;
  html += valueParser(position, specialAtts(position, 'ignition'));
  html += valueParser(position, specialAtts(position, 'motion'));
  html += valueParser(position, specialAtts(position, 'dateTime'));
  html += valueParser(position, specialAtts(position, 'status'));
  html += valueParser(position, specialAtts(position, 'direccion'));
  html += valueParser(position, specialAtts(position, 'fuel'));
  html += valueParser(position, specialAtts(position, 'totalDistance'));
  html += valueParser(position, specialAtts(position, 'speed'));
  html += valueParser(position, specialAtts(position, 'hours'));
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaC')) : '';
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaF')) : '';
  html += valueParser(position, 'bateria');
  //   html += valueParser(position, specialAtts(position, 'lastAlarm'));
  html += '<br>';

  html += "<div style='display: table; margin: auto'>";

  html += "<div style='float: left; padding: 2px;' >";
  html += `<a class="link-google-maps" onclick="(function(){navigate('/settings/device/${position.deviceId}/connections');}());" ><img src="./././images/botones-popup/connection.svg" width="35" height="35" style="border-radius:6px;"/></a>`;
  html += '</div>';

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

  // html += "<div id='divclear' style='float: left; padding:2px;' >";
  // html += "<a class='link-google-maps' onclick='(function(){clearMarkers();}());'><img src='./././images/botones-popup/limpiar_recorrido.svg' width='35' height='35' style='border-radius:6px;'/></a>";
  // html += '</div>';

  html += "<div id='div_replay' style='float: left; padding:2px;' >";
  html += '<a class="link-google-maps" onClick="(function(){navigate(`/replay`);}());"><img src="./././images/botones-popup/replay.svg" width="35" height="35" style="border-radius:6px;"/></a>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  return html;
};

export const streetView = () => {
  if (window.position.latitude != null && window.position.longitude != null) {
    window.jsPanel.create({
      theme: {
        colorHeader: '#fff',
        bgPanel: 'rgb(49,80,126)',
      },
      content: `<iframe src="./VistaCalle.html?lat=${window.position.latitude}&lng=${window.position.longitude}" style="position:relative; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;">Your browser doesnt support iframes</iframe>`,
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
