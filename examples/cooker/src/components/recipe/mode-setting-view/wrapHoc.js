/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable max-len */
/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _pickBy from 'lodash/pickBy';
import { TYSdk, I18N, Utils, Popup } from 'tuya-panel-kit';
import { getCountDownType, onPressTimeSet, getRangeByMinAndMax, onPressTempSet } from './utils';
import Config from '../../../config';

const Strings = new I18N();
const { scaleNumber } = Utils.NumberUtils;
const { convertX: cx } = Utils.RatioUtils;
const Icons = {
  hasWrap: {
    time: require('./res/icon_time.png'),
    temp: require('./res/icon_temp.png'),
    gear: require('./res/icon_gear.png'),
    pressue: require('./res/icon_pressue.png'),
    arrow: require('./res/icon_arrow.png'),
    c: require('./res/icon_c.png'),
    f: require('./res/icon_f.png'),
  },
  noWrap: {
    time: require('./res/icon_time_no_wrap.png'),
    temp: require('./res/icon_temp_no_wrap.png'),
    gear: require('./res/icon_gear_no_wrap.png'),
    pressue: require('./res/icon_pressue_no_wrap.png'),
    arrow: require('./res/icon_arrow.png'),
    c: require('./res/icon_c.png'),
    f: require('./res/icon_f.png'),
  },
};

// eslint-disable-next-line no-confusing-arrow
const checkDpCodes = (oldCode, newCode) =>
  Config.schema ? (oldCode in Config.schema ? oldCode : newCode) : oldCode;

