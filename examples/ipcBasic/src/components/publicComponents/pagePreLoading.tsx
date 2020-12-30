import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { commonConfig } from '@config';
import Res from '@res';

const { cx, topBarHeight, statusBarHeight, isIOS } = commonConfig;

interface PagePreLoadingProps {}

const PagePreLoading: React.FC<PagePreLoadingProps> = (props: PagePreLoadingProps) => {
  const [rotateValue] = useState(new Animated.Value(0));

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    rotateValue.setValue(0);
    Animated.timing(rotateValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
    }).start(() => startAnimation());
  };

  return (
    <View style={styles.loadingToastPage}>
      <Animated.Image
        source={Res.publicImage.prevLoading}
        style={[
          styles.loadingNormal,
          {
            width: isIOS ? cx(14) : cx(28),
            top: isIOS ? 0 : statusBarHeight / 2,
            transform: [
              {
                rotate: rotateValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingToastPage: {
    paddingHorizontal: 50,
    position: 'absolute',
    top: -(topBarHeight + statusBarHeight),
    left: 0,
    right: 0,
    bottom: -(topBarHeight + statusBarHeight),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingNormal: {
    width: cx(28),
    resizeMode: 'contain',
  },
});

export default PagePreLoading;
