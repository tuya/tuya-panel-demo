/* eslint-disable import/prefer-default-export */
import React from 'react';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { Image, StyleSheet } from 'react-native';
import { ColorParser } from '../../../../utils/ColorParser';
import { store } from '../../../../main';
import Strings from '../../../../i18n';
import Res from '../../../../res';
import Config from '../../../../config';

const { cx } = Config;

const styles = StyleSheet.create({
  track: {
    height: cx(6),
  },
  trackNormal: {
    height: Math.max(3, cx(3)),
  },
  trackImg: {
    width: '100%',
    resizeMode: 'cover',
  },
  thumbImg: {
    width: '95%',
    resizeMode: 'cover',
  },
});
export const whiteMode = {
  lightData: [
    {
      key: 'floodlight_temp',
      iconImage: Res.floodLight.lightTemp,
      dpValue: 0,
      min: 0,
      max: 1000,
      stepValue: 1,
      hasUnit: true,
      minColor: '#0B7CFF',
      maxColor: '#DBDBDB',
      thumb: Res.floodLight.lightNormalThumb,
      disabled: false,
    },
    {
      key: 'floodlight_lightness',
      iconImage: Res.floodLight.lightBright,
      dpValue: 1,
      min: 1,
      max: 100,
      stepValue: 1,
      hasUnit: true,
      minColor: '#0B7CFF',
      maxColor: '#DBDBDB',
      thumb: Res.floodLight.lightNormalThumb,
      disabled: false,
    },
  ],
  needFilterDp: [
    { dpCode: 'floodlight_temp', iconKey: 'floodlight_temp' },
    { dpCode: 'floodlight_lightness', iconKey: 'floodlight_lightness' },
  ],
};
export const colorMode = {
  lightData: [
    {
      key: 'colorLight_hue',
      iconTitle: Strings.getLang('ipc_light_color'),
      dpValue: 0,
      min: 0,
      max: 360,
      stepValue: 1,
      hasUnit: false,
      minColor: '#0B7CFF',
      maxColor: '#DBDBDB',
      disabled: false,
      onlyMaximumTrack: true,
      thumb: Res.floodLight.lightColorThumb,
      renderMaximumTrack: () => (
        <Image source={Res.floodLight.lightColorTrack} style={styles.trackImg} />
      ),
      renderThumb: () => <Image source={Res.floodLight.lightColorThumb} style={styles.thumbImg} />,
      trackStyle: styles.track,
    },
    {
      key: 'colorLight_saturation',
      iconTitle: Strings.getLang('ipc_light_saturation'),
      dpValue: 1,
      min: 0,
      max: 1000,
      stepValue: 1,
      hasUnit: false,
      minColor: '#0B7CFF',
      maxColor: '#DBDBDB',
      disabled: false,
      onlyMaximumTrack: true,
      // thumb: Res.floodLight.lightNormalThumb,
      renderMaximumTrack: () => (
        <Image source={Res.floodLight.lightColorSaturation} style={styles.trackImg} />
      ),
      renderThumb: () => <Image source={Res.floodLight.lightNormalThumb} style={styles.thumbImg} />,
      trackStyle: styles.track,
    },
    {
      key: 'colorLight_bright',
      iconImage: Res.floodLight.lightBright,
      dpValue: 1,
      min: 1,
      max: 1000,
      stepValue: 1,
      hasUnit: true,
      minColor: '#0B7CFF',
      maxColor: '#DBDBDB',
      disabled: false,
      onlyMaximumTrack: false,
      renderThumb: () => <Image source={Res.floodLight.lightNormalThumb} style={styles.thumbImg} />,
      trackStyle: styles.trackNormal,
    },
  ],
  needFilterDp: [],
};
// 底部菜单栏数据
export const lightControl = {
  lightData: [
    {
      key: 'floodlight_switch',
      iconImage: Res.floodLight.lightSwitchOff,
      imgageTitle: Strings.getLang('ipc_light_switch'),
      dpValue: false,
    },
    {
      key: 'floodlight_mode',
      iconImage: Res.floodLight.lightWhiteMode,
      imgageTitle: Strings.getLang('ipc_light_mode'),
      dpValue: '0',
    },
    {
      key: 'floodlight_schedule',
      iconImage: Res.floodLight.lightTimeSchedule,
      imgageTitle: Strings.getLang('ipc_light_timing'),
    },
  ],
  needFilterDp: [{ dpCode: 'floodlight_mode', iconKey: 'floodlight_mode' }],
};
// 获取白灯时传递的proBar
export const getProBarArr = (nativeArr, needFilterDp) => {
  const { devInfo } = store.getState();
  const { schema } = devInfo;
  let resultArr = [...nativeArr];
  needFilterDp.forEach(item => {
    resultArr = filterArrDp(item.dpCode, item.iconKey, resultArr, schema);
  });
  if (resultArr.length !== 0) {
    // 获取开关的状态，开关为false,不能进行调值变换，disabled为true
    const { dpState } = store.getState();
    const lightSwitchStatus = dpState.floodlight_switch;
    resultArr.forEach((item, index) => {
      const currentValue = dpState[item.key];
      const { min, max, step } = schema[item.key];
      resultArr[index].min = min;
      resultArr[index].max = max;
      resultArr[index].dpValue = currentValue;
      resultArr[index].stepValue = step;
      if (!lightSwitchStatus) {
        resultArr[index].disabled = true;
      }
    });
  }
  return resultArr;
};

