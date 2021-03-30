import React, { PureComponent } from 'react';
import _get from 'lodash/get';
import { View, StyleSheet } from 'react-native';
import { Utils, TYSdk } from 'tuya-panel-kit';
import HomeControlView from './homeControlView';
import HomeBottomView from './homeBottomView';
import HomeSliderView from './homeSliderView';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;

export default class Home extends PureComponent {
  render() {
    const isDefaultTheme = true;
    const themeColor = '#1E9BC0';
    // 可切换按钮为水平方向
    const isHorizontal = false;
    const isGroup = !!_get(TYSdk.devInfo, 'groupId');
    return (
      <View style={styles.root}>
        <HomeControlView
          isDefault={isDefaultTheme}
          themeColor={themeColor}
          isHorizontal={isHorizontal}
        />
        {!isGroup && <HomeSliderView themeColor={themeColor} isDefault={isDefaultTheme} />}
        <View style={styles.bot} />
        <HomeBottomView isDefault={isDefaultTheme} themeColor="red" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  bot: {
    width: cx(376),
    height: isIphoneX ? cx(99) : cx(87),
  },
});
