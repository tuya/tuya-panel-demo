/* eslint-disable indent */
/* eslint-disable radix */
/* eslint-disable no-restricted-properties */
/* eslint-disable max-len */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconFont, ShowMaskView, Utils } from 'tuya-panel-kit';
import { onPressTimeSet, getCountDownType, onPressTempSet, getRangeByMinAndMax } from '../utils';
// eslint-disable-next-line import/no-named-as-default
import Config from '../config';
import OutConfig from '../../../config';
import Strings from '../i18n';
import TYSdk from '../api';

const { scaleNumber } = Utils.NumberUtils;
const { convertX: cx, convertY: cy, convert } = Utils.RatioUtils;

const {
  power: oldPowerCode,
  switch: newPowerCode,
  status: statusCode,
  cookTime: cTimeCode,
  cookTemperature: cTempCode,
  cookMode: cModeCode,
  gear: oldGearCode,
  cookGear: newGearCode,
  cF: cfCode,
  remainTime: rTimeCode,
  pressure: pCode,
  temperature: oldCurTempCode,
  temperCurrent: newCurTempCode,
} = Config.codes;
const curTempCode = newCurTempCode || oldCurTempCode;
const gearCode = newGearCode || oldGearCode;
const powerCode = newPowerCode || oldPowerCode;
class ModeSettingView extends Component {
  static propTypes = {
    codes: PropTypes.array,
    unit: PropTypes.string,
    cTime: PropTypes.number,
    cTemp: PropTypes.number,
    cMode: PropTypes.string,
    gear: PropTypes.string,
    p: PropTypes.string,
    curTemp: PropTypes.number,
    isStart: PropTypes.bool,
  };

  static defaultProps = {
    codes: [],
    unit: '℃',
    cTime: 0,
    cTemp: 0,
    cMode: '',
    gear: '',
    p: '',
    curTemp: 0,
    isStart: false,
  };

  constructor(props) {
    super(props);

    this._onPressTimeSet = onPressTimeSet.bind(this);
    this.timer = null;
  }

  _changeValueToTime = (value, code) => {
    const h = Math.floor(value / 60);
    let m = value % 60;
    let s = 0;
    let res = `${h}${Strings.getLang('hour')} ${m}${Strings.getLang('min')}`;
    const type = getCountDownType(code);

    if (type === 'sec') {
      m = Math.floor(value / 60);
      s = value % 60;
      res = `${m}${Strings.getLang('min')} ${s}${Strings.getLang('sec')}`;
    } else if (type === 'min') {
      res = `${m}${Strings.getLang('min')}`;
    }
    return res;
  };

  _getCountDownValue = value => {
    const [h, m, s] = Utils.TimeUtils.parseSecond(value);
    return [h, m, s].join(':');
  };

  _changeTempToFahrenheit = temp => Math.round(temp * 1.8 + 32);

  _getValueWithPow = (unit, v, s) => {
    const value = parseInt(v / Math.pow(10, s));
    return unit === '℃' || !cfCode ? value : this._changeTempValue(value);
  };

  _onPressTempSet = (code, v) => {
    const { unit: propsUnit } = this.props;
    const unit = propsUnit;
    const { min, max, scale, step } = OutConfig.getDpSchema(code);
    const minScale = this._getValueWithPow(unit, min, scale);
    const maxScale = this._getValueWithPow(unit, max, scale);
    const range = getRangeByMinAndMax(minScale, maxScale, step);
    onPressTempSet({
      code,
      v,
      propsUnit,
      cTempCode,
      curTempCode,
      cfCode,
      minScale,
      maxScale,
      range,
    });
  };

  _onPressListModeSet = (code, value) => {
    if (!code) return;
    const { range } = OutConfig.getDpSchema(code);
    const values = { ...range.map(d => Strings.getDpLang(code, d)) };
    ShowMaskView.list({
      name: Strings.getDpLang(code),
      value: range.indexOf(value),
      values,
      onValueChange: v => TYSdk.device.putDeviceData({ [code]: range[v] }),
    });
  };

