/* eslint-disable indent */
import React, { useMemo, useRef, useImperativeHandle } from 'react';
import { View, StyleSheet, LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Rect } from 'react-native-svg';
import { Utils, LinearGradient, useTheme } from 'tuya-panel-kit';
import _ from 'lodash';
import { useUpdate } from 'ahooks';
import useSelector from '@hooks/useSelector';
import useIoTOtherUIValue from '@hooks/useIoTOtherUIValue';
import { avgSplit, sToN, colorDataToRgba } from '@utils';
import Res from '@res';
import DpCodes from '@config/dpCodes';
import { LightsUIProps, UIDataPropType } from './interface';
import { gradientDirMap, UIDataRectangle, UIDataPipe, UIDataPoint } from './config';
import Img from './Img';

const { convertX: cx } = Utils.RatioUtils;
const { smearCode, workModeCode } = DpCodes;
function getUiInfo(subUiId: string): [number, UIDataPropType[]] {
  if (['0000017ok5', '0000017q44'].includes(subUiId)) return [2, UIDataPipe];
  if (['0000017q40', '0000017pc9'].includes(subUiId)) return [3, UIDataPoint];
  return [1, UIDataRectangle]; // ['0000017pbl', '0000017pbo']
}

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

  const subUiId: string = useIoTOtherUIValue('subUiId');
  const [uiKey, UIData] = useMemo(() => getUiInfo(subUiId), [subUiId]);
  const UIDatas = useMemo(() => {
    const d = UIData.slice(0, ledNumber);
    if ([2, 3].includes(uiKey)) return d;
    // 特殊处理ui1末尾直线型色块
    return d.map((item, index, arr) => ({
      ...item,
      // fix最后一个ele
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
    // fix useImperativeHandle获取不到最新值
    forceUpdate();
  };

  useImperativeHandle(innerRef, () => ({ layout: containerLayoutRef.current, UIData: UIDatas }));

  return (
    <View
      style={[
        uiKey === 1 && styles.ui1Container,
        uiKey === 2 && styles.ui2Container,
        uiKey === 3 && styles.ui3Container,
      ]}
      onLayout={handeContainerLayout}
    >
      {UIDatas.map(({ pos, width, height, gradientDir, imgKey }, index, arr) => (
        <View
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
  ui2Container: {
    width: cx(351),
    height: cx(288),
  },
  ui3Container: {
    width: cx(351),
    height: cx(288),
  },
  item: {
    position: 'absolute',
  },
});

export default LightsUI;
