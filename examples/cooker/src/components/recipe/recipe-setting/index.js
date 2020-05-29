import React, { Component } from 'react';
/* eslint-disable */
import { View, StyleSheet, Dimensions, Text, Image, ScrollView } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import ModeSettingView from '../mode-setting-view';
import Strings from '../i18n';
import TYSdk from '../api';
import Topbar from '../top-bar';
import _ from 'lodash';
import Bottom from './bottom';
import Config from '../config';
import OutConfig from '../../../config';
import { onPressTimeSet } from '../utils';

const { RatioUtils } = Utils;
const TopBarHeight = RatioUtils.convertY(80);
const { width } = Dimensions.get('window');
const { convertX: cx } = RatioUtils;
const { DetailBaseHeight } = Config;
const Res = {
  startBtn: require('../res/start-btn.png'),
  circle: require('../res/yellow-circle.png'),
  options: require('../res/options.png'),
  timer: require('../res/timer.png'),
  mask: require('../res/mask.png'),
};

export default class RecipeSetting extends Component {
  // 初始化模拟数据
  constructor(props) {
    super(props);
    this.state = {
      dpData: props.dpData,
      currentMenu: 0,
      recipeData: props.recipeData,
      dpState: this.getDpCodeBeforeRender(props.recipeData),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.dpData !== nextProps.dpData) {
      this.setState({ dpData: nextProps.dpData });
    }
  }

  get dpCodes() {
    return Config.codes;
  }

  onSwitchContent = (__, index) => {
    this.setState({ currentMenu: index });
  };

  onStatusChange = args => {
    const ret = { ...this.state.dpState };
    Object.assign(ret, { ...args });
    this.setState({ dpState: ret });
  };

  getDpCodeBeforeRender = recipeData => {
    const items = _.get(recipeData, 'data.hmsteps.devCtrl.items', []);
    const dpState = {};
    items.forEach(({ key, value } = {}) => {
      dpState[key] = +value;
    });
    return dpState;
  };

  _onPressTimer = () => {
    const { appointmentTime: aTimeCode } = this.dpCodes;
    const code = aTimeCode;
    const value = TYSdk.getState(aTimeCode);
    onPressTimeSet(code, value);
  };

  _onPressStartButton = () => {
    const { multistepslist, hmsteps } = this.state.recipeData.data;
    const { devCtrl = {} } = hmsteps;
    const { isdevctrl } = devCtrl;
    const recipeId = this.state.recipeData.id;

    if (!isdevctrl) {
      this._handleUnDevCtrl(recipeId);
      return;
    }
    const { start: startCode, cloudRecipeNumber: recipeCode } = this.dpCodes;
    const keys = Object.keys(this.state.dpState);
    const { schema } = OutConfig;
    const keysFromSchema = Object.keys(schema);
    const isAllEqual = keys.every(k => keysFromSchema.includes(k));
    if (isAllEqual || multistepslist.length === 0) {
      const putData = { ...this.state.dpState };
      putData[startCode] = true;
      putData[recipeCode] = recipeId;
      TYSdk.device.putDeviceData(putData);
      this.jumpToHome();
    } else {
      TYSdk.simpleTipDialog(Strings.getLang('cook_mode_error_tip'), () => {});
    }
  };

  jumpToHome = () => {
    this.props.navigator.push({
      id: 'main',
    });
  };

  _handleUnDevCtrl = (recipeId = 0) => {
    const putData = {};
    const { start: startCode, cloudRecipeNumber: recipeCode } = this.dpCodes;
    putData[startCode] = true;
    putData[recipeCode] = recipeId;
    TYSdk.device.putDeviceData(putData);
    this.jumpToHome();
  };

  renderTopContentView() {
    const { recipeTitle } = this.props;
    if (!this.state.recipeData) {
      return;
    }
    const { data } = this.state.recipeData;

    return (
      <View style={styles.topContentView}>
        <Image
          source={{ uri: data.image }}
          style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover', top: 0 }]}
        />
        <Image
          source={Res.mask}
          style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover' }]}
        />
        <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.textTitleStyle]}>
          {data.name || recipeTitle}
        </Text>
      </View>
    );
  }

  renderTopbar() {
    return (
      <View style={styles.topbar}>
        <Topbar title=" " actions={[]} onBack={TYSdk.Navigator.pop} />
      </View>
    );
  }

  renderBottomContentView() {
    if (!this.state.recipeData) {
      return;
    }
    const codes = Object.keys(this.state.dpState);
    return (
      <View style={styles.bottomContentView}>
        <View style={styles.scrollViewStyle}>
          <ScrollView>
            <View style={styles.topContainer}>
              <Text style={styles.detailTextStyle}>{Strings.getLang('userSetting')}</Text>
            </View>
            <ModeSettingView
              hideTopSeparator
              dpCodes={codes}
              dataSource={this.state.dpState}
              putDeviceData={this.onStatusChange}
            />
          </ScrollView>
        </View>
      </View>
    );
  }

  renderBottomButtonView = () => {
    const { appointmentTime: aTimeCode } = this.dpCodes;
    const option = {
      setting: {
        hide: true,
      },
      start: {
        onPress: this._onPressStartButton,
      },
      appointment: {
        onPress: this._onPressTimer,
        hide: !aTimeCode,
      },
    };
    return <Bottom buttonsConfig={option} themeColor={Config.themeColor} />;
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {this.renderTopbar()}
        {this.renderTopContentView()}
        {this.renderBottomContentView()}
        {this.renderBottomButtonView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: RatioUtils.convertY(32),
    paddingHorizontal: RatioUtils.convertX(16),
  },
  circle: {
    width: RatioUtils.convert(48),
    height: RatioUtils.convert(60),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerWrap: {
    resizeMode: 'stretch',
    position: 'absolute',
  },
  initImageStyle: {
    position: 'absolute',
  },
  commonStyle: {
    height: DetailBaseHeight,
    width,
  },
  innerImg: {
    marginBottom: RatioUtils.convert(12),
    resizeMode: 'stretch',
  },
  topbar: {
    position: 'absolute',
    top: 0,
    height: TopBarHeight,
    width: RatioUtils.width,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: 'transparent',
    zIndex: 999,
  },
  topContentView: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    height: DetailBaseHeight,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(51,54,73,1)',
  },

  bottomContentView: {
    position: 'absolute',
    top: RatioUtils.convertY(240),
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - RatioUtils.convertY(240),
    backgroundColor: '#fff',
  },

  scrollViewStyle: {
    width: window.width,
    height: RatioUtils.convertY(340),
    backgroundColor: 'transparent',
  },

  detailTextStyle: {
    color: '#666666',
    fontSize: 15,
    position: 'relative',
  },
  textTitleStyle: {
    position: 'absolute',
    bottom: 38,
    left: cx(10),
    zIndex: 20,
    color: '#fff',
    fontSize: cx(20),
    fontWeight: '500',
    backgroundColor: 'transparent',
    maxWidth: cx(350),
  },
  touchStyle: {
    position: 'absolute',
    bottom: 8,
    width,
    flexDirection: 'row',
    height: RatioUtils.convertY(60),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnWrap: {
    width: RatioUtils.convert(176),
    height: RatioUtils.convert(60),
    marginLeft: RatioUtils.convert(46),
    marginHorizontal: RatioUtils.convert(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    // width: RatioUtils.convert(176),
    // height: RatioUtils.convert(52),
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'stretch',
    position: 'absolute',
  },

  unitWrap: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  unit: {
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});