// 获取彩灯时传递的proBar
export const getColorBarArr = (nativeArr, needFilterDp) => {
  const { devInfo } = store.getState();
  const { schema } = devInfo;
  let resultArr = [...nativeArr];
  needFilterDp.forEach(item => {
    resultArr = filterArrDp(item.dpCode, item.iconKey, resultArr, schema);
  });
  if (resultArr.length !== 0) {
    // 获取开关的状态，开关为false,不能进行调值变换，disabled为true
    const { dpState } = store.getState();
    const lightSwitchStatus = dpState.floodlight_switch;
    // 获取彩灯的dp值，进行色度、饱和度、亮度的数值的转换
    const lightColorControl =
      dpState.light_color_control !== '' ? dpState.light_color_control : '007903e803e8';
    const colorLightData = ColorParser.decodeColorData(lightColorControl);
    resultArr.forEach((item, index) => {
      resultArr[index].dpValue = colorLightData[index];
      if (!lightSwitchStatus) {
        resultArr[index].disabled = true;
      }
    });
  }
  return resultArr;
};

export const getLightControArr = (nativeArr, needFilterDp) => {
  const { devInfo } = store.getState();
  const { schema } = devInfo;
  let resultArr = [...nativeArr];
  needFilterDp.forEach(item => {
    resultArr = filterArrDp(item.dpCode, item.iconKey, resultArr, schema);
  });

  if (resultArr.length !== 0) {
    // 获取开关的状态，开关为false, 不能进行调值变换，disabled为true
    resultArr.forEach((item, index) => {
      const { dpState } = store.getState();
      if (item.key === 'floodlight_switch') {
        const lightSwitchStatus = dpState.floodlight_switch;
        resultArr[index].iconImage = lightSwitchStatus
          ? Res.floodLight.lightSwitchOn
          : Res.floodLight.lightSwitchOff;
        resultArr[index].dpValue = lightSwitchStatus;
      } else if (item.key === 'floodlight_mode') {
        const lightMode = dpState.floodlight_mode;
        resultArr[index].iconImage =
          lightMode === '0' ? Res.floodLight.lightWhiteMode : Res.floodLight.lightColorMode;
        resultArr[index].dpValue = lightMode;
      }
    });
  }
  return resultArr;
};

const filterArrDp = (dpCode, keyName, arr, schema) => {
  if (!(`${dpCode}` in schema)) {
    _.remove(arr, item => {
      return item.key === keyName;
    });
  }
  return arr;
};
