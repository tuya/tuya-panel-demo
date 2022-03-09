/* eslint-disable new-cap */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Res from '@res';

const LightAnimationView: React.FC = () => {
  const lampFadeOutOpacity = useRef(new Animated.Value(0)).current;
  const borderFadeOutOpacity = useRef(new Animated.Value(1)).current;
  const FadeOutAnimated = (start: number, end: number, obj: Animated.Value | Animated.ValueXY) =>
    Animated.sequence([
      Animated.timing(obj, {
        toValue: start,
        duration: 1000,
        easing: Easing.linear,
      }),
      Animated.timing(obj, {
        toValue: end,
        duration: 1000,
        easing: Easing.linear,
      }),
    ]);
  useEffect(() => {
    Animated.loop(FadeOutAnimated(1, 0, lampFadeOutOpacity)).start();
    Animated.loop(FadeOutAnimated(0, 1, borderFadeOutOpacity)).start();
  }, []);
  return (
    <View style={styles.animationContainer}>
      <Image source={Res.ligthAnimation} />
      <View style={styles.image}>
        <Animated.Image
          source={Res.lamp}
          style={{ position: 'absolute', top: 0, left: 0, opacity: lampFadeOutOpacity }}
        />
        <Animated.Image
          source={Res.lamp_border}
          style={{ position: 'absolute', top: 0, left: 0, opacity: borderFadeOutOpacity }}
        />
      </View>
    </View>
  );
};
export default LightAnimationView;
const styles = StyleSheet.create({
  animationContainer: { position: 'relative' },
  image: { width: 38, height: 58, position: 'absolute', top: 6, right: 33 },
});
