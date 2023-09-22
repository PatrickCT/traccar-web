import {
  attsGetter,
  hasPassedTime,
  isMobile,
  specialAtts,
  valueParser,
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
    callback: (panel) => {
      document.getElementById('myButton').addEventListener('click', async () => {
        window.confirmDialog(2);
        panel.close();
      });
    },
  });
};

window.confirmDialog = (type) => {
  const html = `
    <div class="simple-confirm dialog-sm" style="display:block">
    <p>Estas segur@?</p>
    <div class="buttonbar">
        <button name='yes' class="..." data-dismiss value="YES">Si</button>
        <button name='no' class="..." data-dismiss data-cancel value="No">No</button>

    </div>
    </div>
    `;
  window.jsPanel.dialog.modal(html, {
    theme: '#163b61',
    border: '1px solid gray',
    borderRadius: '.5rem',
    headerTitle: 'Reactivar',
    headerControls: {
      minimize: 'remove',
      smallify: 'remove',
      maximize: 'remove',
    },
    onclick_yes: async () => {
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
    },
    onclick_no: () => { },
    // onclick_cancel: (panel, elmts, event) => {
    //   console.log(panel, elmts, event);
    // },
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

export const test = () => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  .collapsible {
    cursor: pointer;
    padding: 18px;
    width: 100%;
    text-align: left;
    border: none;
    outline: none;
    background-color: #f1f1f1;
    transition: background-color 0.3s;
  }

  .content {
    display: none;
    padding: 10px;
  }

  .active {
    background-color: #ddd;
  }

  .image {
    max-width: 100%;
    height: auto;
  }
</style>
</head>
<body>

<button class="collapsible">Click to Expand</button>
<div class="content">
  <img class="image" src="https://picsum.photos/200/300" alt="Sample Image">
</div>

<script>
  const collapsible = document.querySelector('.collapsible');
  const content = document.querySelector('.content');

  collapsible.addEventListener('click', function() {
    this.classList.toggle('active');
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  });
</script>

</body>
</html>

`;

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

export const createPopUp = (position) => {
  let html = '';

  if (hasPassedTime(new Date(position.fixTime), 40)) {
    html += '<div style="width: 250px;">';
    if (window.localStorage.getItem(btoa('isAdmin')) === 'true') {
      html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";
      html += ` <a class="link-google-maps" onclick="(function(){navigate('/settings/device/${position.deviceId}');}());" ><img src="./././images/botones-popup/edit.svg" width="14" height="14" /></a>`;
      html += ` <a class="link-google-maps" onclick="(function(){navigate('/settings/device/${position.deviceId}/command');}());" ><img src="./././images/botones-popup/command.svg" width="14" height="14" /></a>`;

      html += `<h3><b>${attsGetter(position, 'name')}</b>`;
      html += '</h3></div>';
    }

    html += `<b style="line-height: 20px;display:flex; font-weight: bold; color: white; text-transform: uppercase; text-shadow: 0 0 red;font-size: 22px; text-align: center;">Sin reportar, comuníquese con soporte</b><a href="https://wa.me/4434521162?text=Ayuda, mi dispositivo: ${attsGetter(position, 'name')}, no esta reportando" style="left: 40%; position: relative;"><br><img src="./././images/botones-popup/whatsapp.svg" width="56" height="56" style="border-radius:6px;"/></a>`;

    html += '<br />';
    if (window.localStorage.getItem(btoa('isAdmin')) === 'true') {
      html += valueParser(position, specialAtts(position, 'protocol'));
      html += '<br />';
      html += valueParser(position, specialAtts(position, 'phone'));
      html += '<br />';
      html += valueParser(position, specialAtts(position, 'imei'));
    }
    html += '<br />';
    html += popupBtns();
    html += '</div>';
    html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');
    return html;
  }
  html += '<div>';
  html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";
  html += ` <a class="link-google-maps" onclick="(function(){navigate('/settings/device/${position.deviceId}/connections');}());" ><img src="./././images/botones-popup/connection.svg" width="14" height="14" /></a>`;
  html += ` <a class="link-google-maps" onclick="(function(){navigate('/settings/device/${position.deviceId}');}());" ><img src="./././images/botones-popup/edit.svg" width="14" height="14" /></a>`;
  html += window.localStorage.getItem(btoa('isAdmin')) === 'true' ? ` <a class="link-google-maps" onclick="(function(){navigate('/settings/device/${position.deviceId}/command');}());" ><img src="./././images/botones-popup/command.svg" width="14" height="14" /></a>` : '';

  html += `<h3><b>${attsGetter(position, 'name')}</b>`;
  html += '</h3></div>';
  html += '<div style="text-align: center;">';
  html += `${valueParser(position, specialAtts(position, 'ignition'))}  -  `;
  html += valueParser(position, specialAtts(position, 'motion'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'dateTime'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'lastUpdate'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'status'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'direccion'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'fuel'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'totalDistance'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'speed'));
  html += valueParser(position, 'bateria');
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'odometer'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'hours'));
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaC')) : '';
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaF')) : '';

  html += valueParser(position, specialAtts(position, 'lastAlarm'));
  html += '<br />';

  if (window.localStorage.getItem(btoa('isAdmin')) === 'true') {
    html += valueParser(position, specialAtts(position, 'protocol'));
    html += '<br />';
    html += valueParser(position, specialAtts(position, 'phone'));
    html += '<br />';
    html += valueParser(position, specialAtts(position, 'imei'));
  }

  html += '<br />';

  html += '<a onclick="(function(){showExtraDiv();}());" style="color: #ffffff" href="#" >+</a>';
  html += '<br />';

  html += `<div id="extra" style="display: ${window.extraDiv};">`;
  if (window.device.attributes?.deviceImage) {
    html += `<img style="width: -webkit-fill-available; height: auto;" src="/api/media/${window.device.uniqueId}/${window.device.attributes?.deviceImage}" />`;
  }

  html += '<br />';
  html += valueParser(position, specialAtts(position, 'policy'));
  html += valueParser(position, specialAtts(position, 'expiration'));
  html += '</div>';
  html += '</div>';

  html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');

  html += '<br />';
  html += popupBtns();
  html += '</div>';
  return html;
};

export const createPopUpReport = (position) => {
  let html = '<div>';
  html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";

  html += `<h3><b>${attsGetter(position, 'name')}</b></h3></div>`;
  html += valueParser(position, specialAtts(position, 'ignition'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'motion'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'dateTime'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'status'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'direccion'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'fuel'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'totalDistance'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'speed'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'hours'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaC')) : '';
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaF')) : '';
  html += '<br />';
  html += valueParser(position, 'bateria');
  html = html.replace(/<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/g, '<br />');

  html += '</div>';
  html += '</div>';
  return html;
};

export const createPopUpReportRoute = (position) => {
  let html = '<div>';
  html += "<div align='center' style='text-align: center !important;text-transform: uppercase !important;'>";

  html += `<h3><b>${attsGetter(position, 'name')}</b></h3></div>`;
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'ignition'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'motion'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'dateTime'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'status'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'direccion'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'fuel'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'totalDistance'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'speed'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'hours'));
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaC')) : '';
  html += '<br />';
  html += valueParser(position, specialAtts(position, 'temperaturaC')) !== '' ? valueParser(position, specialAtts(position, 'temperaturaF')) : '';
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

export const streetView = () => {
  if (window.position.latitude != null && window.position.longitude != null) {
    window.jsPanel.create({
      theme: {
        colorHeader: '#fff',
        bgPanel: 'rgb(49,80,126)',
      },
      content: `<iframe src="../VistaCalle.html?lat=${window.position.latitude}&lng=${window.position.longitude}" style="position:relative; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;">Your browser doesnt support iframes</iframe>`,
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
