/* eslint-disable import/no-unresolved */
import React, { useMemo } from 'react';
import _ from 'lodash';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { actions, useSelector } from '@models';
import { IconFont, TYSdk, Utils } from 'tuya-panel-kit';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { ControlTabs } from '@config/default';
import icons from '@res/iconfont';
import DpCodes from '@config/dpCodes';
import { BlurView } from '@react-native-community/blur';
import useTheme from '@hooks/useTheme';

const { convertX: cx, isIphoneX, winWidth } = Utils.RatioUtils;

const { powerCode, rgbMusicCode, rgbSceneCode } = DpCodes;

const Bar = () => {
  const {
    global: { isDefaultTheme, themeColor },
  } = useTheme();

  const dispatch = useDispatch();
  const { showTab, power, rgbMusicValue } = useSelector(({ dpState, uiState }: any) => ({
    showTab: uiState.showTab,
    power: dpState[powerCode],
    rgbMusicValue: dpState[rgbMusicCode],
  }));

  const handleChangeTab = (tab: string) => () => {
    dispatch(actions.common.updateUi({ showTab: tab }));
  };

  const handleSchedule = () => {
    dispatch(actions.common.updateUi({ showTab: ControlTabs.schedule }));
  };

  const getDataSource = useMemo(() => {
    const data = [
      {
        key: ControlTabs.scene,
        iconPath: icons.scene,
        isSupport: SupportUtils.isSupportDp(rgbSceneCode),
        onPress: handleChangeTab(ControlTabs.scene),
      },
      {
        key: ControlTabs.music,
        iconPath: icons.music,
        isSupport: SupportUtils.isSupportMusic() || SupportUtils.isSupportDp(rgbMusicCode),
        onPress: handleChangeTab(ControlTabs.music),
      },
      {
        key: ControlTabs.dimmer,
        iconPath: icons.light,
        isSupport: SupportUtils.isSupportColour() || SupportUtils.isSupportWhite(),
        onPress: handleChangeTab(ControlTabs.dimmer),
      },
      {
        key: 'schedule',
        iconPath: SupportUtils.isSupportCountdown() ? icons.schedule1 : icons.schedule,
        isSupport:
          !!TYSdk.devInfo.panelConfig.bic[0].selected ||
          (SupportUtils.isSupportCountdown() && !SupportUtils.isGroupDevice()),
        onPress: handleSchedule,
      },
    ];

    return data
      .filter(item => item.isSupport)
      .map(item => ({
        ...item,
      }));
  }, []);

  const handlePower = () => {
    dragon.putDpData({ [powerCode]: !power });
    if (!power && rgbMusicValue.power) {
      dragon.putDpData({
        [rgbMusicCode]: {
          ...rgbMusicValue,
          power: false,
        },
      });
    }
  };

  const iconColor = isDefaultTheme ? '#999' : '#7E868D';
  const activeIconColor = isDefaultTheme ? '#fff' : themeColor;

  return (
    <View
      style={[
        styles.bottom,
        showTab === 'dimmer' && [
          styles.bottomStyle,
          { borderTopColor: isDefaultTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
        ],
      ]}
    >
      <BlurView style={styles.blurView} blurType={isDefaultTheme ? 'dark' : 'xlight'} />
      <View
        style={[
          styles.bottomContent,
          { backgroundColor: isDefaultTheme ? 'rgba(40,49,65,1)' : 'rgba(255,255,255,1)' },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.powerBtns,
            { backgroundColor: isDefaultTheme ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,0.1)' },
            !!power && { backgroundColor: themeColor },
          ]}
          activeOpacity={0.7}
          onPress={handlePower}
        >
          <View style={[styles.power]}>
            <IconFont
              d={icons.power}
              size={cx(30)}
              color={power ? '#fff' : isDefaultTheme ? '#fff' : 'rgba(0,0,0,0.7)'}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.btns}>
          {getDataSource.map(item => {
            const isActive = showTab === item.key;
            return (
              <TouchableOpacity
                style={styles.btn}
                activeOpacity={0.7}
                key={item.key}
                onPress={item.onPress}
              >
                <IconFont
                  d={item.iconPath}
                  size={cx(30)}
                  color={isActive ? activeIconColor : iconColor}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default Bar;

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    bottom: 0,
    width: winWidth,
    height: isIphoneX ? cx(110) : cx(90),
    borderTopRightRadius: cx(32),
    borderTopLeftRadius: cx(32),
    overflow: 'hidden',
  },
  bottomStyle: {
    borderTopWidth: 1,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  bottomContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: isIphoneX ? cx(20) : 0,
  },
  powerBtns: {
    marginLeft: cx(14),
    minWidth: cx(94),
    height: cx(52),
    borderRadius: cx(26),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.1)',
    flexDirection: 'row',
  },
  power: {
    height: cx(52),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: cx(20),
  },
  btns: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: cx(10),
  },
  btn: {
    width: cx(60),
    height: cx(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    width: '100%',
    height: '100%',
  },
});
