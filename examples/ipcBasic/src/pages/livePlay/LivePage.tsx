/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderView, SwitchDialog } from '@components';
import { commonConfig, commonClick } from '@config';
import { actions } from '@models';
import LivePlayerView from './Live-player-view';
import LiveControlView from './Live-control-view';

const { winWidth, winHeight, isIOS } = commonConfig;

interface LivePageProps {}

const LivePage: React.FC<LivePageProps> = (props: LivePageProps) => {
  const [fullPlayerWidth, setFullPlayerWidth] = useState(winWidth);
  const [fullPlayerHeight, setFullPlayerHeight] = useState(winHeight);
  const dispatch = useDispatch();
  const devInfo = useSelector((state: any) => state.devInfo);
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const theme = useSelector((state: any) => state.theme);

  let firstLoadpage = true;

  useEffect(() => {
    commonClick.getInitLiveConig();
    // 获取是否支持云存储,通过redux存储
    commonClick.isSuppportedCloudStorage();
  }, []);

  const _onLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    if (!ipcCommonState.isFullScreen && !isIOS && firstLoadpage) {
      // 对安卓区分是全面屏还是经典屏
      if (Math.abs(winHeight - height) > 2 && winHeight < 800) {
        // 不相等表示安卓经典导航模式,默认给全屏
        dispatch(
          actions.ipcCommonActions.isAndriodFullScreenNavMode({
            isAndriodFullScreenNavMode: false,
          })
        );
      }
    }
    firstLoadpage = false;
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
      {/* {ipcCommonState.showCustomDialog && <CustomDialog dataSource={ipcCommonState.popData} />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  livePage: {
    flex: 1,
  },
});

export default LivePage;
