/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable indent */
import React, { useMemo, useRef, useImperativeHandle } from 'react';
import { View, StyleSheet, LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Rect } from 'react-native-svg';
import { Utils, LinearGradient, useTheme } from 'tuya-panel-kit';
import _ from 'lodash';
import { useUpdate } from 'ahooks';
import useSelector from '@hooks/useSelector';
import { avgSplit, sToN, colorDataToRgba } from '@utils';
import Res from '@res';
import DpCodes from '@config/dpCodes';
import { LightsUIProps } from './interface';
import { gradientDirMap, UIDataRectangle } from './config';
import Img from './Img';

const { convertX: cx } = Utils.RatioUtils;
const { smearCode, workModeCode } = DpCodes;
const LightsUI: React.FC<LightsUIProps> = ({ innerRef }) => {
  const forceUpdate = useUpdate();
  const containerLayoutRef = useRef<LayoutRectangle>();

  const { isDarkTheme, background }: any = useTheme();
  const { gradient, ledNumber, lights, whiteLights, workMode, smearData } = useSelector(
    ({ dpState, uiState, cloudState }) => ({
      gradient: dpState[smearCode]?.effect === 1,
      ledNumber: uiState.ledNumber,
      lights: cloudState.lights || [],
      whiteLights: cloudState.whiteLights || [],
      workMode: dpState[workModeCode],
      smearData: dpState[smearCode],
    })
  );
  const { dimmerMode } = smearData || {};
  const isWhiteMode = dimmerMode === 0;
  const lightColors = useMemo(
    () =>
      (!isWhiteMode ? lights : whiteLights).map(l => {
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
    [lights, isDarkTheme, workMode, whiteLights, isWhiteMode]
  );
  const UIData = UIDataRectangle;
  const uiKey = 1;

  const UIDatas = useMemo(() => {
    const d = UIData.slice(0, ledNumber);
    // special handling for the straight-line block at the end of ui1
    return d.map((item, index, arr) => ({
      ...item,
      // fix last element
      imgKey:
        index === arr.length - 1
          ? [1, 2, 3, 4, 11, 12, 13, 14].includes(index)
            ? 'e2'
            : [6, 7, 8, 9, 16, 17, 18, 19].includes(index)
            ? 'e1'
            : item.imgKey
          : item.imgKey,
    }));
  }, [uiKey, ledNumber]);

  const handeContainerLayout = (e: LayoutChangeEvent) => {
    containerLayoutRef.current = e.nativeEvent.layout;
    // fix useImperativeHandle not getting the latest value
    forceUpdate();
  };

  useImperativeHandle(innerRef, () => ({ layout: containerLayoutRef.current, UIData: UIDatas }));

  return (
    <View style={styles.ui1Container} onLayout={handeContainerLayout}>
      {UIDatas.map(({ pos, width, height, gradientDir, imgKey }, index, arr) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={String(index)}
          style={[styles.item, { left: pos[0], top: pos[1], width, height }]}
        >
          <LinearGradient
            style={{ width, height }}
            {...(gradient ? gradientDirMap[gradientDir] : {})}
            stops={{
              '0%': lightColors[index],
              '100%': lightColors[gradient ? Math.min(index + 1, arr.length - 1) : index],
            }}
          >
            <Rect width={width} height={height} />
          </LinearGradient>
          <Img
            containerStyle={{ width, height }}
            style={{ width, height, resizeMode: 'stretch', tintColor: background }}
            // @ts-ignore wtf
            source={Res[`lights_ui${uiKey}_${imgKey}`]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  ui1Container: {
    width: cx(322),
    height: cx(174),
  },
  item: {
    position: 'absolute',
  },
});

export default LightsUI;
