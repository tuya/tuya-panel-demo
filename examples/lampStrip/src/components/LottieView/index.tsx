/* eslint-disable react/require-default-props */
import React, { useEffect, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Lottie from 'lottie-react-native';
import useAppActive from '@hooks/useAppActive';

// copied from @types/react-native-lottie
interface AnimationObject {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: any[];
  layers: any[];
}
interface MyLottieProps {
  style?: StyleProp<ViewStyle>;
  autoPlay?: boolean;
  loop?: boolean;
  source: string | AnimationObject | { uri: string };
}

const LottieView: React.FC<MyLottieProps> = ({ style, autoPlay, loop, source, ...restProps }) => {
  const lottieRef = useRef<Lottie>(null);

  // fix lottie animation not update when source changed
  useEffect(() => {
    if (autoPlay) lottieRef.current?.play();
  }, [autoPlay, source]);

  // fix lottie animation not playing when app is switched from background to foreground
  useAppActive(() => {
    lottieRef.current?.play();
  });

  return (
    <Lottie
      ref={lottieRef}
      style={style}
      autoPlay={autoPlay}
      loop={loop}
      source={source}
      {...restProps}
    />
  );
};

export default LottieView;
