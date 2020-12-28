import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { commonConfig } from '@config';
import { actions } from '@models';
import { PtzFullScreen, ZoomFullScreen } from '@components';
import Res from '@res';

const { cx } = commonConfig;

interface FullFeatureBottomLeftProps {
  hideFullMenu: boolean;
  resetFullScreenBtn: (__: any) => void;
}

const FullFeatureBottomLeft: React.FC<FullFeatureBottomLeftProps> = (
  props: FullFeatureBottomLeft
) => {
  const { hideFullMenu } = props;
  const dispatch = useDispatch();
  const timeoutHandle: any = useRef();
  const [btnAnim, setBtnAnim] = useState(new Animated.Value(0));
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const dpState = useSelector((state: any) => state.dpState);
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
      toValue: -Math.ceil(cx(170)),
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

  const stopMenuAnim = () => {
    dispatch(
      actions.ipcCommonActions.stopFullAnim({
        stopFullAnim: true,
      })
    );
  };

  return (
    <Animated.View style={[styles.fullFeatureBottomLeftPage, { left: btnAnim }]}>
      {dpState.ptz_control !== undefined && <PtzFullScreen stopMenuAnim={stopMenuAnim} />}
      {/* {!showSelfModal && <ZoomFullScreen showfullScreen={this.props.changeStopAnimateState} />} */}
      {dpState.zoom_control && <ZoomFullScreen stopMenuAnim={stopMenuAnim} />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullFeatureBottomLeftPage: {
    position: 'absolute',
    bottom: cx(40),
    flexDirection: 'row',
  },
});

export default FullFeatureBottomLeft;
