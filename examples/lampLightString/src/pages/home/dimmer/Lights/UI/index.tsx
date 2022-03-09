import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import Res from '@res';
import { Image, LayoutRectangle, LayoutChangeEvent, Animated, Easing } from 'react-native';
import DpCodes from '@config/dpCodes';
import { useUpdate } from 'ahooks';
import { useTheme, Utils } from 'tuya-panel-kit';
import { avgSplit, colorDataToRgba, sToN } from '@utils';
import { formatUiData, formatData } from '@utils';
import { LightsUIProps } from './interface';
import { uiData } from './config';

const { withTheme } = Utils.ThemeUtils;
const { powerCode, smearCode } = DpCodes;

const Lights: React.FC<LightsUIProps> = props => {
  const { innerRef, lights, theme } = props;
  const { isDarkTheme }: any = useTheme();
  const {
    global: { background },
  } = theme;
  const forceUpdate = useUpdate();
  const containerLayoutRef = useRef<LayoutRectangle>();
  const fadeOutAnimateRef = useRef(new Animated.Value(0)).current;

  const fadeOutAnimate = (value: number) => {
    Animated.timing(fadeOutAnimateRef, {
      toValue: value,
      duration: 100,
      easing: Easing.linear,
    }).start();
  };

  useEffect(() => {
    let timeId = setTimeout(() => {
      fadeOutAnimate(1);
    }, 250);
    return () => {
      clearTimeout(timeId);
    };
  }, []);

  const lightColors = useMemo(
    () =>
      lights.map(l => {
        const [h, s, v, b, t] = avgSplit(l, 4).map(c => sToN(c));
        return [h, s, v, b, t].some(Boolean)
          ? colorDataToRgba({
              isColor: [h, s, v].some(Number),
              hue: h,
              saturation: s,
              value: v,
              brightness: b,
              temperature: t,
            })
          : isDarkTheme
          ? '#222222'
          : '#D1D4E6';
      }),
    [lights, isDarkTheme]
  );

  const handeContainerLayout = (e: LayoutChangeEvent) => {
    containerLayoutRef.current = e.nativeEvent.layout;
    // fix useImperativeHandle获取不到最新值
    forceUpdate();
  };

  useImperativeHandle(innerRef, () => ({ layout: containerLayoutRef.current, UIData: uiData }));
  return (
    <Animated.View
      style={{
        position: 'relative',
        width: formatData(170),
        height: formatData(288),
        overflow: 'hidden',
      }}
      onLayout={handeContainerLayout}
    >
      {formatUiData(uiData).map((uiItem, index) => {
        const { width, height, pos } = uiItem;
        return (
          <Animated.View
            key={String(pos)}
            style={{
              height: height,
              opacity: fadeOutAnimateRef,
              width: width,
              position: 'absolute',
              top: pos[1],
              left: pos[0],
              backgroundColor:
                lightColors.length === 0 ? 'rgba(255,255,255,0.5)' : lightColors[index],
            }}
          ></Animated.View>
        );
      })}
      <Image
        style={{
          width: formatData(170),
          height: formatData(288),
          position: 'absolute',
          top: 0,
          left: 0,
          tintColor: background,
          resizeMode: 'contain',
        }}
        source={Res.lightsSmearDark}
      />
    </Animated.View>
  );
};
export default connect(({ dpState, cloudState, uiState }: any) => ({
  power: dpState[powerCode],
  smearData: dpState[smearCode],
  lights: cloudState.lights || [],
  heigthWidhtRatio: uiState.heigthWidhtRatio,
}))(withTheme(Lights));
