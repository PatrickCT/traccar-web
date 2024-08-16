/* eslint-disable arrow-parens */
/* eslint-disable no-underscore-dangle */
class SharedDataSource {
  constructor(map, sourceId) {
    this.map = map;
    this.sourceId = sourceId;
    this.data = { ...map.getSource(sourceId)._data }; // Initialize with current data
    this.updateQueue = [];
    this.interval = null;
    this.animationFrame = null;
    this.startBatchUpdate();
  }

  addUpdate(position) {
    if (!position) return;

    const newFeature = window.dataGenerator([position], window.devices).features[0];

    this.data.features = this.data.features.filter((value, index, self) => index === self.findIndex((item) => item.properties.deviceId === value.properties.deviceId));
    const index = this.data.features.findIndex((f) => f?.properties?.deviceId === this.device);
    if (index !== -1) {
      this.data.features[index] = newFeature;
    } else {
      this.data.features.push(newFeature);
    }
    this.startBatchUpdate();
  }

  startBatchUpdate() {
    if (this.interval !== null) return;
    this.interval = setInterval(() => {
      window.map?.getSource(window.id)?.setData(this.data);
    }, 1000); // Update 60 times per second
    this.animate();
  }

  animate() {
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationFrame);
    this.interval = null;
  }
}

module.exports = SharedDataSource;
