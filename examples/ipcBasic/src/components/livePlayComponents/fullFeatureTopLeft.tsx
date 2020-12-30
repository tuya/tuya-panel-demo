import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { commonConfig, commonClick } from '@config';
import { actions } from '@models';
import Res from '@res';

const { cx } = commonConfig;

interface FullFeatureTopLeftProps {
  hideFullMenu: boolean;
  resetFullScreenBtn: (__: any) => void;
}

const FullFeatureTopLeft: React.FC<FullFeatureTopLeftProps> = (props: FullFeatureTopLeftProps) => {
  const timeoutHandle: any = useRef();
  const dispatch = useDispatch();
  const [btnAnim] = useState(new Animated.Value(10));
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const { hideFullMenu } = props;
  useEffect(() => {
    ipcCommonState.stopFullAnim && stopAnimateFullScreen();
    return () => {
      stopAnimateFullScreen();
    };
  }, []);

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

  const backFullScreen = () => {
    commonClick.setScreenOrientation(0);
    dispatch(
      actions.ipcCommonActions.stopFullAnim({
        stopFullAnim: true,
      })
    );
  };
  return (
    <Animated.View
      style={[
        styles.fullFeatureTopLeftPage,
        { top: btnAnim, left: ipcCommonState.fullAbsoluteStartValue },
      ]}
    >
      <TouchableOpacity activeOpacity={0.7} style={styles.backArrow} onPress={backFullScreen}>
        <Image source={Res.publicImage.backArrow} style={styles.backArrowImg} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullFeatureTopLeftPage: {
    position: 'absolute',
    padding: cx(5),
  },
  backArrow: {
    width: cx(30),
    height: cx(30),
    borderRadius: Math.ceil(cx(15)),
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowImg: {
    width: cx(30),
    resizeMode: 'contain',
  },
});

export default FullFeatureTopLeft;
