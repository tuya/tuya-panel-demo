import _ from 'lodash';
import { Store } from 'redux';
import { StatusBar, Platform } from 'react-native';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme, DevInfo, GlobalTheme } from 'tuya-panel-kit';
import dragon from '@tuya-rn/tuya-native-dragon';
import { withUIConfig } from '@tuya-rn/tuya-native-standard-hoc';
import { SupportUtils } from '@tuya-rn/tuya-native-lamp-elements/lib/utils/index';
import { ReduxState, DpState } from '@models/type';
import * as actions from '@actions';
import { getCorrectWorkMode } from '@utils';
import * as TaskManager from '@utils/taskManager';
import ErrorCatch from 'errorcatch';
import { dragonConfig, registerTheme } from '@config';
import DpCodes from '@config/dpCodes';
import * as MusicManager from '@utils/music';
import SmearFormater from '@config/dragon/SmearFormater';

import { Connect as ConnectComp } from './components';

const {
  CommonActions: {
    initializedConfig,
    initIoTConfig,
    initCloudConfig,
    initDpConfig,
    updateMiscConfig,
    deviceChange,
    asyncDevInfoChange,
    updateUI,
    updateDp,
    asyncUpdateDp,
    getCloudStates,
  },
  ThemeActions: { updateTheme },
} = actions;
const {
  workModeCode,
  smearCode,
  powerCode,
  musicCode,
  micMusicCode,
  countdownCode,
  sleepCode,
  wakeupCode,
} = DpCodes;
const smearFormater = new SmearFormater();

// 倒计时处理
let countdownTimer = 0;

/** 进入面板时更新redux */
const initStates = async (store: Store, data: any) => {
  const { dispatch } = store;
  const smearData = smearFormater.parse(data.state[smearCode]);
  dispatch(updateUI({ smearMode: smearData.smearMode }));
  // @ts-ignore wtf
  await dispatch(getCloudStates());
};

// 互斥任务管理
export const updateTaskData = (dpState: any) => {
  const { TaskType } = TaskManager;

  // 倒计时
  if (typeof dpState[countdownCode] !== 'undefined') {
    TaskManager.remove(TaskType.COUNTDOWN);
    if (dpState[countdownCode] > 0) {
      TaskManager.add(dpState[countdownCode], TaskType.COUNTDOWN, 'second');
    }
  }
  // // 入睡
  // if (typeof dpState[sleepCode] !== 'undefined') {
  //   const sleepData: SleepData = dpState[sleepCode];
  //   TaskManager.remove(TaskType.SLEEP_TIMING);
  //   sleepData.nodes.forEach(({ power, weeks, delay, hour, minute }, index) => {
  //     const startTime = hour * 60 + minute;
  //     const endTime = startTime + delay * 5;
  //     power && TaskManager.add({ id: index, weeks, startTime, endTime }, TaskType.SLEEP_TIMING);
  //   });
  // }
  // // 唤醒
  // if (typeof dpState[wakeupCode] !== 'undefined') {
  //   const wakeupData: WakeupData = dpState[wakeupCode];
  //   TaskManager.remove(TaskType.WAKEUP_TIMING);
  //   wakeupData.nodes.forEach(({ power, weeks, delay, hour, minute, last }, index) => {
  //     const setTime = hour * 60 + minute;
  //     const endTime = setTime + last * 5;
  //     let startTime = setTime - delay * 5;
  //     if (startTime < 0) {
  //       startTime += 1440;
  //     }
  //     power && TaskManager.add({ id: index, weeks, startTime, endTime }, TaskType.WAKEUP_TIMING);
  //   });
  // }
};

interface Props {
  devInfo: DevInfo;
  preload?: boolean;
}

interface ConnectedProps extends ReduxState {
  mapStateToProps: any;
}

const { event: TYEvent, device: TYDevice } = TYSdk;

