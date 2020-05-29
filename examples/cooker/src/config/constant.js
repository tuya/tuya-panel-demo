import React from 'react';
import { Utils, TopBar } from 'tuya-panel-kit';
import { StatusBar } from 'react-native';

export const { convertX: cx, convertY: cy, convert, isIos, isIphoneX } = Utils.RatioUtils;
export const defaultRouterConfig = {
  topbarTextStyle: { color: '#fff', fontSize: cx(17), fontWeight: '500' },
  renderStatusBar: () => <StatusBar barStyle={isIos ? 'dark-content' : 'default'} />,
};

export default {
  cx,
  cy,
  convert,
  isIphoneX,
  topbarHeight: TopBar.height,
  defaultRouterConfig,
};
