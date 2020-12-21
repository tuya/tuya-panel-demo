import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TYSdk, DevInfo, Popup, Dialog, Utils, Toast } from 'tuya-panel-kit';
import { bindActionCreators } from 'redux';
import Strings from '../i18n';
import SwitchList from '../components/switchList';
import HeadTop from '../components/headBar';
import { setUserOpen } from '../models/modules/userInfo';
import dpCodeConfig from '../config/dpCodes';
import { settingListItem } from '../config/constant';
import Loading from '../components/loading';
import apiRequestHandle from '../api';
const { convertX } = Utils.RatioUtils;
const { width } = Dimensions.get('window');

interface SettingState {
  showLoading: boolean;
  status: string;
  data: any;
  automaticLock: boolean;
  autoLockTime: number;
  startTime: number;
  endTime: number;
  remoteOpen: boolean;
}
interface SettingProps {
  automaticLock: boolean;
  autoLockTime: number;
  setUserOpen: (item: any) => {};
  userOpenJurisdiction: userOpenJurisdiction;
  devInfo: any;
}
class Setting extends Component<SettingProps, SettingState> {
  static propType = {
    automaticLock: PropTypes.bool,
    autoLockTime: PropTypes.number,
  };

  static defaultProps = {
    automaticLock: false,
    autoLockTime: 0,
    userOpenJurisdiction: {
      remoteOpenState: {
        way: '',
        user: 'all',
      },
      remoteOpen: false,
    },
  };
  time: any;
  unlockVoiceRemote: any;
  timerId: string;
  offset: number;
  unlockKeyWarn: any;
  listen: any;
  listenError: any;

