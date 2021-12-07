import { observable, action, computed, toJS } from 'mobx';

class DevInfoStore {
  @observable
  data = {};

  @computed
  get getData() {
    return toJS(this.data);
  }

  @action
  changeDevInfo = data => {
    this.data = data;
  };

  @action
  listenDevChangeState = async data => {
    this.data = { ...this.data, ...data };
  };
}
export default DevInfoStore;
