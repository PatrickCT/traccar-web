/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const handler = {
  get(target, key) {
    if (typeof target[key] === 'object' && target[key] !== null) {
      return new Proxy(target[key], handler);
    }
    return target[key];
  },
  set(target, prop, value) {
    const equal = window.isEqual(target[prop], value);
    console.log(`changed ${prop} from ${window.propPrint(target[prop])} to ${window.propPrint(value)}, equal: ${equal}`);
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
  constructor() {
    this.playing = false;
    this.positions = [];
    this.interval = null;
    this.device = null;
    this.pos = new FixedSizeArray(2, () => { this.generatePositions(); });
    // this._app = new Proxy({ positions: new FixedSizeArray(2, () => { this.generatePositions(); }) }, handler);
  }

  updateSelectedPosition(p) {
    if (p === undefined || p === null) {
      this.reset();
      return;
    }
    if (p.deviceId === this.device) {
      this.pos.push(p);
      if (this.pos.array.length === 1) {
        this.show(p);
      }
    } else {
      this.reset();
      this.device = p.deviceId;
      this.pos.push(p);
      if (this.pos.array.length === 1) {
        this.show(p);
      }
    }
  }

  reset() {
    this.pos.reset();
    this.device = null;
    this.playing = false;
    this.positions = [];
    clearInterval(this.interval);
  }

  show(position) {
    window.map.getSource('realTime').setData(window.dataGenerator([position]));
    if (window.localStorage.getItem('showMapPopup') === 'true') {
      window.rtmPopUp(position);
    }
  }

  get(prop) { return this[prop]; }

  set(prop, value) { this[prop] = value; }

  generatePositions() {
    clearInterval(this.interval);
    this.playing = false;
    this.positions = [];
    const p = [...this.pos.array];
    const positions = [];

    p.forEach((position, index) => {
      positions.push({ ...position, original: true });
      if (index < p.length - 1) {
        const distance = window.turf.distance(window.turf.point([p[index].longitude, p[index].latitude]), window.turf.point([p[index + 1].longitude, p[index + 1].latitude]), { units: 'meters' });
        if (parseInt(distance, 10) > 0) {
          const steps = parseInt(distance / 2, 10);
          let fillers = [];
          for (let i = 0; i < steps; i += 1) {
            const point = window.turf.along(window.turf.lineString([[p[index].longitude, p[index].latitude], [p[index + 1].longitude, p[index + 1].latitude]]), ((i + 1) * 2), { units: 'meters' });
            fillers.push({ ...position, original: false, longitude: point.geometry.coordinates[0], latitude: point.geometry.coordinates[1] });
          }
          const fillerCourse = (fillers.reduce((acc, obj) => acc + parseFloat(obj.course ?? ''), 0) / fillers.length);
          fillers = fillers.map((filler) => ({ ...filler, course: fillerCourse }));
          positions.push(...fillers);
        }
      }
    });
    this.positions.push(...positions);
    this.play();
  }

  async play() {
    this.interval = setInterval(async () => {
      requestAnimationFrame(async () => {
        this.show(this.positions[0]);
        this.positions.shift();
        if (this.positions.length <= 0) {
          this.playing = false;
          clearInterval(this.interval);
        }
        // await window.sleep(10);
      });
    }, 25);
  }

  stop() {
    this.playing = false;
    clearInterval(this.interval);
  }
}

module.exports = RealTimeMovement;
