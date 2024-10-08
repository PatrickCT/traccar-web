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
  constructor(device, position, id, configs) {
    this.marker = null;
    this.counter = 0;
    this.positions = [];
    this.position = null;
    this.animationFrame = null;
    this.init(position);
  }

  init(p) {
    this.position = p;
    const arrowRotation = p.course;
    const markerBase = `
        <div
            class="custom-marker"
        >
        <img class="marker-background" src = "https://t-urban.com.mx/static/media/background.f4cd77df5310c8f042e5edfd82443318.svg" alt=""/>
            <img src="https://t-urban.com.mx/static/media/default.76fc53545ca53bf1d96addbf8dcc6cc7.svg" class="marker-icon" />
            <img
            src="https://t-urban.com.mx/static/media/direction.8ac40f7fc00f194fa684ff21f42d3276.svg"
            class="marker-arrow"
            style="transform: rotate(${arrowRotation}deg)"
            />
        </div>
      `;

    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = markerBase;
    el.style.width = '48px';
    el.style.height = '48px';

    this.marker = new window.Marker({ element: el, clickTolerance: 100 }).setLngLat([p.longitude, p.latitude]).addTo(window.map);
    this.marker._element.addEventListener('click', () => {
      window.rtmPopUp(this.position);
    });
    window.markers.push(this);
    this.updateSelectedPosition(p);
  }

  updateSelectedPosition(position) {
    this.marker.setLngLat([position.longitude, position.latitude]);
    // const positions = [];
    // const p = this.positions.pop() || position;
    // const distance = parseInt(this.fastDistance([p.longitude, p.latitude], [position.longitude, position.latitude]), 10);
    // if (distance > 0) {
    //   const steps = parseInt(distance / 2, 10);
    //   let fillers = [];
    //   for (let i = 0; i < steps; i += 1) {
    //     const point = window.turf.along(window.turf.lineString([[p.longitude, p.latitude], [position.longitude, position.latitude]]), ((i + 1) * 2), { units: 'meters' });
    //     fillers.push({ ...position, original: false, longitude: point?.geometry.coordinates[0], latitude: point?.geometry.coordinates[1] });
    //   }
    //   const fillerCourse = (fillers.reduce((acc, obj) => acc + parseFloat(obj.course ?? ''), 0) / fillers.length);
    //   fillers = fillers.map((filler) => ({ ...filler, course: fillerCourse }));
    //   positions.push(...fillers);
    // }
    // positions.push({ ...p, original: true });
    // positions.push({ ...position, original: true });
    // this.positions.push(...positions);
    // requestAnimationFrame(this.animateMarker);
  }

  animateMarker(timestamp) {
    try {
      const index = Math.round(timestamp / 1000);

      if (index > this.positions.length) {
        cancelAnimationFrame(this.animationFrame);
        this.positions = [];
        return;
      }
      // Update the data to a new position based on the animation timestamp. The
      // divisor in the expression `timestamp / 1000` controls the animation speed.

      this.marker.setLngLat([this.positions[index].longitude, this.positions[index].latitude]);
      this.position = this.positions[index];
      // Ensure it's added to the map. This is safe to call if it's already added.
      this.marker.addTo(map);

      // Request the next frame of the animation.
      this.animationFrame = requestAnimationFrame(this.animateMarker);
    } catch (error) {
      console.warn(error);
    }
  }

  fastDistance(a, b) {
    const kx = Math.cos(a[1] * this.kRad) * 111.321;
    const dx = (a[0] - b[0]) * kx;
    const dy = (a[1] - b[1]) * 111.139;
    return Math.sqrt((dx * dx) + (dy * dy)) * 1000;
  }
}

module.exports = RealTimeMovement;
