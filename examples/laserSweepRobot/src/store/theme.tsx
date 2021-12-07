import { observable, action, computed, toJS } from 'mobx';
import themeData from '../config/default/theme';

class ThemeStore {
  @observable
  data = { ...themeData };

  @action
  setData = newData => {
    const s = { ...this.data, ...newData };
    this.data = s;
  };

  @computed
  get getData() {
    return toJS(this.data);
  }
}

export default ThemeStore;
