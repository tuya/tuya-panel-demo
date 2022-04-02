/* eslint-disable import/no-unresolved */
/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { IColour, IControlData } from '@types';
import LinearSlider from './LinearSlider';

const { convert: cx } = Utils.RatioUtils;
const { color } = Utils.ColorUtils;
interface Props {
  disabled: boolean;
  handleChange: (data: IControlData) => void;
  handleChangeComplete: (data: IColour) => void;
  data: IColour;
  isCloud: boolean;
  // eslint-disable-next-line react/require-default-props
  dimmerOpacity?: Animated.Value;
}

const ColorSlider: React.FC<Props> = ({
  disabled,
  isCloud,
  data,
  handleChange,
  handleChangeComplete,
  dimmerOpacity = 1,
}) => {
  // 灯光的颜色值，从dp获取
  const [colour, setColour] = useState({
    hue: data.hue,
    saturation: data.saturation,
    value: data.value,
  });

  useEffect(() => {
    setColour({ hue: data.hue, saturation: data.saturation, value: data.value });
  }, [data]);

  const updateUi = (v: number, type: string) => {
    const cmd = {
      hue: colour.hue,
      saturation: colour.saturation,
      value: colour.value,
    };
    switch (type) {
      case 'hue':
        cmd.hue = v;
        break;
      case 'saturation':
        cmd.saturation = v;
        break;
      case 'brightness':
        cmd.value = v;
        break;
      default:
        break;
    }
    return cmd;
  };

  const handleColorChange = (v: number, type: string) => {
    const result = updateUi(v, type);
    handleChange(
      isCloud
        ? result
        : {
            ...result,
            mode: 1,
            brightness: 0,
            temperature: 0,
          }
    );
  };

  const handleColorComplete = (v: number, type: string) => {
    const result = updateUi(v, type);
    handleChangeComplete(result);
  };
  return (
    <Animated.View style={[styles.linerSliderContainer, { opacity: dimmerOpacity }]}>
      <LinearSlider
        min={0}
        max={360}
        type="hue"
        showMin={0}
        disabled={disabled}
        color={{ hue: colour.hue, saturation: 1000, value: 1000 }}
        value={colour.hue}
        onMove={(v: number) => handleColorChange(v, 'hue')}
        onPress={(v: number) => handleColorComplete(v, 'hue')}
        onRelease={(v: number) => handleColorComplete(v, 'hue')}
      />
      <LinearSlider
        min={0}
        max={1000}
        showMin={0}
        disabled={disabled}
        color={{
          hue: colour.hue,
          saturation: colour.saturation,
          value: 1000,
        }}
        type="saturation"
        trackBg={{ '0%': '#FFF', '100%': color.hsb2hex(colour.hue, 100, 100) }}
        value={colour.saturation}
        onMove={(v: number) => handleColorChange(v, 'saturation')}
        onPress={(v: number) => handleColorComplete(v, 'saturation')}
        onRelease={(v: number) => handleColorComplete(v, 'saturation')}
      />
      <LinearSlider
        min={10}
        max={1000}
        showMin={10}
        color={color}
        disabled={disabled}
        type="brightness"
        trackBg={{ '0%': '#2F2F2F', '100%': '#fff' }}
        value={colour.value}
        onMove={(v: number) => handleColorChange(v, 'brightness')}
        onPress={(v: number) => handleColorComplete(v, 'brightness')}
        onRelease={(v: number) => handleColorComplete(v, 'brightness')}
      />
    </Animated.View>
  );
};
export default ColorSlider;

const styles = StyleSheet.create({
  linerSliderContainer: {
    marginHorizontal: cx(16),
    marginVertical: cx(24),
    justifyContent: 'flex-start',
  },
});
