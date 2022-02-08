import React from 'react';
import { Animated, ImageBackground, StyleSheet, Image } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import LottieView from 'lottie-react-native';
import Res from '@res';
import LottieJson from '../res/lottieJson';

const { convertX: cx } = Utils.RatioUtils;

const AnimatedBackground = Animated.createAnimatedComponent(ImageBackground);

const AnimatedBtn = ({
  leftX = new Animated.Value(0),
  btnLoading = false,
  moveDire = 'right',
  themeColor = '#3Ee',
}) => {
  return (
    <AnimatedBackground style={[styles.slideThumb, { left: leftX }]} source={Res.benchBtn4}>
      <Image source={Res.benchBtn2} style={[styles.slideThumbBG, { tintColor: themeColor }]} />
      <Image source={Res.benchBtn1} style={[styles.slideThumbBG]} />
      {btnLoading ? (
        <LottieView
          source={LottieJson[moveDire === 'right' ? 'spinRight' : 'spinLeft']}
          autoPlay={true}
          style={{ width: cx(24), height: cx(24) }}
        />
      ) : (
        <Image source={Res.lockKey} style={{ width: cx(25), height: cx(30) }} />
      )}
    </AnimatedBackground>
  );
};
export default AnimatedBtn;

const styles = StyleSheet.create({
  slideThumb: {
    position: 'absolute',
    top: 2,
    width: cx(116),
    height: cx(116),
    alignItems: 'center',
    paddingTop: cx(32),
  },
  slideThumbBG: {
    position: 'absolute',
    width: cx(116),
    height: cx(116),
  },
});
