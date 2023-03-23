import _ from 'lodash';
import { Store } from 'redux';
import { NativeModules, View } from 'react-native';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme, DevInfo, Utils } from 'tuya-panel-kit';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { lampApi } from '@tuya/tuya-panel-api';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { ReduxState, DpState } from '@models/type';
import * as actions from '@actions';
import { getCorrectWorkMode } from '@utils';
import * as TaskManager from '@utils/taskManager';
import ErrorCatch from 'errorcatch';
import { dragonConfig, registerTheme } from '@config';
import { defaultLocalMusic } from '@config/default';
import DpCodes from '@config/dpCodes';
import * as MusicManager from '@utils/music';
import SmearFormater from '@config/dragon/SmearFormater';
import { Connect as ConnectComp } from './components';

interface Props {
  devInfo: DevInfo;
  preload?: boolean;
}
interface IState {
  showPage: boolean;
}
const { deepMerge } = Utils.ThemeUtils;
const {
  CommonActions: {
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

  const ThemeContainer = connect((props: ReduxState) => {
    // 可在@config/theme.ts文件下修改主题信息
    const defaultTheme = registerTheme();
    const res = deepMerge(props.theme, defaultTheme);
    return { theme: res };
  })(Theme);

  const NavigatorLayout: React.FC<Props> = p => {
    React.useEffect(() => {
      const { TYRCTIoTCardManager } = NativeModules;
      if (TYRCTIoTCardManager && typeof TYRCTIoTCardManager.ioTcardRechargeHander === 'function') {
        TYRCTIoTCardManager.ioTcardRechargeHander(p.devInfo.devId, () => {
          console.log('ioTcardRechargeHander callback');
        });
      }
    }, []);
    return (
      <ConnectComp mapStateToProps={_.identity}>
        {({ mapStateToProps, ...props }: ConnectedProps) => {
          const { dpState } = props;
          if (Object.keys(props.devInfo.schema).length === 0) {
            console.warn(
              '当前设备不存在功能点，模板会白屏状态，如为正常需求，请自行删除此处判断逻辑'
            );
          }
          const hasInit = Object.keys(dpState).length > 0;
          // eslint-disable-next-line react/jsx-props-no-spreading
          return hasInit ? <Comp {...props} /> : null;
        }}
      </ConnectComp>
    );
  };
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
      this.state = {
        showPage: false,
      };
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
      console.log('===devInfo===', devInfo);
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
      this.setState({ showPage: true });
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

    handleCloudData(cloudData: any) {
      dispatch(updateTheme(registerTheme() as any));
    }

    subscribe() {
      // 同步数据事件
      TYEvent.on('beginSyncCloudData', this._handleBeginSyncCloudData);
      TYEvent.on('endSyncCloudData', this._handleEndSyncCloudData);
      TYEvent.on('syncCloudDataError', this._handleErrorSyncCloudData);
    }

    unsubscribe() {
      TYEvent.remove('beginSyncCloudData', this._handleBeginSyncCloudData);
      TYEvent.remove('endSyncCloudData', this._handleEndSyncCloudData);
      TYEvent.remove('syncCloudDataError', this._handleErrorSyncCloudData);
    }

    _handleBeginSyncCloudData = (data: any) => {
      console.log('开始同步数据');
    };

    _handleEndSyncCloudData = (data: any) => {
      console.log('结束同步数据');
      this.handleCloudData(data);
    };

    _handleErrorSyncCloudData = (data: any) => {
      console.log('同步失败数据');
    };

    render() {
      const { devInfo } = this.props;
      const { showPage } = this.state;
      if (!showPage) {
        return <View style={{ flex: 1 }} />;
      }
      return (
        <Provider store={store}>
          <ThemeContainer>
            <NavigatorLayout devInfo={devInfo} />
          </ThemeContainer>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;
