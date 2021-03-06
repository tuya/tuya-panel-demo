import React, { PureComponent } from 'react';
import { Text, View, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TYSdk, Dialog, Utils, Toast, RotationView, DevInfo, GlobalTheme } from 'tuya-panel-kit';
import AlarmTip from '../../components/alarmTip';
import ButtonList from '../../components/buttonList';
import Res from '../../res';
import Strings from '../../i18n';
import { getUser, setUserOpen } from '../../models/modules/userInfo';
import { getUserInfo } from '../../dataHandle/userInfoHandle';
import dpCodesConfig from '../../config/dpCodes';
import apiRequestHandle from '../../api';

const { convertX, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

// const themeColor = Config.getUiValue('themeColor');
interface HomeConnectType {
  devInfo: DevInfo;
  user: UserType;
  dpState: any;
  userOpenJurisdiction: UserOpenJurisdiction;
}
interface HomeProps {
  reverseLock: boolean;
  childLock: boolean;
  userOpenJurisdiction: UserOpenJurisdiction;
  getUserAction: any;
  setUserOpenAction: any;
  user: UserType;
  devInfo: DevInfo;
  theme: GlobalTheme;
}
interface HomeState {
  load: boolean;
  status: string;
}
class Home extends PureComponent<HomeProps, HomeState> {
  time: any;

  static defaultProps = {
    user: {},
    reverseLock: false,
    userOpenJurisdiction: {
      remoteOpenState: {
        way: '',
        user: 'all',
      },
      remoteOpen: false,
    },
  };

  constructor(props: any) {
    super(props);
    this.state = {
      load: false,
      status: 'none',
    };
  }

  async componentDidMount() {
    const { getUserAction, setUserOpenAction } = this.props;
    getUserInfo(getUserAction);
    const result = await apiRequestHandle.fetchDp('isRemoteOpen');
    if (typeof result === 'object') {
      setUserOpenAction({
        remoteOpenState: {
          way: '',
          user: 'all',
        }, // remoteOpenState 值目前固定 因为没有涉及到开门方式的选择 或者是权限选择 ，使用者可以根据情况使用具体字段 ，目前user是权限 为全体用户
        remoteOpen: result.isRemoteOpen.toString() === 'true',
      });
    }
    TYSdk.event.on('dpDataChange', this.dpDataChangeHandle);
  }

  componentWillUnmount() {
    TYSdk.event.off('dpDataChange', this.dpDataChangeHandle);
  }

  dpDataChangeHandle = (data: any) => {
    const remoteResultDp = data.remote_result;
    if (JSON.stringify(data).length > 50) {
      return;
    }
    if (typeof remoteResultDp !== 'undefined' && remoteResultDp) {
      this.setState({
        load: false,
        status: 'success',
      });
      this.clearTime();
    }
  };

  clearTime = () => {
    if (typeof this.time !== 'undefined' && this.time !== null) {
      clearTimeout(this.time);
    }
  };

  toAlarm = () => {
    TYSdk.Navigator.push({
      id: 'alarmList',
    });
  };

  open = async () => {
    const { userOpenJurisdiction } = this.props;
    if (userOpenJurisdiction.remoteOpen) {
      apiRequestHandle
        .remoteOpen('open')
        .then(d => {
          console.log(d);
        })
        .catch(err => {
          console.log(err);
        });
      this.setState({
        load: true,
      });

      this.time = setTimeout(() => {
        this.setState({
          load: false,
          status: 'error',
        });
      }, 16000);
    } else {
      Dialog.alert({
        title: Strings.getLang('remoteOpenTip'),
        confirmText: Strings.getLang('confirm'),
      });
    }
  };

  getButtonList = () => {
    const { user } = this.props;

    const data = [
      {
        key: 'records',
        text: Strings.getLang('records'),
        background: Res.records,
        onPress: () =>
          TYSdk.Navigator.push({
            id: 'openList',
            gesturesEnabled: false,
          }),
      },
    ];

    const dataB = [
      {
        key: 'setting',
        text: Strings.getLang('setting'),
        background: Res.setting,
        onPress: () =>
          TYSdk.Navigator.push({
            id: 'setting',
          }),
      },
    ];
    if (user.userType === 10 || user.userType === 50) {
      return data.concat(dataB);
    }
    return data;
  };

  getShowList = () => {
    const { childLock, reverseLock } = this.props;
    const data: ButtonListType[] = [
      {
        key: 'reverseLock',
        text: reverseLock ? Strings.getLang('reverseLock') : Strings.getLang('noReverseLock'),
        background: reverseLock ? Res.reverseLock : Res.unReverseLock,
        type: 'View',
      },
      {
        key: 'childLock',
        text: childLock ? Strings.getLang('childLock') : Strings.getLang('noChildLock'),
        background: childLock ? Res.child : Res.unChild,
        type: 'View',
      },
    ].filter(item => {
      return TYSdk.device.getDpSchema(dpCodesConfig[item.key]);
    });
    return data;
  };

  renderButton() {
    console.log(this.props);
    const { load } = this.state;
    const { userOpenJurisdiction, user, devInfo, theme } = this.props;
    const isLocalOnline = devInfo.deviceOnline;
    const normalTextChoice =
      user.userType === 10 || user.userType === 50 ? Strings.getLang('longPressOpen') : '';

    const image = {
      normal: {
        bg: Res.show,
        iconBg: Res.door,
        text: userOpenJurisdiction.remoteOpen ? normalTextChoice : '',
        color: '#fff',
      },
      outLine: {
        bg: Res.outLine,
        iconBg: '',
        text: Strings.getLang('outlineTitile'),
        color: '#A2A2A2',
      },
      load: {
        bg: Res.showBg,
        iconBg: Res.opening,
        text: `${Strings.getLang('locking')}...`,
        color: '#fff',
      },
    };
    let flag = isLocalOnline ? 'normal' : 'outLine';
    flag = load ? 'load' : flag;

    return (
      <View>
        {isLocalOnline && (
          <View>
            <RotationView active={load} duration={3000}>
              <Image
                source={image[flag].bg}
                style={[styles.bgShow, { tintColor: theme.global.brand }]}
              />
            </RotationView>

            <View style={styles.bgShowView}>
              <TouchableWithoutFeedback
                style={[styles.buttonView, { backgroundColor: theme.global.brand }]}
                onLongPress={() => this.open()}
              >
                <View style={[styles.buttonView, { backgroundColor: theme.global.brand }]}>
                  <Image
                    source={image[flag].iconBg}
                    style={!image[flag].text ? { opacity: 0.5 } : {}}
                  />
                  {image[flag].text !== '' && (
                    <Text
                      style={[
                        styles.lockText,
                        { color: image[flag].color, fontSize: 14, width: 90 },
                      ]}
                      numberOfLines={2}
                    >
                      {image[flag].text}
                    </Text>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        )}
        {!isLocalOnline && (
          <View style={{ alignItems: 'center' }}>
            <Image source={image[flag].bg} style={[styles.bgShow]} />
            <View>
              <Text style={[styles.outLineText]}>{image[flag].text}</Text>
              <Text style={[styles.outLineTip]}>{Strings.getLang('outlineTipHome')}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  render() {
    const buttonList = this.getButtonList();
    const showList = this.getShowList();
    const { user, theme } = this.props;
    const { status } = this.state;
    const ToastView =
      status === 'success' ? Toast.Success : status === 'error' ? Toast.Error : Toast;

    const buttonStyleIsIphoneX = {
      paddingTop: convertX(13),
      paddingBottom: convertX(10),
    };
    return (
      <View style={styles.root}>
        <View style={styles.centerView}>
          <View style={styles.center}>{this.renderButton()}</View>
          <ButtonList
            data={showList}
            bgColor="transparent"
            imageColor={{}}
            textStyle={{ marginTop: 0, fontSize: 12 }}
            textColor="#666"
            style={{ paddingHorizontal: 0 }}
          />
          <AlarmTip onClick={this.toAlarm} iconColor={theme.global.brand} />
        </View>
        <ButtonList
          data={buttonList}
          bgColor="#fff"
          imageColor={{}}
          textStyle={{ marginTop: 0, fontSize: 12 }}
          textColor="#878787"
          style={[
            styles.buttonStyle,
            user.userType === 10 || user.userType === 50 ? {} : { justifyContent: 'center' },
            isIphoneX ? {} : buttonStyleIsIphoneX,
          ]}
        />
        <ToastView
          show={status !== 'none'}
          text={Strings.getLang(`${status}Open`)}
          onFinish={() => {
            this.setState({
              status: 'none',
            });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerView: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: convertX(12),
  },

  bgShowView: {
    width: convertX(210),
    height: convertX(210),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
  },
  bgShow: {
    width: convertX(210),
    height: convertX(210),
  },
  buttonView: {
    width: convertX(174),
    height: convertX(174),
    borderRadius: convertX(84),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lockText: {
    color: '#5EAAFF',
    fontSize: 14,
    marginTop: convertX(7),
    textAlign: 'center',
  },
  outLineText: {
    color: '#5B5B5B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  outLineTip: {
    color: '#878787',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonStyle: {
    paddingHorizontal: 0,
    paddingTop: convertX(5),
    paddingBottom: convertX(20),
  },
});
export default connect(
  ({ devInfo, user, dpState, userOpenJurisdiction }: HomeConnectType) => {
    return {
      devInfo,
      user,
      userOpenJurisdiction,
      residualElectricity: dpState[dpCodesConfig.residualElectricity],
      reverseLock: dpState[dpCodesConfig.reverseLock],
      // :dpState,
    };
  },
  dispatch =>
    bindActionCreators({ getUserAction: getUser, setUserOpenAction: setUserOpen }, dispatch)
)(withTheme(Home));
