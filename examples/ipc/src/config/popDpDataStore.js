/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
/*
 *   dp点初始弹框值展示值
 *
 */
import React from 'react';
import Strings from '../i18n';
import DeviceVolume from '../components/liveBottomBar/customFeature/deviceVolumePage';
import FloodLight from '../components/liveBottomBar/customFeature/floodLightPage';
import Lullaby from '../components/liveBottomBar/customFeature/lullabyPage';
import CuriseTimePicker from '../components/liveBottomBar/customFeature/cruisePage/curiseTimePicker';
import SdCardConfig from '../components/featureComponents/sdCardConfig';

export const popDataSchema = {
  // actived 表示用来dp点值与Value值相同时，展示激活的tintColor
  // title为null,需要自己在组件中写入title,表示title是动态变化的，避免在需要变更标题的过程中,出现页面抖动
  // 夜视开关
  basic_nightvision: {
    title: Strings.getLang('ipc_nightvision_button'),
    showData: [
      { value: '0', text: Strings.getLang('dp_basic_nightvision_auto'), actived: true },
      { value: '1', text: Strings.getLang('dp_basic_nightvision_off'), actived: false },
      { value: '2', text: Strings.getLang('dp_basic_nightvision_on'), actived: true },
    ],
  },
  nightvision_mode: {
    title: Strings.getLang('ipc_nightmode_button'),
    showData: [
      { value: 'auto', text: Strings.getLang('ipc_nightmode_auto'), actived: false },
      { value: 'ir_mode', text: Strings.getLang('ipc_nightmode_ir'), actived: false },
      { value: 'color_mode', text: Strings.getLang('ipc_nightmode_color'), actived: false },
    ],
  },
  // pir灵敏度
  pir_switch: {
    title: Strings.getLang('ipc_pir_button'),
    showData: [
      { value: '0', text: Strings.getLang('dp_pir_switch_close'), actived: false },
      { value: '1', text: Strings.getLang('dp_pir_switch_low'), actived: true },
      { value: '2', text: Strings.getLang('dp_pir_switch_middle'), actived: true },
      { value: '3', text: Strings.getLang('dp_pir_switch_high'), actived: true },
    ],
  },
  // 抗闪烁
  basic_anti_flicker: {
    title: Strings.getLang('ipc_panel_button_anti_flicker'),
    showData: [
      { value: '0', text: Strings.getLang('dp_anti_flicker_switch_close'), actived: false },
      { value: '1', text: Strings.getLang('dp_anti_flicker_switch_fifty'), actived: true },
      { value: '2', text: Strings.getLang('dp_anti_flicker_switch_sixty'), actived: true },
    ],
  },
  // 灯光控制
  floodlight_switch: {
    // title: Strings.getLang('ipc_light_white_title'),
    title: null,
    component: <FloodLight />,
  },
  // 设备音量控制
  basic_device_volume: {
    title: Strings.getLang('ipc_panel_button_device_volume'),
    component: <DeviceVolume />,
  },
  // 摇篮曲控制
  ipc_lullaby: {
    // title: Strings.getLang('ipc_lullaby_song_stop'),
    title: null,
    component: <Lullaby />,
  },
  // 巡航timePicker,时间模式的timePicker
  curiseTimePicker: {
    // title: Strings.getLang('ipc_lullaby_song_stop'),
    title: null,
    component: <CuriseTimePicker />,
  },
  sdStatus: {
    // title: Strings.getLang('ipc_lullaby_song_stop'),
    title: Strings.getLang('sd_initial_title'),
    component: <SdCardConfig />,
  },
};
