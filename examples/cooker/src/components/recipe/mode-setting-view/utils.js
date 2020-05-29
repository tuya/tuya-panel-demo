/* eslint-disable no-bitwise */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import React from 'react';
import { TYSdk, I18N, Utils, Modal, Popup } from 'tuya-panel-kit';
import CountdownPickerView from './time-picker';
import MinCountdownView from './low-time-picker';
import PluralPickerView from './temp-picker';
import Config from '../../../config';

const Strings = new I18N();
const { scaleNumber } = Utils.NumberUtils;
const unitMin = ['分钟', 'min'];
const unitSec = ['秒', 's'];

export const toC = (v, scale = 0) => +Math.floor((v - 32 * 10 ** scale) / 1.8).toFixed(scale);
export const toF = (v, scale = 0) => Math.floor((v * 9) / 5) + 32 * 10 ** scale;

export const formatDpValueName = (code = '', value = '') => {
  const { type, unit, scale } = Config.getDpSchema(code);
  const valStr =
    type === 'value'
      ? `${Utils.NumberUtils.scaleNumber(scale, value)}${unit}`
      : getCodeName(code, value);
  return valStr;
};

export function getCodeName(code, value) {
  return typeof value !== 'undefined' ? Strings.getDpLang(code, value) : Strings.getDpLang(code);
}

export const getCountDownType = code => {
  let type = 'hm';
  if (code) {
    const { unit, max } = Config.getDpSchema(code);
    if (unitMin.includes(unit)) {
      if (max <= 60) {
        type = 'min';
      }
    }
    if (unitSec.includes(unit)) type = 'sec';
  }
  return type;
};

export const onPressTimeSet = (code, value, putDeviceData) => {
  let min = 0;
  let max = 360;
  let step = 1;
  if (code) {
    min = Config.getDpSchema(code).min;
    max = Config.getDpSchema(code).max;
    step = Config.getDpSchema(code).step;
  }
  const type = getCountDownType(code);
  if (type === 'sec') {
    const data = {
      name: Strings.getDpLang(code),
      value,
      min,
      max,
      step,
      onValueChange: v => {
        putDeviceData({
          [code]: ~~(v < min ? min : v),
        });
        Modal.close();
      },
      onCancel: () => Modal.close(),
    };
    Modal.render(<MinCountdownView {...data} />);
  } else if (type === 'min') {
    // eslint-disable-next-line no-shadow
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
  } else {
    const data = {
      name: Strings.getDpLang(code),
      value,
      max,
      step,
      onValueChange: v => {
        putDeviceData({
          [code]: v < min ? min : v,
        });
        Modal.close();
      },
      onCancel: () => Modal.close(),
    };
    Modal.render(<CountdownPickerView {...data} />);
  }
};

export function getRangeByMinAndMax(min, max, step) {
  const res = [];
  for (let i = +min; i <= +max; i += step) {
    res.push(i);
  }
  return res;
}

export const onPressTempSet = ({ code, v, propsUnit = '℃', cfCode, range, putDeviceData }) => {
  const unit = propsUnit;
  const { scale, step, max, min } = Config.getDpSchema(code);
  const maxProp = unit === '℃' ? max : toF(max, scale);
  const minProp = unit === '℃' ? min : toF(min, scale);
  const data = {
    title: Strings.getDpLang(code),
    value: propsUnit === '℃' ? v : toF(v, scale),
    label: cfCode ? propsUnit : unit,
    dataSource: range.map((item, index) => ({
      value: range[index],
      label: `${item}`,
    })),
    cancelText: Strings.getLang('cancel'),
    confirmText: Strings.getLang('confirm'),
    onConfirm: value => {
      const val = Math.floor(value * 10 ** scale);
      const temp = unit === '℃' || !cfCode ? val : toC(val, scale);
      putDeviceData({ [code]: temp });
      Modal.close();
    },
  };

  const pluralData = {
    name: Strings.getDpLang(code),
    min: minProp,
    max: maxProp,
    scale,
    value: unit === '℃' ? v : toF(v, scale),
    step,
    onCancel: () => {
      Modal.close();
    },
    onValueChange: value => {
      const val = Math.floor(value * 10 ** scale);
      const temp = unit === '℃' || !cfCode ? val : toC(val, scale);
      putDeviceData({ [code]: temp });
      Modal.close();
    },
  };

  scale === 0 && Popup.picker(data);
  scale > 0 && Modal.render(<PluralPickerView {...pluralData} />);
};