const composeLayout = (store: Store, Comp: React.ComponentType) => {
  const { dispatch } = store;

  const ThemeContainer = connect((props: { theme: GlobalTheme }) => ({ theme: props.theme }))(
    Theme
  );

  const NavigatorLayout = () => {
    return (
      <ConnectComp mapStateToProps={_.identity}>
        {({ mapStateToProps, ...props }: ConnectedProps) => {
          const { panelConfig, dpState } = props;
          const hasInit = Object.keys(dpState).length > 0 && panelConfig.initialized;
          // eslint-disable-next-line react/jsx-props-no-spreading
          return hasInit ? <Comp {...props} /> : null;
        }}
      </ConnectComp>
    );
  };

  const NavigatorLayoutContainer = withUIConfig({
    /**
     * @desc
     * 首次拿到devInfo时触发,
     * 这里返回的对象会在引入 containers 前塞入 Config.
     *
     * @param {Object} - devInfo
     *
     * @return {Object} - something inject to Config
     */
    onInit: () => null,
    /**
     * @desc
     * 拉取到云端配置并塞入Config时触发,
     * 此时 containers 已经载入了.
     *
     * @param {Object} - Config
     * @param {Object} - devInfo
     * @param {String} - source(配置来源) - one of ['default', 'cloud', 'cache']
     *
     * @return {Object} - something inject to Config
     */
    onApplyConfig: (config, devInfo, source) => {
      const showSchedule = config.cloudFun.timer ? !!config.cloudFun.timer.selected : false;
      dispatch(initializedConfig());
      dispatch(initIoTConfig(config.iot));
      dispatch(initCloudConfig(config.cloudFun));
      dispatch(initDpConfig(config.dpFun));
      dispatch(updateMiscConfig({ ...config.misc, showSchedule }));
      // theme
      const theme = registerTheme(config.iot);
      StatusBar.setBarStyle(
        theme.isDarkTheme ? 'light-content' : Platform.OS === 'ios' ? 'dark-content' : 'default'
      );
      // @ts-ignore wtf
      dispatch(updateTheme(theme));
    },
  })(NavigatorLayout);

  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        // eslint-disable-next-line no-case-declarations
        const paylaod = data.payload as any;
        // 是否有开关动作，如果有开关动作，则将倒计时清 0
        if (typeof paylaod[powerCode] !== 'undefined') {
          paylaod[countdownCode] = 0;
          clearInterval(countdownTimer);
        }
        dragon.receiveDp(paylaod);
        break;
      default:
        dispatch(deviceChange(data.payload as DevInfo));
        break;
    }
  });

  TYEvent.on('networkStateChange', data => {
    dispatch(deviceChange(data as any));
  });

  class PanelComponent extends Component<Props> {
    constructor(props: Props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo()
          .then(data => {
            dispatch(asyncDevInfoChange(data));
            return initStates(store, data);
          })
          .then(() => {
            this.initData(TYSdk.devInfo);
          });
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo()
          .then(data => {
            dispatch(asyncDevInfoChange(data));
            return initStates(store, data);
          })
          .then(() => {
            this.initData(TYSdk.devInfo);
          })
          .catch((e: Error) => {
            console.warn(e);
          });
      }
    }

    componentDidMount() {
      if (TYSdk.__unInitializeDps) {
        dragon.receiveDp(TYSdk.__unInitializeDps);
      }
    }

    async initData(devInfo: DevInfo) {
      this.initDragon(devInfo);
      // 获取本地数据
      // const cloudData = await LampApi.fetchLocalConfig!();
      // if (cloudData) {
      //   this.handleCloudData(cloudData);
      //   // 同步数据
      //   LampApi.syncCloudConfig!();
      // } else {
      //   // todo show loading
      //   // 加载云端配置
      //   LampApi.fetchCloudConfig!().then(cloudData => {
      //     this.handleCloudData(cloudData);
      //   });
      // }
    }

    // handleCloudData(cloudData: any) {
    //   const scenes: SceneDataType[] = [];
    //   Object.entries(cloudData).forEach(([code, value]: [string, any]) => {
    //     // 情景
    //     if (/^scene_\d+$/.test(code) && value) {
    //       const id = +code.substr(6);
    //       const sceneData = { sceneId: id, ...value };
    //       scenes.push(sceneData);
    //     }
    //   });
    //   scenes.sort((a: SceneDataType, b: SceneDataType) => (a.addTime > b.addTime ? 1 : -1));
    //   console.log('handleCloudData', scenes);
    //   // dispatch(updateUI({ scenes }));
    // }

    countdownDo = (countdown: number) => {
      clearInterval(countdownTimer);
      if (!countdown) return;
      countdownTimer = setInterval(() => {
        // eslint-disable-next-line no-param-reassign
        countdown--;
        if (countdown === 0) clearInterval(countdownTimer);
        dispatch(updateDp({ [countdownCode]: countdown }));
      }, 1000);
    };

    handleUpdateDp = (d: DpState) => {
      // 关灯 / 本地音乐开启 关闭app音乐
      if (
        (typeof d[powerCode] !== 'undefined' && !d[powerCode]) ||
        (!!d[micMusicCode] && !!(d[micMusicCode] as LocalMusicValue).power)
      ) {
        MusicManager.close();
      }

      const state = store.getState();
      const { dpState } = state;
      if (
        dpState[workModeCode] === 'music' &&
        d[workModeCode] &&
        dpState[workModeCode] !== d[workModeCode]
      ) {
        // app音乐关闭
        MusicManager.close();
      }
      if (typeof d[countdownCode] !== 'undefined') {
        this.countdownDo(d[countdownCode]);
      }

      const workMode = d[workModeCode];
      // 校正workMode
      if (workMode !== undefined) {
        const correctWorkMode = getCorrectWorkMode(workMode);
        if (workMode !== correctWorkMode) dragon.putDpData({ [workModeCode]: correctWorkMode });
      }
      // @ts-ignore wtf
      dispatch(asyncUpdateDp(d));
      // 互斥管理数据
      updateTaskData(d);
    };

    initDragon = (devInfo: DevInfo) => {
      dragon.config({
        ...dragonConfig,
        checkCurrent: !SupportUtils.isGroupDevice(),
        // @ts-ignore wtf
        schema: devInfo.schema,
      });
      dragon.onDpChange(this.handleUpdateDp);
      dragon.initDp(devInfo.state);
      dragon.onDpSendBefore((data: any, originData: any) => {
        // 修改模式，下发非音乐dp，关灯时，停止音乐
        if (originData[workModeCode] === 'music') {
          const keys: string[] = Object.keys(data);
          if (data[workModeCode] && data[workModeCode] !== 'music') {
            MusicManager.close();
          }
        }
        if (typeof data[powerCode] !== 'undefined' && !data[powerCode]) {
          MusicManager.close();
        }
      });
    };

    render() {
      const { devInfo } = this.props;
      return (
        <ErrorCatch>
          <Provider store={store}>
            <ThemeContainer>
              <NavigatorLayoutContainer devInfo={devInfo} />
            </ThemeContainer>
          </Provider>
        </ErrorCatch>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;
