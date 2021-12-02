import { observable, action, computed, toJS } from 'mobx';

class DpStateStore {
  @observable
  data = {};

  @computed
  get getData() {
    return toJS(this.data);
  }

  @action
  initDpState = data => {
    this.data = data;
  };

  @action
  listenDpChangeState = async data => {
    this.data = { ...this.data, ...data };
  };
}

export default DpStateStore;