  _changeTempValue = (v, code) => {
    let scale = 0;
    if (code) {
      const { scale: originScale } = OutConfig.getDpSchema(code);
      scale = originScale;
    }
    const { unit } = this.props;
    const isC = unit === '℃';
    const value = isC ? v : Math.floor((v * 9) / 5);
    return +scaleNumber(scale, value) + (isC ? 0 : 32);
  };

  _getItemsSettingConfig = codes => {
    const { cTime, cTemp, cMode, gear, unit: propsUnit, p, curTemp, isStart } = this.props;
    let unit = propsUnit;
    if (cTempCode) {
      const { unit: originUnit } = OutConfig.getDpSchema(curTempCode);
      if (originUnit) {
        unit = originUnit;
      }
    }
    switch (codes) {
      case cTimeCode:
        return {
          title: Strings.getDpLang(cTimeCode),
          content: this._changeValueToTime(cTime, cTimeCode),
          onPress: () => this._onPressTimeSet(cTimeCode, cTime),
        };
      case cTempCode:
        return !isStart
          ? {
              title: Strings.getDpLang(cTempCode),
              content: `${this._changeTempValue(cTemp, cTempCode)}${cfCode ? propsUnit : unit}`,
              onPress: () => this._onPressTempSet(cTempCode, cTemp),
            }
          : {
              title: Strings.getDpLang(curTempCode),
              content: `${this._changeTempValue(curTemp || cTemp, curTempCode || cTempCode)}${
                cfCode ? propsUnit : unit
              }`,
              onPress: () => this._onPressTempSet(cTempCode, cTemp),
            };
      case pCode:
        return {
          title: Strings.getDpLang(pCode),
          content: Strings.getDpLang(pCode, p),
          onPress: () => this._onPressListModeSet(pCode, p),
        };
      case cModeCode:
        return {
          title: Strings.getDpLang(cModeCode),
          content: Strings.getDpLang(cModeCode, cMode),
          onPress: () => this._onPressListModeSet(cModeCode, cMode),
        };
      case gearCode:
        return {
          title: Strings.getDpLang(gearCode),
          content: Strings.getDpLang(gearCode, gear),
          onPress: () => this._onPressListModeSet(gearCode, gear),
        };
      default:
        break;
    }
  };

  _getItemsSettingDatas = () => {
    const { codes } = this.props;
    const res = codes.map(code => this._getItemsSettingConfig(code));

    return res;
  };

  _renderItem = (props, i) => (
    <TouchableOpacity
      key={i}
      activeOpacity={0.9}
      style={[
        styles.rowStyle,
        props.style,
        {
          borderColor: 'rgba(0,0,0,.15)',
        },
      ]}
      onPress={props.onPress}
    >
      <Text style={[styles.rowTitleStyle, { color: '#4A4A4A' }]}>{props.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.rowContentStyle, { color: '#999999' }]}>{props.content}</Text>
        <IconFont name="arrow" size={convert(18)} color="#999999" />
      </View>
    </TouchableOpacity>
  );

  render() {
    const datas = this._getItemsSettingDatas();
    return <View style={[styles.container]}>{datas.map((d, i) => this._renderItem(d, i))}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: cx(15),
  },

  rowStyle: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: cy(48),
    width: cx(345),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },

  rowTitleStyle: {
    fontSize: 17,
    color: '#303030',
  },

  rowContentStyle: {
    fontSize: 15,
    color: '#303030',
  },
});

export default connect(({ dpState, countdownLeft }) => ({
  power: dpState[powerCode],
  status: dpState[statusCode],
  cTime: dpState[cTimeCode],
  cTemp: dpState[cTempCode],
  cMode: dpState[cModeCode],
  gear: dpState[gearCode],
  rTime: dpState[rTimeCode],
  p: dpState[pCode],
  curTemp: dpState[curTempCode],
  countdownLeft,
}))(ModeSettingView);
