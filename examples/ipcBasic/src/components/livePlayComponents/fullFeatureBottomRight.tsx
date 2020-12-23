import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { TYIpcNative } from '@tuya-smart/tuya-panel-ipc-sdk';
import _ from 'lodash';
import color from 'color';
import { actions } from '@models';
import { useSelector, useDispatch } from 'react-redux';
import { commonConfig, commonClick } from '@config';
import Res from '@res';
import Strings from '@i18n';

const { cx } = commonConfig;

interface FullFeatureBottomRightProps {
  hideFullMenu: boolean;
  resetFullScreenBtn: (__: any) => void;
}

const FullFeatureBottomRight: React.FC<FullFeatureBottomRightProps> = (
  props: FullFeatureBottomRightProps
) => {
  const { hideFullMenu } = props;
  const timeoutHandle: any = useRef();
  const dispatch = useDispatch();
  const [menuArr, setMenuArr] = useState([]);
  const [btnAnim, setBtnAnim] = useState(new Animated.Value(0));
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeContentBgc = customTheme[type].contentBgc;

  useEffect(() => {
    ipcCommonState.stopFullAnim && stopAnimateFullScreen();
    return () => {
      stopAnimateFullScreen();
    };
  }, []);

  useEffect(() => {
    setBtnAnim(new Animated.Value(ipcCommonState.fullAbsoluteStartValue));
  }, [ipcCommonState.fullAbsoluteStartValue]);

  useEffect(() => {
    getRightMenu(ipcCommonState);
  }, [ipcCommonState.isSupportMic, ipcCommonState.isTwoWayTalk]);

  const getRightMenu = (nextProps: any) => {
    const initMenu: any = [
      {
        show: true,
        key: 'video',
        imgSource: Res.publicImage.fullVideo,
      },
      {
        show: nextProps.isSupportMic,
        key: 'mic',
        imgSource: !nextProps.isTwoWayTalk
          ? Res.publicImage.fullOneWayTalk
          : Res.publicImage.fullTwoWayTalk,
      },
      {
        show: true,
        key: 'photo',
        imgSource: Res.publicImage.fullCutScreen,
      },
    ];
    setMenuArr(initMenu);
  };

  useEffect(() => {
    if (!ipcCommonState.stopFullAnim) {
      animatePlayerFeature(hideFullMenu);
    }
  }, [hideFullMenu]);

  useEffect(() => {
    if (ipcCommonState.stopFullAnim) {
      stopAnimateFullScreen();
    }
  }, [ipcCommonState.stopFullAnim]);

  const stopAnimateFullScreen = () => {
    clearTimeout(timeoutHandle.current);
    showFullScreenBtn();
    props.resetFullScreenBtn(false);
  };

  /**
   * 隐藏全屏按钮定时器
   */
  const hideButtonTimer = () => {
    timeoutHandle.current = setTimeout(() => {
      hideFullScreenBtn();
      props.resetFullScreenBtn(true);
    }, 5000);
  };

  const hideFullScreenBtn = () => {
    Animated.timing(btnAnim, {
      toValue: -Math.ceil(cx(120)),
    }).start();
  };

  const animatePlayerFeature = (showAnimate: boolean) => {
    clearTimeout(timeoutHandle.current);
    if (showAnimate) {
      hideFullScreenBtn();
    } else {
      showFullScreenBtn();
      hideButtonTimer();
    }
  };

  const showFullScreenBtn = () => {
    Animated.timing(btnAnim, {
      toValue: ipcCommonState.fullAbsoluteStartValue,
    }).start();
  };

  const clickBottomBtn = (key: string) => {
    dispatch(
      actions.ipcCommonActions.stopFullAnim({
        stopFullAnim: true,
      })
    );
    switch (key) {
      case 'video':
        commonClick.enableRecord();
        break;
      case 'mic':
        micCamera();
        break;
      case 'photo':
        commonClick.snapShoot();
        break;
      default:
        return false;
    }
  };

  const micCamera = () => {
    if (!ipcCommonState.isTwoWayTalk) {
      TYIpcNative.showToast(Strings.getLang('holdToTalk'));
    } else if (ipcCommonState.isTalking) {
      TYIpcNative.enableStopTalk(ipcCommonState.isTwoWayTalk);
    } else {
      TYIpcNative.showToast(Strings.getLang('clickToCall'));
      TYIpcNative.enableStartTalk(ipcCommonState.isTwoWayTalk);
    }
  };

  const clickLongSingleMic = (key: string) => {
    key === 'mic' &&
      !ipcCommonState.isTwoWayTalk &&
      TYIpcNative.enableStartTalk(ipcCommonState.isTwoWayTalk);
  };

  const clickInSingleMic = (key: string) => {
    clickBottomBtn(key);
  };

  const clickOutSingleMic = (key: string) => {
    key === 'mic' &&
      !ipcCommonState.isTwoWayTalk &&
      TYIpcNative.enableStopTalk(ipcCommonState.isTwoWayTalk);
  };

  const renderMicBtn = (item: any) => {
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        activeOpacity={0.7}
        key={item.key}
        disabled={ipcCommonState.isRecording}
        onLongPress={() => clickLongSingleMic(item.key)}
        onPressIn={_.throttle(() => clickInSingleMic(item.key), 800)}
        onPressOut={() => clickOutSingleMic(item.key)}
      >
        <View style={[styles.itemImgBox, { opacity: ipcCommonState.isRecording ? 0.2 : 1 }]}>
          <Image
            source={item.imgSource}
            style={[
              styles.itemMenuImg,
              {
                tintColor: ipcCommonState.isTalking ? ipcCommonState.panelItemActiveColor : '#fff',
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderNotMicBtn = (item: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={item.key === 'video' && ipcCommonState.isRecordingDisabled}
        key={item.key}
        onPress={_.throttle(() => clickInSingleMic(item.key), 800)}
      >
        <View
          style={[
            styles.itemImgBox,
            { opacity: item.key === 'video' && ipcCommonState.isRecordingDisabled ? 0.2 : 1 },
          ]}
        >
          <Image
            source={item.imgSource}
            style={[
              styles.itemMenuImg,
              {
                tintColor:
                  ipcCommonState.isRecording && item.key === 'video'
                    ? item.key === 'video' && ipcCommonState.isRecordingDisabled
                      ? ipcCommonState.panelItemActiveColor
                      : ipcCommonState.panelItemActiveColor
                    : '#fff',
              },
            ]}
          />
        </View>
      </TouchableOpacity>
      // ? color(ipcCommonState.panelItemActiveColor).alpha(0.5).rgbString()
    );
  };

  return (
    <Animated.View style={[styles.fullFeatureBootomRightPage, { right: btnAnim }]}>
      {menuArr.map((item: any) => (
        <View key={item.key} style={styles.menuPannelBox}>
          {item.key === 'mic' && item.show && renderMicBtn(item)}
          {item.key !== 'mic' && renderNotMicBtn(item)}
        </View>
      ))}
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  fullFeatureBootomRightPage: {
    position: 'absolute',
    bottom: cx(20),
  },
  menuPannelBox: {},
  itemImgBox: {
    width: cx(50),
    height: cx(50),
    marginBottom: cx(30),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Math.ceil(cx(25)),
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMenuImg: {
    tintColor: '#fff',
    width: cx(32),
    resizeMode: 'contain',
  },
});

export default FullFeatureBottomRight;
