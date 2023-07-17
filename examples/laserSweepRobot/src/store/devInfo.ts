import _ from 'lodash';
import { getOssUrl } from '@api';
import { observable, action, computed, toJS } from 'mobx';

class DevInfoStore {
  @observable
  data = {};

  @observable
  staticPrefix = '';

  @computed
  get getData() {
    return toJS(this.data);
  }

  @computed
  get getStaticPrefix() {
    return this.staticPrefix;
  }

  @action
  setStaticPrefix = async (data: any) => {
    const panelCommonConfig = _.get(data, 'panelCommonConfig', '{}');
    const { staticPrefix }: any = panelCommonConfig ? JSON.parse(panelCommonConfig) : {};
    if (staticPrefix) {
      this.staticPrefix = staticPrefix;
    } else {
      this.staticPrefix = await getOssUrl();
    }
  };

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
