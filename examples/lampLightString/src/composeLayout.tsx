/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/require-default-props */
/* eslint-disable import/no-unresolved */
import React, { Component } from 'react';
import { NativeModules, View } from 'react-native';
import { Store } from 'redux';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme, DevInfo, Utils } from 'tuya-panel-kit';
import { Connect } from '@components';
import { actions, ReduxState } from '@models';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import dragonConfig from '@config/dragon';
import DpCodes from '@config/dpCodes';
import { ControlTabs, defaultLocalMusic } from '@config/default';
import * as MusicManager from '@utils/music';
import SmearFormater from '@config/dragons/SmearFormater';
import { CommonActions } from '@models/actions';
import * as TaskManager from '@utils/taskManager';
import { lampApi } from '@tuya/tuya-panel-api';
import { SupportUtils, WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { registerTheme } from '@config';
import _ from 'lodash';
import { RgbMusicValue } from '@types';

const { fetchLocalConfig, syncCloudConfig, fetchCloudConfig, saveCloudConfig } = lampApi.generalApi;
const { workModeCode, rgbSceneCode, rgbMusicCode, powerCode, smearCode, countdownCode } = DpCodes;
const smearFormater = new SmearFormater();
const { responseUpdateDp, updateLights } = CommonActions;
const { deepMerge } = Utils.ThemeUtils;

interface Props {
  devInfo: DevInfo;
  preload?: boolean;
}
interface IState {
  showPage: boolean;
}

interface ConnectedProps extends ReduxState {
  mapStateToProps: any;
}

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

// signmesh倒计时处理
let countdownTimer = 0;
export const countdownDo = (countdown: number) => {
  clearInterval(countdownTimer);
  if (countdown > 0) {
    countdownTimer = setInterval(() => {
      console.log('===countdown', countdown);
      // eslint-disable-next-line no-param-reassign
      countdown--;
      if (countdown === 0) {
        clearInterval(countdownTimer);
      }
      dragon.receiveDp({ countdown });
    }, 1000);
  }
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
};

const composeLayout = (store: Store, Comp: React.ComponentType<any>) => {
  const { dispatch } = store;

  const ThemeContainer = connect((props: ReduxState) => {
    // 可在@config/theme.ts文件下修改主题信息
    const defaultTheme = registerTheme();
    const res = deepMerge(props.theme, defaultTheme);
    return { theme: res };
  })(Theme);

  TYEvent.on('deviceDataChange', (data: any) => {
    switch (data.type) {
      case 'dpData':
        // 使用dragon库处理dp上报数据
        // eslint-disable-next-line no-case-declarations
        const { payload } = data;
        // countdownDo里面内置了一个dragon.receiveDp方法，不能共在handleUpdateDp方法中
        if (typeof payload[countdownCode] !== 'undefined') {
          countdownDo(payload.countdown);
        }
        // 是否有开关动作，如果有开关动作，则将倒计时清 0
        if (typeof payload[powerCode] !== 'undefined') {
          payload.countdown = 0;
          clearInterval(countdownTimer);
        }
        dragon.receiveDp(payload as any);
        break;
      default:
        dispatch(actions.common.deviceChange(data.payload as DevInfo));
        break;
    }
  });

  TYSdk.event.on('networkStateChange', data => {
    dispatch(actions.common.deviceChange(data as any));
  });

  /** 进入面板时更新redux */
  const initStates = async (store: Store, data: any) => {
    const { dispatch } = store;
    const smearData = smearFormater.parse(data.state[smearCode]);
    dispatch(
      actions.common.updateUi({
        ...smearData,
        showPageSetLampNums: false,
        ledNumber: 30,
      })
    );
  };

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
      <Connect mapStateToProps={_.identity}>
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
      </Connect>
    );
  };

  class PanelComponent extends Component<Props, IState> {
    constructor(props: Props) {
      super(props);
      this.state = {
        showPage: false,
      };
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then(data => {
          dispatch(actions.common.devInfoChange(data));
          this.initData(data);
        });
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo()
          .then(data => {
            dispatch(actions.common.devInfoChange(data));
            initStates(store, data);
            this.initData(TYSdk.devInfo);
          })
          .catch((e: Error) => {
            console.warn(e);
          });
      }
      this.subscribe();
    }

    componentDidMount() {
      if (TYSdk.__unInitializeDps) {
        dragon.receiveDp(TYSdk.__unInitializeDps);
      }
      if (SupportUtils.isSigMeshDevice()) {
        // sigmesh设备需要主动查询倒计时,用id查
        // getOneDpDataFromDevice(countdownCode);
      } else {
        const countdown = TYDevice.getState(countdownCode);
        if (typeof countdown !== 'undefined') {
          countdownDo(countdown);
        }
      }
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    async initData(devInfo: DevInfo) {
      // 注册dragon库
      this.initDragon(devInfo);
      // 获取本地数据
      const localData = await fetchLocalConfig!();
      if (localData) {
        this.handleCloudData(localData);
        // 同步数据
        syncCloudConfig!();
      } else {
        // 加载云端数据
        fetchCloudConfig!().then(cloudData => {
          this.handleCloudData(cloudData);
        });
      }
      this.setState({ showPage: true });
    }

    handleCloudData(cloudData: any) {
      const localMusicList: RgbMusicValue[] = _.cloneDeep(defaultLocalMusic);
      let collectedSceneIds: number[] = [];
      const { lights, totalCountDown } = cloudData;
      Object.entries(cloudData).forEach(([code, value]: [string, any]) => {
        // 本地音乐
        if (/^local_music_\d+$/.test(code) && value) {
          const id = +code.substr(12);
          for (let i = 0; i < localMusicList.length; i++) {
            if (localMusicList[i].id === id && value) {
              localMusicList[i] = value;
            }
          }
        }
        if (/^collectedSceneIds$/.test(code) && value) {
          collectedSceneIds = value;
        }
      });
      dispatch(
        actions.common.initCloud({
          lights: lights || [],
          collectedSceneIds: collectedSceneIds || [],
          localMusicList,
          totalCountDown: totalCountDown || 0,
        })
      );
      dispatch(actions.theme.updateTheme(registerTheme() as any));
    }

    updateLocalMusicData = _.throttle((data: RgbMusicValue) => {
      const { id } = data;
      dispatch(actions.common.updateLocalMusic(data));
      saveCloudConfig!(`local_music_${id}`, data);
    }, 500);

    initDragon(devInfo: DevInfo) {
      dragon.config({
        ...dragonConfig,
        checkCurrent: !SupportUtils.isGroupDevice(),
        // @ts-ignore
        schema: devInfo.schema,
      });
      dragon.onDpChange(this.handleDpChange);
      dragon.initDp(devInfo.state);
    }

    handleDpChange = (d: any) => {
      const {
        [workModeCode]: workMode,
        [rgbSceneCode]: rgbScene,
        [rgbMusicCode]: rgbMusic,
        [smearCode]: smear,
      } = d;
      if (typeof workMode !== 'undefined') {
        let showTab = workMode;
        if (workMode === WORK_MODE.COLOUR || workMode === WORK_MODE.WHITE) {
          showTab = ControlTabs.dimmer;
        }
        dispatch(actions.common.updateUi({ showTab }));
      }

      if (rgbMusic) {
        // 当设备主动上报更改本地音乐灵敏度后(如遥控器控制)，面板更新数据
        const { id, sensitivity } = rgbMusic as RgbMusicValue;
        const storeState = store.getState() as ReduxState;
        const currLocalMusicData = _.find(storeState.cloudState.localMusicList, { id });
        if (currLocalMusicData && currLocalMusicData.sensitivity !== sensitivity) {
          currLocalMusicData!.sensitivity = sensitivity;
          this.updateLocalMusicData(currLocalMusicData!);
          dispatch(responseUpdateDp({ [rgbMusicCode]: rgbMusic }));
        }
      }
      // 关灯 / 本地音乐开启 关闭app音乐
      if (
        (typeof d[powerCode] !== 'undefined' && !d[powerCode]) ||
        (!!rgbMusic && !!(rgbMusic as RgbMusicValue).power)
      ) {
        MusicManager.close();
      }
      // 处理涂抹dp
      if (smear) {
        dispatch(responseUpdateDp({ [smearCode]: smear }));
        // @ts-ignore
        dispatch(updateLights(smear, false));
      }
      dispatch(responseUpdateDp(d));
      // 互斥管理数据
      updateTaskData(d);
    };

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
