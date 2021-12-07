import { observable, action, computed, toJS } from 'mobx';

class CustomConfigStore {
  @observable
  data = {};

  @computed
  get store() {
    return toJS(this.data);
  }

  @action
  setCustomConfig = async (data: any) => {
    this.data = { ...this.data, ...data };
  };

  @action
  clearCustomConfig = async () => {
    this.data = {};
  };
}

export default CustomConfigStore;
