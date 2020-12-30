import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { useSelector, useDispatch } from 'react-redux';
import { commonClick, cameraData, commonConfig } from '@config';
import { actions } from '@models';
import Res from '@res';

const { cx, isIOS } = commonConfig;

interface FullFeatureTopRightProps {
  hideFullMenu: boolean;
  resetFullScreenBtn: (__: any) => void;
}

const FullFeatureTopRight: React.FC<FullFeatureTopRightProps> = (props: FullFeatureTopRight) => {
  const dispatch = useDispatch();
  const { hideFullMenu } = props;
  const timeoutHandle: any = useRef();
  const [menuArr, setMenuArr] = useState([]);
  const [btnAnim] = useState(new Animated.Value(10));
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);

  useEffect(() => {
    ipcCommonState.stopFullAnim && stopAnimateFullScreen();
    return () => {
      stopAnimateFullScreen();
    };
  }, []);

  useEffect(() => {
    getRightMenu(ipcCommonState.voiceStatus);
  }, [ipcCommonState.voiceStatus]);

  useEffect(() => {
    if (!ipcCommonState.stopFullAnim) {
      animatePlayerFeature(props.hideFullMenu);
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
      toValue: -80,
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
      toValue: 10,
    }).start();
  };

  const getRightMenu = (status: any) => {
    const initMenu: any = [
      {
        show: true,
        key: 'mute',
        imgSource: status === 'OFF' ? Res.publicImage.basicMute : Res.publicImage.basicNotMute,
      },
    ];
    setMenuArr(initMenu);
  };

  const menuClick = (key: string) => {
    dispatch(
      actions.ipcCommonActions.stopFullAnim({
        stopFullAnim: true,
      })
    );
    switch (key) {
      case 'mute':
        if (commonClick.isRecordingChangeMute() || commonClick.isMicTalking()) {
          return false;
        }
        commonClick.enableMute();
        break;
      default:
        return false;
    }
  };

  const switchClarity = () => {
    if (commonClick.isRecordingNow() || commonClick.isMicTalking()) {
      return false;
    }
    dispatch(
      actions.ipcCommonActions.stopFullAnim({
        stopFullAnim: true,
      })
    );
    dispatch(
      actions.ipcCommonActions.showSelfFullClarityModal({
        showSelfFullClarityModal: true,
      })
    );
    props.resetFullScreenBtn(true);
  };

  return (
    <Animated.View
      style={[
        styles.fullFeatureTopRightPage,
        { top: btnAnim, right: ipcCommonState.fullAbsoluteStartValue },
      ]}
    >
      <View style={styles.topRightBox}>
        {menuArr.map((item: any) => (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.menuItem}
            key={item.key}
            onPress={() => menuClick(item.key)}
          >
            {item.show && <Image source={item.imgSource} style={styles.menuItemImg} />}
          </TouchableOpacity>
        ))}
        {ipcCommonState.clarityStatus !== 'AUDIO' && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.topResolutionBox}
            onPress={switchClarity}
          >
            <TYText style={styles.topResolutionText} numberOfLines={1}>
              {cameraData.decodeClarityStatusString[ipcCommonState.clarityStatus]}
            </TYText>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullFeatureTopRightPage: {
    position: 'absolute',
    padding: cx(5),
  },
  topRightBox: {
    flexDirection: 'row',
    top: cx(3),
    alignItems: 'center',
  },
  menuItemImg: {
    width: cx(30),
    resizeMode: 'contain',
  },
  menuItem: {
    marginRight: Math.ceil(cx(15)),
  },
  topResolutionBox: {},
  topResolutionText: {
    fontSize: Math.ceil(cx(12)),
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: Math.ceil(cx(4)),
    paddingVertical: isIOS ? Math.ceil(cx(2)) : 0,
    borderWidth: 2,
    borderColor: '#fff',
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default FullFeatureTopRight;
