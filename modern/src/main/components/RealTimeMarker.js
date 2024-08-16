/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { isInCluster } = require('../../common/util/geospatial');
const { measureExecutionTime } = require('../../common/util/utils');

const handler = {
  get(target, key) {
    if (typeof target[key] === 'object' && target[key] !== null) {
      return new Proxy(target[key], handler);
    }
    return target[key];
  },
  set(target, prop, value) {
    const equal = window.isEqual(target[prop], value);
    target[prop] = value;
    return true;
  },
};

class FixedSizeArray {
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

class RealTimeMovement {
  constructor(device, id, configs) {
    // this.layer = window.layerManager.addDevice(device, id, configs);
    this.kRad = Math.PI / 180;
    this.playing = false;
    this.positions = [];
    this.interval = null;
    this.device = device;
    this.pos = new FixedSizeArray(2, () => { this.generatePositions(); });
    this.reset('instanciation');
    this.animate = true;
    this.lock = false;
    this.callCounters = {
      positionsShift: 0,
    };

    this.trackDispatch = (actionType) => {
      this.callCounters[actionType]++;
    };

    setInterval(() => {
      // console.log(`Dispatch positions shift per second: (${this.device})`, this.callCounters);
      // Reset the counters
      this.callCounters.positionsShift = 0;
    }, 1000);
    // this._app = new Proxy({ positions: new FixedSizeArray(2, () => { this.generatePositions(); }) }, handler);
  }

  updateSelectedPosition(p) {
    if (this.pos.array.find((position) => position.id === p.id)) { return; }
    this.stop();
    this.device = p.deviceId;
    this.pos.push(p);

    if (this.pos.array.length === 1) {
      this.pos.push(p);
    }
    this.show(p);
  }

  reset(from = '') {
    // eslint-disable-next-line no-console
    console.log('called reset from ', from);

    this.pos.reset();
    this.device = null;
    this.playing = false;
    this.positions = [];
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationFrame);
  }

  show(position) {
    if (!position) return;

    const newFeature = window.dataGenerator([position], window.devices).features[0];

    const data = window.map?.getSource(window.id)?._data;
    if (!data) return;
    data.features = data.features.filter((value, index, self) => index === self.findIndex((item) => item.properties.deviceId === value.properties.deviceId));
    const index = data.features.findIndex((f) => f?.properties?.deviceId === this.device);
    if (index !== -1) {
      data.features[index] = newFeature;
    } else {
      data.features.push(newFeature);
    }
    window.map?.getSource(window.id)?.setData(data);
    if (window.device?.id === this.device) {
      window.rtmPopUp(position);
    }
  }

  get(prop) { return this[prop]; }

  setState(prop, value) { this[prop] = value; }

  generatePositions() {
    try {
      clearInterval(this.interval);
      this.playing = false;
      this.positions = [];
      const p = [...this.pos.array];
      const positions = [];

      if (Math.abs((new Date(p[0].serverTime) - new Date(p[1].serverTime)) / 1000) > 30) {
        this.animate = false;
      }
      // if (measureExecutionTime(isInCluster, (this.device || 0))) this.animate = false;
      if (isInCluster(this.device || 0)) this.animate = false;

      if (this.animate) {
        p.forEach((position, index) => {
          try {
            positions.push({ ...position, original: true });
            if (index < p.length - 1) {
              // const distance = window.turf.distance(window.turf.point([p[index].longitude, p[index].latitude]), window.turf.point([p[index + 1].longitude, p[index + 1].latitude]), { units: 'meters' });
              const distance = parseInt(this.fastDistance([p[index].longitude, p[index].latitude], [p[index + 1].longitude, p[index + 1].latitude]), 10);

              if (distance > 0) {
                const steps = parseInt(distance / 2, 10);
                let fillers = [];
                for (let i = 0; i < steps; i += 1) {
                  const point = window.turf.along(window.turf.lineString([[p[index].longitude, p[index].latitude], [p[index + 1].longitude, p[index + 1].latitude]]), ((i + 1) * 2), { units: 'meters' });
                  fillers.push({ ...position, original: false, longitude: point?.geometry.coordinates[0], latitude: point?.geometry.coordinates[1] });
                }
                const fillerCourse = (fillers.reduce((acc, obj) => acc + parseFloat(obj.course ?? ''), 0) / fillers.length);
                fillers = fillers.map((filler) => ({ ...filler, course: fillerCourse }));
                positions.push(...fillers);
              }
            }
          } catch (error) {
            this.reset('calc');
          }
        });

        this.positions.push(...positions);
      } else {
        this.positions.push(p);
      }

      this.play();
    } catch (error) {
      this.reset('play');
    }
  }

  play() {
    if (this.lock) return;
    this.animate = true;
    if (this.positions.length <= 1) {
      this.stop();
      return;
    }

    this.show(this.positions[0]);
    this.positions.shift();
    if (this.positions.length <= 1) {
      this.stop();
    }

    this.animationFrame = requestAnimationFrame(this.play.bind(this));
  }

  stop() {
    this.playing = false;
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationFrame);
  }

  pause(state) {
    this.lock = state;
    if (state) this.stop();
    else this.play();
  }

  fastDistance(a, b) {
    const kx = Math.cos(a[1] * this.kRad) * 111.321;
    const dx = (a[0] - b[0]) * kx;
    const dy = (a[1] - b[1]) * 111.139;
    return Math.sqrt((dx * dx) + (dy * dy)) * 1000;
  }
}

module.exports = RealTimeMovement;
