/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderView, SwitchDialog, CustomDialog } from '@components';
import { commonConfig, commonClick } from '@config';
import LivePlayerView from './Live-player-view';
import LiveControlView from './Live-control-view';

const { winWidth, winHeight } = commonConfig;

interface LivePageProps {}

const LivePage: React.FC<LivePageProps> = (props: LivePageProps) => {
  const [fullPlayerWidth, setFullPlayerWidth] = useState(winWidth);
  const [fullPlayerHeight, setFullPlayerHeight] = useState(winHeight);
  const devInfo = useSelector((state: any) => state.devInfo);
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);

  useEffect(() => {
    commonClick.getInitLiveConfig();
    // 获取是否支持云存储,通过redux存储
    commonClick.isSupportedCloudStorage();
  }, []);

  const _onLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setFullPlayerWidth(Math.ceil(width));
    setFullPlayerHeight(Math.ceil(height));
  };

  const leftPress = () => {
    commonClick.backDeviceToList();
  };

  const rightPress = () => {
    commonClick.toggleNativePage('setting');
  };

  return (
    <View style={styles.livePage} onLayout={e => _onLayout(e)}>
      <HeaderView
        isFullScreen={ipcCommonState.isFullScreen}
        leftPress={leftPress}
        rightPress={rightPress}
        contentTitle={devInfo.name}
      />
      <LivePlayerView
        isFullScreen={ipcCommonState.isFullScreen}
        fullPlayerWidth={fullPlayerWidth}
        fullPlayerHeight={fullPlayerHeight}
      />
      <LiveControlView isFullScreen={ipcCommonState.isFullScreen} />
      {ipcCommonState.showPopCommon && <SwitchDialog dataSource={ipcCommonState.popData} />}
      {ipcCommonState.showCustomDialog && <CustomDialog dataSource={ipcCommonState.popData} />}
    </View>
  );
};

const styles = StyleSheet.create({
  livePage: {
    flex: 1,
  },
});

export default React.memo(LivePage);
