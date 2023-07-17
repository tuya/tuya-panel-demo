import React, { Component } from 'react';
import { Provider, inject } from 'mobx-react';
import { TYSdk, Theme } from 'tuya-panel-kit';
import { toJS } from 'mobx';

const composeLayout = (store, component) => {
  const ThemeContainer = inject(({ theme }) => {
    return { theme: toJS(theme.data) };
  })(Theme);

  const NavigatorLayoutContainer = inject(({ devInfo }) => ({
    devInfo: devInfo.data,
  }))(component);

  TYSdk.event.on('networkStateChange', data => {
    store.devInfo.listenDevChangeState({ ...data, appOnline: data.appOnline });
  });
  TYSdk.event.on('deviceDataChange', data => {
    const { type, payload } = data;
    switch (type) {
      case 'dpData': {
        store.dpState.listenDpChangeState(payload);
        break;
      }
      case 'devInfo':
        store.devInfo.listenDevChangeState(payload);
        break;
      case 'deviceOnline':
        store.devInfo.listenDevChangeState({ ...data, deviceOnline: payload });
        break;
      default:
        break;
    }
  });

  interface IMap {
    [index: string]: string | number;
  }
  interface IProps {
    devInfo?: IMap;
  }

  class PanelComponent extends Component<IProps> {
    constructor(props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        // storageCache.init(props.devInfo).catch(e => console.warn('storageCache.init', e));
        TYSdk.device.setDeviceInfo(props.devInfo);
        TYSdk.device.getDeviceInfo().then(data => {
          store.devInfo.changeDevInfo(data);
          store.dpState.initDpState(data.state);
        });
        // 更新静态资源信息
        store.devInfo.setStaticPrefix(props.devInfo);
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYSdk.device.getDeviceInfo().then(data => {
          store.devInfo.changeDevInfo(data);
          store.dpState.initDpState(data.state);
        });
      }
    }

    render() {
      return (
        <Provider {...store}>
          <ThemeContainer>
            <NavigatorLayoutContainer />
          </ThemeContainer>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;
