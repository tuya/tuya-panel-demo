import React from 'react';
import Strings from '@i18n';
import DialogCustomExample from '../components/liveBottomBar/customFeature/dialogCustomExample';

export const popDataSchema = {
  // actived 表示用来dp点值与Value值相同时，展示激活的tintColor
  // title为null,需要自己在组件中写入title,表示title是动态变化的，避免在需要变更标题的过程中,出现页面抖动
  // 主题色配色
  generalTheme: {
    title: Strings.getLang('ipc_panel_button_theme'),
    showData: [
      { value: 'light', text: Strings.getLang('ipc_panel_theme_light'), actived: false },
      { value: 'dark', text: Strings.getLang('ipc_panel_theme_dark'), actived: false },
    ],
  },
  // 夜视开关
  basic_nightvision: {
    title: Strings.getLang('ipc_nightvision_button'),
    showData: [
      { value: '0', text: Strings.getLang('dp_basic_nightvision_auto'), actived: true },
      { value: '1', text: Strings.getLang('dp_basic_nightvision_off'), actived: false },
      { value: '2', text: Strings.getLang('dp_basic_nightvision_on'), actived: true },
    ],
  },
  // 自定义弹框
  customDialogFeat1: {
    title: Strings.getLang('ipc_panel_button_custom_dialog'),
    component: <DialogCustomExample />,
  },
};
