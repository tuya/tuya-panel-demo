import _ from 'lodash';
import { observable, action, computed, toJS } from 'mobx';

class MapStore {
  @observable
  data = {};

  @action
  setData = (newData: any) => {
    this.data = newData;
  };

  @computed
  get getData() {
    return toJS(this.data);
  }
}

export default MapStore;
