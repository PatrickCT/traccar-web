/* eslint-disable no-unreachable */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
class InternalFixedSizeArray {
  constructor(maxSize, onLimitReached) {
    this.maxSize = maxSize;
    this.array = [];
    this.onLimitReached = onLimitReached;
  }

  push(item) {
    if (this.array.length === this.maxSize) {
      this.array.shift(); // Remove the oldest item
    }
    this.array.push(item);
    if (this.array.length >= this.maxSize) {
      this.onLimitReached();
    }
  }

  pop() {
    this.array.pop();
  }

  reset() {
    this.array = [];
  }

  get() {
    return this.array;
  }
}

class SocketWorker {
  constructor(socket) {
    this.socket = socket;
    this.socket.on('whoareyou', () => {
      this.socket.emit('join', 'clients');
    });

    this.socket.on('broadcast-alert', (notification) => {
      window.updateBroadcastNotifications(notification);
    });

    this.socket.on('kick', () => {
      window.updateBroadcastNotifications('Alerta del sistema, tu sesión se cerrara en unos segundos');
      setTimeout(() => window.handleLogout(), 5000);
    });
  }
}

class InternalTools {
  constructor() {
    this.info = {
      timeOpened: new Date(),
      timezone: (new Date()).getTimezoneOffset() / 60,

      pageon: () => window.location.pathname,
      referrer: () => document.referrer,
      previousSites: () => history.length,

      browserName: () => navigator.appName,
      browserEngine: () => navigator.product,
      browserVersion: () => navigator.appVersion,
      userAgent: () => navigator.userAgent,
      browserLanguage: () => navigator.language,
      browserOnline: () => navigator.onLine,
      browserPlatform: () => navigator.platform,
      javaEnabled: () => navigator.javaEnabled(),
      dataCookiesEnabled: () => navigator.cookieEnabled,
      dataCookies_old: () => document.cookie,
      dataCookies: () => {
        try {
          return decodeURIComponent(document.cookie.split(';'));
        } catch (e) {
          return [];
        }
      },
      dataStorage: () => {
        try {
          return localStorage;
        } catch (e) {
          return null;
        }
      },

      sizeScreenW: () => screen.width,
      sizeScreenH: () => screen.height,
      sizeDocW: () => document.documentElement.clientWidth || document.body.clientWidth,
      sizeDocH: () => document.documentElement.clientHeight || document.body.clientHeight,
      sizeInW: () => window.innerWidth,
      sizeInH: () => window.innerHeight,
      sizeAvailW: () => screen.availWidth,
      sizeAvailH: () => screen.availHeight,
      scrColorDepth: () => screen.colorDepth,
      scrPixelDepth: () => screen.pixelDepth,

      getGeolocation: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.accuracy = position.coords.accuracy;
            this.altitude = position.coords.altitude || null;
            this.altitudeAccuracy = position.coords.altitudeAccuracy || null;
            this.heading = position.coords.heading || null;
            this.speed = position.coords.speed || null;
            this.timestamp = position.timestamp;
          }, (error) => {
            console.error('Error obtaining geolocation:', error);
            this.latitude = null;
            this.longitude = null;
            this.accuracy = null;
            this.altitude = null;
            this.altitudeAccuracy = null;
            this.heading = null;
            this.speed = null;
            this.timestamp = null;
          });
        } else {
          console.warn('Geolocation is not supported by this browser.');
          this.latitude = null;
          this.longitude = null;
          this.accuracy = null;
          this.altitude = null;
          this.altitudeAccuracy = null;
          this.heading = null;
          this.speed = null;
          this.timestamp = null;
        }
      },

      getBatteryInfo: async () => {
        if (navigator.getBattery) {
          try {
            const battery = await navigator.getBattery();
            this.batteryCharging = battery.charging;
            this.batteryLevel = battery.level * 100; // in percentage
            this.batteryChargingTime = battery.chargingTime;
            this.batteryDischargingTime = battery.dischargingTime;
          } catch (error) {
            console.error('Error obtaining battery information:', error);
            this.batteryCharging = null;
            this.batteryLevel = null;
            this.batteryChargingTime = null;
            this.batteryDischargingTime = null;
          }
        } else {
          console.warn('Battery status API is not supported by this browser.');
          this.batteryCharging = null;
          this.batteryLevel = null;
          this.batteryChargingTime = null;
          this.batteryDischargingTime = null;
        }
      },

      getNetworkInfo: () => {
        if (navigator.connection) {
          return {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData,
          };
        }
        console.warn('Network Information API is not supported by this browser.');
        return null;
      },

      getMemoryInfo: () => {
        if (navigator.deviceMemory) {
          return `${navigator.deviceMemory} GB`;
        }
        console.warn('Device Memory API is not supported by this browser.');
        return null;
      },

      getHardwareConcurrency: () => navigator.hardwareConcurrency || null,

      getMaxTouchPoints: () => navigator.maxTouchPoints || null,
    };
    this.socket = null;
    this.watchdog = null;
    this.status = {
      socket: {
        active: (this.socket !== null),
        events: {
          error: new InternalFixedSizeArray(10, () => { }),
          ping: new InternalFixedSizeArray(10, () => { }),
          reconnect: new InternalFixedSizeArray(10, () => { }),
          reconnect_attempt: new InternalFixedSizeArray(10, () => { }),
          reconnect_error: new InternalFixedSizeArray(10, () => { }),
          reconnect_failed: new InternalFixedSizeArray(10, () => { }),
        },
      },
      whatchdog: {
        active: (this.socket !== null),
      },
    };

    // this.init();
  }

  async init() {
    this.startSocket();
    this.startHearbeat();
    // Initialize geolocation data
    // this.info.getGeolocation();

    // Initialize battery data
    this.info.getBatteryInfo().then(() => {
      console.log(this.info);
    });

    // Retrieve network information
    this.info.networkInfo = this.info.getNetworkInfo();

    // Retrieve device memory
    this.info.deviceMemory = this.info.getMemoryInfo();

    // Retrieve hardware concurrency
    this.info.hardwareConcurrency = this.info.getHardwareConcurrency();

    // Retrieve max touch points
    this.info.maxTouchPoints = this.info.getMaxTouchPoints();
  }

  async destroy() {
    try {
      this.socket.disconnect();
      this.socket.destroy();
    } catch (error) {
      console.error(error);
    }
  }

  startHearbeat() {
    if (window.heartbeat) {
      heartbeat.start({ url: 'https://t-urban.com.mx:3003/api/webhooks/watchdogs' });
      heartbeat.initConsole();
      heartbeat.initErrorlog();
      return true;
    }
    setTimeout(() => {
      this.startHearbeat();
    }, 3000);
    return false;
  }

  startSocket() {
    if (this.socket) {
      console.log('Socket already exists. Skipping creation.');
      return;
    }

    console.log('Creating new socket connection...');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    this.socket = io(`${protocol}://t-urban.com.mx:3003`, { reconnectionDelayMax: 10000 });

    // Optional: Add additional event listeners and socket setup here
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    this.socket.io.on('error', (error) => {
      this.status.socket.events.error.push(`[${new Date().toLocaleString()}] ${error.message}`);
    });
    this.socket.io.on('ping', () => {
      this.status.socket.events.ping.push(`[${new Date().toLocaleString()}] ping`);
    });
    this.socket.io.on('reconnect', (attempt) => {
      this.status.socket.events.error.push(`[${new Date().toLocaleString()}] ${attempt} reconnection attempts`);
    });
    this.socket.io.on('reconnect_attepmt', (attempt) => {
      this.status.socket.events.error.push(`[${new Date().toLocaleString()}] trying to connect for ${attempt} time`);
    });
    this.socket.io.on('reconnect_error', (error) => {
      this.status.socket.events.error.push(`[${new Date().toLocaleString()}] error while reconnecting: ${error.message}`);
    });
    this.socket.io.on('reconnect_failed', () => {
      this.status.socket.events.error.push(`[${new Date().toLocaleString()}] reconnection failed`);
    });
  }
}
