import React, { FC, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Button, Utils, TYSdk, useTheme } from 'tuya-panel-kit';
import { BlurView } from '@react-native-community/blur';
import { useDispatch } from 'react-redux';
import { useCreation } from 'ahooks';
import _ from 'lodash';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import useSelector from '@hooks/useSelector';
import { HomeTab } from '@types';
import { CommonActions } from '@actions';
import Icons from '@res/icons';
import DpCodes from '@config/dpCodes';
import * as MusicManager from '@utils/music';

const { handleHomeTabChange } = CommonActions;
const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { powerCode, sceneCode, micMusicCode, lightPixelNumberSetCode } = DpCodes;

interface ControllerBarProps {
  isOpenMike?: boolean;
  countdown?: number;
}

const ControllerBar: FC<ControllerBarProps> = () => {
  const dispatch = useDispatch();

  const { isDarkTheme, themeColor, boxBgColor }: any = useTheme();
  const { power, homeTab } = useSelector(({ dpState, uiState }) => ({
    power: dpState[powerCode],
    homeTab: uiState.homeTab,
  }));

  const supportCloudTiming = useCreation(
    () => !!TYSdk.devInfo.panelConfig.bic?.some(item => item?.selected && item?.code === 'timer'),
    []
  );

  const handlePower = () => {
    if (power) MusicManager.close();
    // Remove the throttling, or you won't be able to turn off the lights while the music is playing
    dragon.putDpData({ [powerCode]: !power }, { useThrottle: false, clearThrottle: true });
  };

  const handleTabChange = (tab: HomeTab) => {
    dispatch(handleHomeTabChange(tab));
  };

  const homeTabs = useMemo(
    () =>
      [
        {
          key: HomeTab.dimmer,
          iconPath: Icons.dimmer,
          hidden: !SupportUtils.isSupportColour() && !SupportUtils.isSupportWhite(),
        },
        {
          key: HomeTab.scene,
          iconPath: Icons.scene,
          hidden: !SupportUtils.isSupportDp(sceneCode),
        },
        {
          key: HomeTab.music,
          iconPath: Icons.music,
          hidden: !SupportUtils.isSupportMusic() && !SupportUtils.isSupportDp(micMusicCode),
        },
        {
          key: HomeTab.other,
          iconPath: Icons.more,
          hidden:
            !supportCloudTiming &&
            !(
              (SupportUtils.isSupportCountdown() ||
                SupportUtils.isSupportDp(lightPixelNumberSetCode)) &&
              !SupportUtils.isGroupDevice()
            ),
        },
      ].filter(item => !item.hidden),
    [supportCloudTiming]
  );

  const powerOffColor = isDarkTheme ? '#383838' : '#E8EDFB';
  const iconColor = isDarkTheme ? 'rgba(255,255,255,0.3)' : '#CFCFCF';
  const activeIconColor = isDarkTheme ? '#fff' : themeColor;

  return (
    <View
      style={[
        styles.container,
        homeTab !== HomeTab.dimmer && { borderTopLeftRadius: cx(20), borderTopRightRadius: cx(20) },
      ]}
    >
      {Platform.OS === 'ios' && homeTab !== HomeTab.dimmer ? (
        <BlurView style={styles.blurView} blurType={isDarkTheme ? 'dark' : 'xlight'} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: boxBgColor }]} />
      )}
      <View style={styles.content}>
        <Button
          background={power ? themeColor : powerOffColor}
          style={styles.powerBtn}
          iconSize={cx(26)}
          iconPath={Icons.power}
          iconColor={power || isDarkTheme ? '#fff' : themeColor}
          onPress={handlePower}
        />
        {homeTabs.map(item => (
          <Button
            key={item.key}
            iconPath={item.iconPath}
            iconColor={homeTab === item.key ? activeIconColor : iconColor}
            iconSize={cx(30)}
            onPress={() => handleTabChange(item.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: isIphoneX ? cx(105) : cx(75),
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingLeft: cx(24),
    paddingRight: cx(31),
    paddingBottom: isIphoneX ? cx(34) : cx(5),
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  powerBtn: {
    width: cx(88),
    height: cx(48),
    borderRadius: cx(26),
  },
});

export default ControllerBar;
