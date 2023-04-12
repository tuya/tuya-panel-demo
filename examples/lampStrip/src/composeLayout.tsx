/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/require-default-props */
import _ from 'lodash';
import { Store } from 'redux';
import { NativeModules, View } from 'react-native';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme, DevInfo, Utils } from 'tuya-panel-kit';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { ReduxState, DpState } from '@models/type';
import * as actions from '@actions';
import { getCorrectWorkMode } from '@utils';
import * as TaskManager from '@utils/taskManager';
import { dragonConfig, registerTheme } from '@config';
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

// Countdown processing
let countdownTimer = 0;

/** Update redux when entering the panel */
const initStates = async (store: Store, data: any) => {
  const { dispatch } = store;
  const smearData = smearFormater.parse(data.state[smearCode]);
  dispatch(updateUI({ smearMode: smearData.smearMode }));
  // @ts-ignore wtf
  await dispatch(getCloudStates());
};

// Mutual exclusion task management
export const updateTaskData = (dpState: any) => {
  const { TaskType } = TaskManager;

  // Countdown
  if (typeof dpState[countdownCode] !== 'undefined') {
    TaskManager.remove(TaskType.COUNTDOWN);
    if (dpState[countdownCode] > 0) {
      TaskManager.add(dpState[countdownCode], TaskType.COUNTDOWN, 'second');
    }
  }
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
    // You can modify the theme information in the @config/theme.ts file
    const defaultTheme = registerTheme();
    const res = deepMerge(props.theme, defaultTheme);
    return { theme: res };
  })(Theme);

  const NavigatorLayout: React.FC<Props> = p => {
    React.useEffect(() => {
      const { TYRCTIoTCardManager } = NativeModules;
      const { devInfo } = p;
      if (TYRCTIoTCardManager && typeof TYRCTIoTCardManager.ioTcardRechargeHander === 'function') {
        TYRCTIoTCardManager.ioTcardRechargeHander(devInfo.devId, () => {
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
              'The current device does not have a function point, the template will be in a white screen state, if it is a normal requirement, please delete this judgment logic by yourself'
            );
          }
          const hasInit = Object.keys(dpState).length > 0;
          // @ts-ignore
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
        // Is there a switch action? If there is a switch action, set the countdown to 0
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

  class PanelComponent extends Component<Props, IState> {
    constructor(props: Props) {
      super(props);
      this.state = {
        showPage: false,
      };
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo()
          .then(data => {
            // @ts-ignore
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
            // @ts-ignore
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
      this.setState({ showPage: true });
    }

    countdownDo = (countdown: number) => {
      clearInterval(countdownTimer);
      if (!countdown) return;
      countdownTimer = setInterval(() => {
        // eslint-disable-next-line no-param-reassign
        countdown--;
        if (countdown === 0) clearInterval(countdownTimer);
        // @ts-ignore
        dispatch(updateDp({ [countdownCode]: countdown }));
      }, 1000);
    };

    handleUpdateDp = (d: DpState) => {
      // Turn off the light / turn on local music and turn off app music
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
        // Turn off app music
        MusicManager.close();
      }
      if (typeof d[countdownCode] !== 'undefined') {
        this.countdownDo(d[countdownCode]);
      }

      const workMode = d[workModeCode];
      // Correct workMode
      if (workMode !== undefined) {
        const correctWorkMode = getCorrectWorkMode(workMode);
        if (workMode !== correctWorkMode) dragon.putDpData({ [workModeCode]: correctWorkMode });
      }
      // @ts-ignore wtf
      dispatch(asyncUpdateDp(d));
      // Mutual exclusion management data
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
        // Modify the mode, send non-music dp, turn off the light, and stop the music
        if (originData[workModeCode] === 'music') {
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
      // Synchronize data events
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
      console.log('Start synchronizing data');
    };

    _handleEndSyncCloudData = (data: any) => {
      console.log('End data synchronization');
      this.handleCloudData(data);
    };

    _handleErrorSyncCloudData = (data: any) => {
      console.log('Synchronization failure data');
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
