import throttle from 'lodash/throttle';
import React, { useCallback, useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { useSelector } from '@models';
import { lampPutDpData } from '@api';
import Res from '@res';
import HuePicker from '../../../components/HuePicker';
import SliderView from '../../../components/SliderView';
import icons from '../../../res/iconfont';
import DpCodes from '../../../config/dpCodes';
import { ColorParser } from '../../../utils';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { workModeCode, colourCode: colourDataCode, controlCode: controlDataCode } = DpCodes;

const LED_SIZE = Math.min(110, cx(110));
const HUE_RADIUS = Math.min(cy(135), cx(135));
const HUE_INNER_RADIUS = Math.min(cy(76), cx(76));
const THUMB_RADIUS = Math.min(cy(27.5), cx(27.5));
const THUMB_INNER_RADIUS = Math.min(cy(22.5), cx(22.5));

interface MainColourViewProps {
  theme?: any;
}

const MainColourView: React.FC<MainColourViewProps> = ({
  theme: {
    global: { fontColor },
  },
}) => {
  const circleRef = useRef<View>(null);
  const colourData = useSelector(state => state.dpState[colourDataCode]) as string;
  const [hue, saturation, brightness] = ColorParser.decodeColorData(colourData);

  const putControlDataDP = throttle((h: number, s: number, v: number) => {
    if (!controlDataCode) {
      return;
    }
    const encodeControlData = ColorParser.encodeControlData(1, h, s, v, 0, 0);
    lampPutDpData({ [controlDataCode]: encodeControlData });
  }, 150);

  const putColourDataDp = (h: number, s: number, v: number) => {
    const encodeColor = ColorParser.encodeColorData(h, s, v);
    lampPutDpData({
      [workModeCode]: 'colour',
      [colourDataCode]: encodeColor,
    });
  };

  const handleColorChange = useCallback(
    (value, type) => {
      if (!controlDataCode) {
        return;
      }
      let h = hue;
      let s = saturation;
      let v = brightness;
      switch (type) {
        case 'hue':
          h = value;
          break;
        case 'saturation':
          s = value;
          break;
        case 'brightness':
          v = value;
          break;
        default:
          break;
      }
      updatePreview(h, s, v);
      putControlDataDP(h, s, v);
    },
    [hue, saturation, brightness]
  );

  const handleHueComplete = useCallback(
    (hueValue: number) => {
      if (typeof putControlDataDP.cancel === 'function') {
        putControlDataDP.cancel();
      }
      putColourDataDp(hueValue, saturation, brightness);
    },
    [saturation, brightness]
  );

  const handleBrightnessComplete = useCallback(
    brightValue => {
      if (typeof putControlDataDP.cancel === 'function') {
        putControlDataDP.cancel();
      }
      putColourDataDp(hue, saturation, brightValue);
    },
    [hue, saturation]
  );

  const handleSaturationComplete = useCallback(
    saturationValue => {
      if (typeof putControlDataDP.cancel === 'function') {
        putControlDataDP.cancel();
      }
      putColourDataDp(hue, saturationValue, brightness);
    },
    [hue, brightness]
  );

  const updatePreview = throttle((h: number, s: number, v: number) => {
    const backgroundColor = ColorParser.hsv2rgba(h, s, v);
    if (circleRef && circleRef.current) {
      circleRef.current.setNativeProps({
        style: {
          backgroundColor,
        },
      });
    }
  }, 50);

  return (
    <View style={styles.container}>
      <View style={styles.displayView}>
        <HuePicker
          hue={hue}
          radius={HUE_RADIUS}
          innerRadius={HUE_INNER_RADIUS}
          thumbRadius={THUMB_RADIUS}
          thumbInnerRadius={THUMB_INNER_RADIUS}
          onValueChange={v => handleColorChange(v, 'hue')}
          onComplete={handleHueComplete}
        />
        <View
          style={[
            styles.led,
            { backgroundColor: ColorParser.hsv2rgba(hue, saturation, brightness) },
          ]}
          ref={circleRef}
        >
          <Image source={Res.led} style={{ width: cx(28), height: cx(39) }} />
        </View>
      </View>

      <View style={styles.controlView}>
        {/* 亮度 范围10-1000 */}
        <SliderView
          accessibilityLabel="HomeScene_ColourView_Brightness"
          theme={{ fontColor }}
          icon={icons.brightness}
          min={10}
          max={1000}
          percentStartPoint={1}
          value={brightness}
          onValueChange={v => handleColorChange(v, 'brightness')}
          onSlidingComplete={handleBrightnessComplete}
        />
        {/* 饱和度 范围0-1000 */}
        <SliderView
          accessibilityLabel="HomeScene_ColourView_Saturation"
          theme={{ fontColor }}
          icon={icons.saturation}
          min={0}
          max={1000}
          value={saturation}
          onValueChange={v => handleColorChange(v, 'saturation')}
          onSlidingComplete={handleSaturationComplete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: cx(40),
  },

  displayView: {
    width: HUE_RADIUS * 2,
    height: HUE_RADIUS * 2,
  },

  led: {
    position: 'absolute',
    left: (HUE_RADIUS * 2 - LED_SIZE) * 0.5,
    top: (HUE_RADIUS * 2 - LED_SIZE) * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: LED_SIZE,
    height: LED_SIZE,
    borderRadius: LED_SIZE * 0.5,
    backgroundColor: 'transparent',
  },

  controlView: {
    height: cy(120),
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    marginTop: cy(15),
  },
});

export default withTheme(MainColourView);
