/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import { Navigator } from 'react-native-deprecated-custom-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { ModeSettingView } from '../../components/recipe';
import Config from '../../config';
import TYSdk from '../../api';
import Strings from '../../i18n';
import { jumpToSense } from '../../utils';

const Res = {
  wash: require('../../res/icon_wash.png'),
  arrow: require('../../res/icon_arrow.png'),
};
class HomeSettingView extends Component {
  static propTypes = {
    auto: PropTypes.bool,
  };

  static defaultProps = {
    auto: false,
  };

  get codes() {
    const {
      start: startCode,
      cloudRecipeNumber: recipeCode,
      autoClean: autoCode,
      manualClean: manualCode,
    } = Config.codes;
    return { startCode, recipeCode, autoCode, manualCode };
  }

  getDatas = () => {
    const head = [];
    let footer = [];
    if (this.codes.autoCode || this.codes.manualCode) {
      const pressOption = this.codes.autoCode
        ? {
            onPress: this.sendAutoWashData,
          }
        : {
            onPressIn: () => TYSdk.device.putDeviceData({ [this.codes.manualCode]: true }),
            onPressOut: () => TYSdk.device.putDeviceData({ [this.codes.manualCode]: false }),
          };
      const ret = {
        title: Strings.getDpLang(this.codes.autoCode || this.codes.manualCode),
        image: Res.wash,
        ...pressOption,
      };
      head.push(ret);
    }
    footer = footer.concat(this.extraSections);
    if (this.codes.recipeCode) {
      footer.push({
        title: Strings.getLang('moreRecipes'),
        onPress: () =>
          jumpToSense({
            id: 'recipeList',
            sceneConfigs: {
              ...Navigator.SceneConfigs.FloatFromBottom,
              // gestures: null, // 阻止ios左滑
            },
          }),
        image: Res.arrow,
      });
    }
    return {
      head,
      footer,
    };
  };

  get extraSections() {
    const configs = _.get(this.props, 'panelConfig.bic', []);
    return configs.map(({ code, value }) => ({
      key: code,
      title: Strings.getLang(code === 'timer' ? 'schedule' : 'jumpTo'),
      onPress: () => this._handleCloudFuncPress(code === 'timer', value),
      image: Res.arrow,
    }));
  }

  sendAutoWashData = () => {
    const { auto } = this.props;
    TYSdk.device.putDeviceData({ [this.codes.autoCode]: !auto });
  };

  _handleCloudFuncPress = (isTimer, value) => {
    if (isTimer) {
      TYSdk.native.gotoDpAlarm({
        category: 'category__control',
        repeat: 0,
        data: [
          {
            dpId: TYSdk.device.getDpIdByCode(this.codes.startCode),
            dpName: Strings.getDpLang(this.codes.startCode),
            selected: 0,
            rangeKeys: [true, false],
            rangeValues: [
              Strings.getDpLang(this.codes.startCode, true),
              Strings.getDpLang(this.codes.startCode, false),
            ],
          },
        ],
      });
      return;
    }
    if (value) {
      const [parsedValue] = JSON.parse(value);
      const url = parsedValue.value;
      if (url) {
        TYSdk.native.jumpTo(url);
      }
    }
  };

  render() {
    const { head, footer } = this.getDatas();
    const { settingDps } = Config.dpFun;
    const codes = settingDps.map(({ code }) => code);
    return <ModeSettingView headDatas={head} extraDatas={footer} dpCodes={codes} />;
  }
}

export default connect(({ dpState, devInfo }) => ({
  auto: dpState[Config.codes.autoClean],
  panelConfig: devInfo.panelConfig,
}))(HomeSettingView);