  needList: string[][];
  flag: string;
  constructor(props: any) {
    super(props);

    this.state = {
      automaticLock: this.props.automaticLock,
      autoLockTime: this.props.autoLockTime,
      startTime: 0,
      endTime: 0,
      data: [],
      remoteOpen: false,
      status: 'none',
      showLoading: false,
    };

    this.timerId = '';
    this.offset = 0;
    this.needList = [];
  }
  async componentDidMount() {
    TYSdk.event.on('dpDataChange', this.handleDataChange);
    this.needList = settingListItem.map((element: string[]) =>
      element.filter((item: string) => {
        if (item === dpCodeConfig.remoteNoPswSet) {
          return (
            !!TYSdk.device.getDpSchema(item) ||
            !!TYSdk.device.getDpSchema(dpCodeConfig.remoteHasPsw)
          );
        } else {
          return TYSdk.device.getDpSchema(item);
        }
      })
    );
    this.getData(this.props);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps !== this.props) {
      this.getData(nextProps);
    }
  }

  componentWillUnmount() {
    TYSdk.event.off('dpDataChange', this.handleDataChange);
  }
  handleDataChange = () => {
    if (typeof this.time !== 'undefined' && this.time !== null) {
      clearTimeout(this.time);
      this.setState({
        showLoading: false,
      });
    }
  };
  handlePutDpData = (key: any, value: any) => {
    TYSdk.device.putDeviceData({
      [key]: value,
    });
    this.setState({
      showLoading: true,
    });
    if (typeof this.time === 'undefined' || this.time === null) {
      this.time = setTimeout(() => {
        this.setState({
          showLoading: false,
        });
      }, 15000);
    }
  };

  choiceList = (item: string, value: any) => {
    const isLocalOnline = this.props.devInfo.deviceOnline;
    if (!isLocalOnline) {
      //离线 不进行 提示自行添加对应提示方式
      return;
    }

    const { range } = TYSdk.device.getDpSchema(item);
    if (range) {
      const data = range.map((element: any) => {
        return {
          label: Strings.getLang(item + '_' + element),
          value: element,
        };
      });
      Popup.picker({
        dataSource: data,
        title: Strings.getLang(item + '_title'),
        cancelText: Strings.getLang('cancel'),
        confirmText: Strings.getLang('confirm'),
        value,
        onConfirm: (v: any) => {
          this.handlePutDpData(item, v);
          Popup.close();
        },
      });
    }
  };
  automaticLock = (item: string, value: string) => {
    const { max } = TYSdk.device.getDpSchema(item);
    Popup.countdown({
      title: Strings.getLang(item + '_title'),
      max,
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      hourText: Strings.getLang('hour'),
      minuteText: Strings.getLang('minute'),
      value: this.props[value],
      onConfirm: (v: any) => {
        this.handlePutDpData(item, v.value);
        Popup.close();
      },
    });
  };
  handle = (value: boolean, handleObj: any) => {
    if (value) {
      //开启手势密码
      handleObj.createOrOpen();
    } else {
      handleObj.close('needCheck');
    }
  };
  edit = (handleObj: any) => {
    handleObj.edit();
  };
  getData = (props: any) => {
    const { autoLockTime, motorTorque, userOpenJurisdiction, automaticLock, devInfo } = props;

    const isLocalOnline = devInfo.deviceOnline;

    const dpPropList = {
      [dpCodeConfig.bellVolume]: 'bellVolume',
      [dpCodeConfig.keyTone]: 'keyTone',
      [dpCodeConfig.beepVolume]: 'beepVolume',
      [dpCodeConfig.language]: 'language',
    };
    let data = this.needList.map((item: string[]) => {
      const dataItem = item.map(element => {
        if (element === dpCodeConfig.remoteNoPswSet || element === dpCodeConfig.remoteHasPsw) {
          return {
            key: 'remoteOpen',
            title: Strings.getLang('remoteOpen' + 'Title'),
            type: 'switch',
            switchValue: userOpenJurisdiction.remoteOpen,
            onSwitch: async (value: any) => {
              if (!value && this.unlockVoiceRemote) {
                Dialog.confirm({
                  title: Strings.getLang('closeRemoteTitle'),
                  subTitle: Strings.getLang('closeRemoteTip'),
                  cancelText: Strings.getLang('cancel'),
                  confirmText: Strings.getLang('confirm'),
                  onConfirm: async () => {
                    try {
                      await apiRequestHandle.fetchDpSave({
                        isRemoteOpen: value,
                      });
                      const result = await apiRequestHandle.fetchDp('isRemoteOpen');
                      if (typeof result === 'object') {
                        this.props.setUserOpen({
                          remoteOpen: result.isRemoteOpen.toString() === 'true',
                        });
                      }
                      Dialog.close();
                    } catch (error) {
                      console.log(error);
                    }
                  },
                });
              } else {
                try {
                  await apiRequestHandle.fetchDpSave({
                    isRemoteOpen: value,
                    // remoteOpenState: value.remoteOpenState,
                  });
                  const result = await apiRequestHandle.fetchDp('isRemoteOpen');
                  if (typeof result === 'object') {
                    this.props.setUserOpen({
                      ...result,
                      remoteOpenState: {
                        way: '',
                        user: 'all',
                      }, //remoteOpenState 值目前固定 因为没有涉及到开门方式的选择 或者是权限选择 ，使用者可以根据情况使用具体字段 ，目前user是权限 为全体用户
                      remoteOpen: result.isRemoteOpen.toString() === 'true',
                    });
                  }
                } catch (error) {
                  console.log(error);
                }
              }
              this.getData(this.props);
            },
          };
        }

        if (element === dpCodeConfig.automaticLock) {
          return {
            key: 'automaticLock',
            title: Strings.getLang('automaticLockTitle'),
            tip: Strings.getLang('automaticLockTip'),
            clickTitle: Strings.getLang('automaticLockTriggerTitle'),
            type: 'switchAndClick',
            choiceValue:
              _.padStart(Math.floor(autoLockTime / 60).toString(), 2, '0') +
              ':' +
              _.padStart((autoLockTime % 60).toString(), 2, '0'),
            switchValue: automaticLock,
            onClick: () => this.automaticLock(dpCodeConfig.autoLockTime, 'autoLockTime'),
            onSwitch: (value: any) => {
              if (!isLocalOnline) {
                //离线 不进行 提示自行添加对应提示方式
                return;
              }
              this.handlePutDpData(dpCodeConfig.automaticLock, value);
            },
          };
        }
        if (
          ['bellVolume', 'keyTone', 'beepVolume', 'language'].findIndex(i => {
            return element === dpCodeConfig[i];
          }) !== -1
        ) {
          return {
            key: dpPropList[element],
            type: 'click',
            title: Strings.getLang(dpPropList[element] + 'Title'),
            choiceValue: Strings.getLang(element + '_' + props[dpPropList[element]]),
            onClick: () => this.choiceList(element, props[dpPropList[element]]),
          };
        }

        if (element === dpCodeConfig.motorTorque) {
          return {
            key: 'motorTorque',
            type: 'click',
            title: Strings.getLang('motorTorqueTitle'),
            tip: Strings.getLang('motorTorqueTip'),
            choiceValue: Strings.getLang(dpCodeConfig.motorTorque + '_' + motorTorque),
            onClick: () => this.choiceList(dpCodeConfig.motorTorque, motorTorque),
          };
        }
        return {};
      });
      return {
        key: item.toString(),
        data: dataItem,
      };
    });

    this.setState({
      data,
    });
    console.log(data);
  };

  render() {
    const { status, showLoading } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <HeadTop title={Strings.getLang('setting')} pan={true} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.listView}>
            {this.state.data &&
              this.state.data.map((item: any) => {
                if (item.key) {
                  return (
                    <View key={item.key} style={styles.space}>
                      {item.data.map((element: any) => {
                        return <SwitchList key={element.key} {...element} />;
                      })}
                    </View>
                  );
                } else {
                  return null;
                }
              })}
          </View>
        </ScrollView>
        <Toast.Success
          show={status !== 'none'}
          text={Strings.getLang('successSetting')}
          onFinish={() =>
            this.setState({
              status: 'none',
            })
          }
        />
        {showLoading && <Loading loadingShow={true} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  userTip: {
    color: '#333',
    fontSize: convertX(16),
  },
  timeView: {
    flexDirection: 'row',
    width: convertX(343),
    height: convertX(50),
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: convertX(16),
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  timeTouch: {
    width: convertX(343),
    height: convertX(50),
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  listView: {
    alignItems: 'center',
    width,
    marginBottom: 20,
  },
  space: {
    marginTop: convertX(10),
  },
  spaceView: {
    backgroundColor: '#fff',
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tip: {
    color: '#999999',
    fontSize: convertX(12),
    marginTop: convertX(6),
    width: convertX(260),
  },
  arrow: {
    marginLeft: 10,
  },
  onclickView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default connect(
  ({
    dpState,
    userOpenJurisdiction,
    devInfo,
  }: {
    dpState: any;
    userOpenJurisdiction: userOpenJurisdiction;
    devInfo: DevInfo;
  }) => ({
    automaticLock: dpState[dpCodeConfig.automaticLock],
    autoLockTime: dpState[dpCodeConfig.autoLockTime],
    motorTorque: dpState[dpCodeConfig.motorTorque],
    bellVolume: dpState[dpCodeConfig.bellVolume],
    keyTone: dpState[dpCodeConfig.keyTone],
    beepVolume: dpState[dpCodeConfig.beepVolume],
    language: dpState[dpCodeConfig.language],
    userOpenJurisdiction,
    devInfo,
  }),
  dispatch => bindActionCreators({ setUserOpen }, dispatch)
)(Setting);
