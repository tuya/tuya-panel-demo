/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TYSdk, Dialog } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import { SupportUtils, StorageUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { HomeTab } from '@types';
import DpCodes from '@config/dpCodes';
import useSelector from '@hooks/useSelector';
import MyTopBar from '@components/MyTopBar';
import PageBackground from '@components/PageBackground';
import Strings from '@i18n';
import ControllerBar from './ControllerBar';
import DimmerView from './dimmer';
import SceneView from './scene';
import MusicView from './music';
import OtherView from './other';

const { micMusicCode, lightPixelNumberSetCode } = DpCodes;
const titleMap = {
  [HomeTab.dimmer]: TYSdk.devInfo.name,
  [HomeTab.scene]: Strings.getLang('title_scene'),
  [HomeTab.music]: Strings.getLang('title_music'),
  [HomeTab.other]: Strings.getLang('title_other'),
};

const Home: React.FC = () => {
  const navigation = useNavigation();
  const { homeTab, power } = useSelector(({ uiState, dpState }) => ({
    homeTab: uiState.homeTab,
    power: dpState.switch_led,
  }));
  const GUIDE_SET = 'GUIDE_SET_3';
  const onHideGuideMask = async () => {
    await StorageUtils.setDevItem(GUIDE_SET, true);
  };

  const handleSetting = () => {
    navigation.navigate('light_strip_length');
  };
  const getDevItemGuideSet = async () => {
    await StorageUtils.getDevItem(GUIDE_SET).then(d => {
      if (!d) {
        Dialog.confirm({
          title: Strings.getLang('guideSetting'),
          cancelText: Strings.getLang('cancel'),
          confirmText: Strings.getLang('adapt'),
          confirmTextStyle: { color: '#1082FE' },
          titleNumberOfLines: 4,
          onCancel: () => {
            Dialog.close();
            onHideGuideMask();
          },
          onConfirm: () => {
            Dialog.close();
            onHideGuideMask();
            handleSetting();
          },
        });
      }
    });
  };
  useEffect(() => {
    if (SupportUtils.isSupportDp(lightPixelNumberSetCode) && power) {
      getDevItemGuideSet();
    }
  }, [power]);

  const isSupportMusic = useMemo(
    () => SupportUtils.isSupportMusic() || SupportUtils.isSupportDp(micMusicCode),
    []
  );

  const getTopBar = (absolute?: boolean) => (
    <MyTopBar
      absolute={absolute}
      title={titleMap[HomeTab[homeTab]]}
      actions={[{ name: 'pen', onPress: () => TYSdk.native.showDeviceMenu() }]}
    />
  );

  return (
    <View style={styles.container}>
      {(homeTab !== HomeTab.dimmer || Platform.OS === 'ios') && <PageBackground />}
      {homeTab !== HomeTab.scene && getTopBar()}
      {homeTab === HomeTab.dimmer && <DimmerView />}
      {homeTab === HomeTab.scene && <SceneView />}
      {homeTab === HomeTab.music && isSupportMusic && <MusicView />}
      {homeTab === HomeTab.other && <OtherView />}
      {homeTab === HomeTab.scene && getTopBar(true)}
      <ControllerBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Home;
