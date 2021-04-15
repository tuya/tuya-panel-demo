import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { TYIpcPlayer } from '@tuya/tuya-panel-ipc-sdk';
import { actions } from '@models';
import { cameraData, commonClick, commonConfig } from '@config';

const { cx } = commonConfig;

interface LivePlayerViewProps {
  fullPlayerWidth: number;
  fullPlayerHeight: number;
  isFullScreen: boolean;
}

const LivePlayerView: React.FC<LivePlayerViewProps> = (props: LivePlayerViewProps) => {
  let isRecordDisableTime: any = null;
  const [hideFullMenu, setHideFullMenu] = useState(false);
  const dispatch = useDispatch();

  const devInfo = useSelector((state: any) => state.devInfo);
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const dpState = useSelector((state: any) => state.dpState);
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeBackground = customTheme[type].background;
  const themeCommonTextColor = customTheme[type].commonTextColor;
  // 截屏弹窗自定义样式, 根据主题变更
  const cutStyle = {
    containerStyle: {
      backgroundColor: themeBackground,
    },
    descTxtStyle: { color: themeCommonTextColor },
    albumBox: { backgroundColor: ipcCommonState.panelItemActiveColor },
    albumTxt: { color: '#ffffff' },
  };
  // 定时弹窗样式
  const timerInterValStyle = {
    timerPageNormal: {
      left: 120,
      right: 120,
    },
    dotStyle: {
      backgroundColor: ipcCommonState.panelItemActiveColor,
    },
  };
  // 双向通话提示样式
  const twoMicStyle = {
    topNormalPage: { top: 70 },
  };

  const { fullPlayerWidth, fullPlayerHeight, isFullScreen } = props;
  useEffect(() => {
    getFullScreenAbsoulteStartValue(props);
  }, [isFullScreen, fullPlayerWidth, fullPlayerHeight]);

  const getFullScreenAbsoulteStartValue = (newProps: any) => {
    if (newProps.isFullScreen && newProps.fullPlayerWidth > newProps.fullPlayerHeight) {
      const isSixteen = newProps.fullPlayerWidth / newProps.fullPlayerHeight >= 16 / 9;
      const fullLiveWidth = Math.ceil((newProps.fullPlayerHeight * 16) / 9);
      let absoluteValue = Math.ceil(cx(5));
      isSixteen &&
        (absoluteValue = Math.round((newProps.fullPlayerWidth - fullLiveWidth) / 2 + cx(2)));
      dispatch(
        actions.ipcCommonActions.fullAbsoluteStartValue({ fullAbsoluteStartValue: absoluteValue })
      );
    }
  };

  const onChangeStreamStatus = (status: number) => {
    dispatch(actions.ipcCommonActions.videoStatus({ videoStatus: status }));
  };

  const onChangeScreenOrientation = (isFull: boolean) => {
    dispatch(actions.ipcCommonActions.isFullScreen({ isFullScreen: isFull }));
  };

  const onChangeSupportedMicWay = (micData: any) => {
    const { isSupportMic, isTwoWayTalk } = micData;
    dispatch(actions.ipcCommonActions.isSupportMic({ isSupportMic }));
    dispatch(actions.ipcCommonActions.isTwoWayTalk({ isTwoWayTalk }));
  };

  const onListenTalkingChangeMute = (status: 'ON' | 'OFF') => {
    dispatch(actions.ipcCommonActions.voiceStatus({ voiceStatus: status }));
  };

  const onListenIsTalking = (isTalking: boolean) => {
    dispatch(actions.ipcCommonActions.isTalking({ isTalking }));
  };

  const onFullScreenTapView = (hideFull: boolean) => {
    setHideFullMenu(hideFull);
    dispatch(actions.ipcCommonActions.stopFullAnim({ stopFullAnim: false }));
  };

  const onChangeRecording = (isRecording: boolean) => {
    let isRecordingDisabled = false;
    clearTimeout(isRecordDisableTime);
    dispatch(actions.ipcCommonActions.isRecording({ isRecording }));
    isRecording && (isRecordingDisabled = true);
    dispatch(actions.ipcCommonActions.isRecordingDisabled({ isRecordingDisabled }));
    isRecordDisableTime = setTimeout(() => {
      dispatch(actions.ipcCommonActions.isRecordingDisabled({ isRecordingDisabled: false }));
    }, 3000);
  };

  const onChangeZoomStatus = (data: any) => {
    if (typeof data !== 'number') {
      const { scaleStatus, currentVideoScale } = data;
      // 视频画面变化 此处可获取当前视频的播放比例、画面大小比例
      dispatch(actions.ipcCommonActions.currentScaleStatus({ currentScaleStatus: scaleStatus }));
    }
  };

  const onChangeActiveZoomStatus = (data: any) => {
    const { zoomStatus } = data;
    dispatch(actions.ipcCommonActions.scaleStatus({ scaleStatus: zoomStatus }));
  };

  return (
    <View style={styles.livePlayerViewPage}>
      <TYIpcPlayer
        isFullScreen={isFullScreen}
        onChangeScreenOrientation={onChangeScreenOrientation}
        fullPlayerWidth={fullPlayerWidth}
        fullPlayerHeight={fullPlayerHeight}
        deviceOnline={devInfo.deviceOnline}
        privateMode={dpState.basic_private}
        onChangeStreamStatus={onChangeStreamStatus}
        onChangeSupportedMicWay={onChangeSupportedMicWay}
        onListenTalkingChangeMute={onListenTalkingChangeMute}
        onListenIsTalking={onListenIsTalking}
        onChangeRecording={onChangeRecording}
        voiceStatus={ipcCommonState.voiceStatus}
        clarityStatus={ipcCommonState.clarityStatus}
        renderNormalComArr={cameraData.normalArr}
        renderFullComArr={cameraData.fullComArr}
        hideFullMenu={hideFullMenu}
        stopFullAnim={ipcCommonState.stopFullAnim}
        onFullScreenTapView={onFullScreenTapView}
        pressEnterAlbum={() => {
          commonClick.toggleNativePage('paramAlbum');
        }}
        onChangeZoomStatus={onChangeZoomStatus}
        onChangeActiveZoomStatus={onChangeActiveZoomStatus}
        scaleMultiple={ipcCommonState.scaleStatus}
        cutStyle={cutStyle}
        showCustomVideoLoad={ipcCommonState.showCustomVideoLoad}
        showCustomVideoText={ipcCommonState.showCustomVideoText}
        timerInterValStyle={timerInterValStyle}
        twoMicStyle={twoMicStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  livePlayerViewPage: {
    flex: 1,
  },
});

export default LivePlayerView;