const Hoc = () => WrappedComponent => {
  const COOK_TIME = 'cook_time';
  const PRESSURE = 'pressure';
  const COOK_MODE = 'cook_mode';
  const CURRENT_TEMPERATURE = 'temp_current';
  return class SettingComponent extends Component {
    // eslint-disable-next-line max-len
    static displayName = `WrappedComponent_${WrappedComponent.displayName}`;

    static propTypes = {
      dpCodes: PropTypes.array,
      headDatas: PropTypes.array,
      extraDatas: PropTypes.array,
      iconHasWrap: PropTypes.bool,
      dataSource: PropTypes.object,
      putDeviceData: PropTypes.func,
      settingPlugin: PropTypes.func,
    };

    static defaultProps = {
      dpCodes: [],
      headDatas: [],
      extraDatas: [],
      iconHasWrap: true,
      dataSource: null,
      putDeviceData: null,
      settingPlugin: null,
    };

    constructor(props) {
      super(props);

      this.state = {
        dpCodes: this.getDpCodes(),
      };
      this.buildConfig();
      this._onPressTimeSet = onPressTimeSet.bind(this);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.dpCodes !== nextProps.dpCodes) {
        this.setState({ dpCodes: this.getDpCodes(nextProps) }, () => this.buildConfig(nextProps));
      }

      if (this.props.dataSource !== nextProps.dataSource && !!nextProps.dataSource) {
        requestAnimationFrame(() => this.buildConfig(nextProps));
      }
    }

    get TEMP_UNIT() {
      return checkDpCodes('c_f', 'temp_unit_convert');
    }

    get COOK_TEMPERATURE() {
      return checkDpCodes('cook_temperature', 'temperature');
    }

    get GEAR() {
      return checkDpCodes('gear', 'cook_gear');
    }

    getDpCodes = props => {
      const { dpCodes } = props || this.props;
      const { schema } = Config;
      const originCodes = Object.keys(schema);
      return [...new Set([...dpCodes, this.getDefaultCodes()])].filter(st =>
        originCodes.includes(st)
      );
    };

    getDefaultCodes = () => {
      const { TEMP_UNIT, COOK_TEMPERATURE, GEAR } = this;
      const defaultCodes = [TEMP_UNIT, COOK_TIME, COOK_TEMPERATURE, PRESSURE, COOK_MODE, GEAR];
      return defaultCodes;
    };

    getSettingDatas = (state = {}) => {
      const codes = this.state.dpCodes;
      const isF = state[this.TEMP_UNIT] === 'f';
      return codes.map(st => this.formatRowSchema(st, state[st], isF, state));
    };

    getBaseListRowSchema = (code, value) => ({
      title: Strings.getDpLang(code),
      content: Strings.getDpLang(code, value),
      onPress: () => this._onPressListModeSet(code, value),
    });

    getBaseRowSchema = (code, value) => {
      const { type, scale } = Config.getDpSchema(code);
      let content = '';
      let onPress = () => {};
      switch (type) {
        case 'value': {
          content = scaleNumber(scale, value);
          onPress = () => this.handleValuePress(code, value, this.putDeviceData);
          break;
        }
        case 'enum':
          content = Strings.getDpLang(code, value);
          onPress = () => this._onPressListModeSet(code, value);
          break;
        case 'bool':
          content = Strings.getDpLang(code, value);
          onPress = () => this.handleBooleanPress(code, value);
          break;
        default:
          content = value;
          break;
      }
      return {
        title: Strings.getDpLang(code),
        content,
        onPress,
      };
    };

    putDeviceData = (...args) => {
      const { putDeviceData } = this.props;
      const func = putDeviceData || TYSdk.device.putDeviceData;
      func(...args);
    };

    handleBooleanPress = (code, value) => {
      const range = [true, false];
      this._onPressListModeSet(code, value, range, true);
    };

    handleValuePress = (code = '', value, putDeviceData) => {
      const { max, min, step, scale, unit } = Config.getDpSchema(code);
      const values = Utils.NumberUtils.range(min, step === 1 ? max + step : max, step);
      Popup.picker({
        title: Strings.getDpLang(code),
        label: `${unit}`,
        dataSource: values.map(d => ({
          value: Number(scaleNumber(scale, d)),
          label: scaleNumber(scale, d),
        })),
        cancelText: Strings.getLang('cancel'),
        confirmText: Strings.getLang('confirm'),
        value: +scaleNumber(scale, value),
        onConfirm: v => {
          const ret = Number(v) * 10 ** scale;
          if (ret >= min && ret <= max) {
            putDeviceData({
              [code]: ret,
            });
            Popup.close();
          } else {
            TYSdk.simpleTipDialog(Strings.getLang('publishErrorTip'), () => {});
          }
        },
        onCancel: Popup.close,
      });
    };

    formatRowSchema = (code, value, isF, state) => {
      const codes = this.state.dpCodes;
      const { settingPlugin, isStart } = this.props;
      let unit = '℃';
      const hasCfCode = codes.includes(this.TEMP_UNIT);
      unit = hasCfCode ? (!isF ? '℃' : '℉') : unit;
      const { iconHasWrap } = this.props;
      const images = Icons[iconHasWrap ? 'hasWrap' : 'noWrap'];
      const tempDisplayCode =
        isStart && Config.getDpSchema(CURRENT_TEMPERATURE)
          ? CURRENT_TEMPERATURE
          : this.COOK_TEMPERATURE;
      let res = {};
      switch (code) {
        case this.TEMP_UNIT:
          res = {
            title: Strings.getDpLang(this.TEMP_UNIT),
            onRightPress: () => this.putDeviceData({ [this.TEMP_UNIT]: isF ? 'c' : 'f' }),
            rightIconStyle: { width: cx(58), height: cx(32) },
            image: isF ? images.f : images.c,
          };
          break;
        case COOK_TIME:
          res = {
            title: Strings.getDpLang(COOK_TIME),
            content: this._changeValueToTime(value, COOK_TIME),
            onPress: () => this._onPressTimeSet(COOK_TIME, value, this.putDeviceData),
            image: images.time,
          };
          break;
        case this.COOK_TEMPERATURE:
          res = {
            title: Strings.getDpLang(this.COOK_TEMPERATURE),
            content: `${this._changeTempValue(
              state[tempDisplayCode],
              tempDisplayCode,
              unit
            )}${unit}`,
            onPress: () => this._onPressTempSet(this.COOK_TEMPERATURE, value, unit),
            image: images.temp,
          };
          break;
        case PRESSURE:
          res = {
            ...this.getBaseListRowSchema(PRESSURE, value),
            image: images.pressue,
          };
          break;
        case COOK_MODE:
          res = {
            ...this.getBaseListRowSchema(COOK_MODE, value),
            image: images.time,
          };
          break;
        case this.GEAR:
          res = {
            ...this.getBaseRowSchema(this.GEAR, value),
            image: images.gear,
          };
          break;
        default:
          res = {
            ...this.getBaseRowSchema(code, value),
            image: images.time,
          };
          break;
      }
      return settingPlugin ? settingPlugin(res, code, state) : res;
    };

    buildConfig = props => {
      const { extraDatas, headDatas, dataSource, ...rest } = props || this.props;
      this._component = connect(({ dpState }) => ({
        data: [...headDatas, ...this.getSettingDatas(dataSource || dpState), ...extraDatas],
        ...rest,
      }))(WrappedComponent);
      dataSource && this.forceUpdate();
    };

    _getValueWithPow = (unit = '℃', v, s) => {
      const codes = this.state.dpCodes;
      const hasCfCode = codes.includes(this.TEMP_UNIT);
      const value = +(v / 10 ** s);
      return unit === '℃' || !hasCfCode ? value : this._changeTempValue(value);
    };

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
        res = `${value}${Strings.getLang('min')}`;
      }
      return res;
    };

    _changeTempValue = (v, code, unit) => {
      let scale = 0;
      if (code) {
        const { scale: originScale } = Config.getDpSchema(code);
        scale = originScale;
      }
      const isC = unit === '℃';
      const value = isC ? v : Math.floor((v * 9) / 5);
      return +scaleNumber(scale, value) + (isC ? 0 : 32);
    };

    _onPressListModeSet = (code, value, originRange, isBoolean = false) => {
      if (!code) return;
      const { range: dpsRange } = Config.getDpSchema(code);
      const range = originRange || dpsRange;
      const dataSource = range.map(d => ({
        key: d,
        title: Strings.getDpLang(code, d),
        value: `${d}`,
      }));
      Popup.list({
        title: Strings.getDpLang(code),
        value: `${value}`,
        dataSource,
        cancelText: Strings.getLang('cancel'),
        confirmText: Strings.getLang('confirm'),
        onConfirm: v => {
          // eslint-disable-next-line no-eval
          this.putDeviceData({ [code]: isBoolean ? eval(v) : v });
          Popup.close();
        },
      });
    };

    _onPressTempSet = (code, v, unit) => {
      const { min, max, scale, step } = Config.getDpSchema(code);
      const minScale = this._getValueWithPow(unit, min, scale);
      const maxScale = this._getValueWithPow(unit, max, scale);
      const range = getRangeByMinAndMax(minScale, maxScale, step);
      onPressTempSet({
        code,
        v,
        propsUnit: unit,
        COOK_TEMPERATURE: this.COOK_TEMPERATURE,
        cfCode: this.TEMP_UNIT,
        minScale,
        maxScale,
        range,
        putDeviceData: this.putDeviceData,
      });
    };

    render() {
      const Setting = this._component;
      const keys = ['style', 'containerStyle'];
      const mergeProps = _pickBy(this.props, it => keys.includes(it));
      return <Setting {...mergeProps} />;
    }
  };
};

const Instance = new Hoc();
export default Instance;
