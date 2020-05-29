export default {
  setInstance(instance) {
    this.instance = instance;
  },
  changeColor(color, brightness) {
    this.instance && this.instance.setLightColor(color, brightness);
  },
};
