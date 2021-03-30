import throttle from 'lodash/throttle';
import React, { useCallback, useRef, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Utils, TYSdk } from 'tuya-panel-kit';
import Res from '@res';
import { useSelector } from '@models';
import { lampPutDpData } from '@api';
import _ from 'lodash';
import { ColorParser, calcPosition } from '../../../utils';
import SupportUtils from '../../../utils/support';
import TempCirclePicker from '../../../components/TempCirclePicker';
import SliderView from '../../../components/SliderView';
import icons from '../../../res/iconfont';
import DpCodes from '../../../config/dpCodes';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { isSupportTemp, isSupportBright } = SupportUtils;
const { withTheme } = Utils.ThemeUtils;
const {
  brightCode,
  temperatureCode: tempCode,
  controlCode: controlDataCode,
  workModeCode,
} = DpCodes;
const TYDevice = TYSdk.device;

const LED_SIZE = Math.min(110, cx(110));
const TEMP_RADIUS = Math.min(cy(135), cx(135));
const TEMP_INNER_RADIUS = Math.min(cy(76), cx(76));
const THUMB_SIZE = Math.min(cy(79), cx(79));

const mapTempToKelvin = (v: number) => {
  const kelvin = calcPosition(2500, 9000, v / 1000);
  return kelvin;
};

const calcHSV = (tempValue: number, bright: number) => {
  const kelvin = mapTempToKelvin(tempValue);
  const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
  const [h, s] = Utils.ColorUtils.color.rgb2hsb(...rgb);
  return [h, s, bright / 10];
};

const renderThumb = () => {
  return <Image style={{ width: THUMB_SIZE, height: THUMB_SIZE }} source={Res.thumbBg} />;
};
interface MainWhiteViewProps {
  theme?: any;
}

const MainWhiteView: React.FC<MainWhiteViewProps> = ({
  theme: {
    global: { fontColor },
  },
}) => {
  const isSupportWhiteTemp = useRef(isSupportTemp());
  const isSupportWhiteBright = useRef(isSupportBright());
  const circleRef = useRef<View>(null);
  const tempBgRef = useRef<Image>(null);
  const temperature = useSelector(state => state.dpState[tempCode]) as number;
  const brightness = useSelector(state => state.dpState[brightCode]) as number;

  const [brightDpMin] = useState(_.get(TYDevice.getDpSchema(brightCode), 'min') || 10);
  const [brightDpMax] = useState(_.get(TYDevice.getDpSchema(brightCode), 'max') || 1000);

  const getStops = useCallback(() => {
    const warmStart = {
      offset: '0%',
      stopColor: '#FFCA5C',
      stopOpacity: 1,
    };
    const coldStart = {
      offset: '0%',
      stopColor: '#C0E8FF',
      stopOpacity: 1,
    };
    const warmEnd = { ...warmStart, offset: '100%' };
    const coldEnd = { ...coldStart, offset: '100%' };
    if (isSupportWhiteTemp.current) {
      return [warmStart, coldEnd];
    }
    return [warmStart, warmEnd];
  }, [isSupportWhiteTemp.current]);

  // 下发调节dp
  const putControlDataDP = throttle((brightValue: number, tempValue: number) => {
    if (!controlDataCode) {
      return;
    }
    const encodeControlData = ColorParser.encodeControlData(
      1, // m
      0, // h
      0, // s
      0, // v
      brightValue,
      tempValue || 0
    );
    lampPutDpData({
      [controlDataCode]: encodeControlData,
    });
  }, 150);

  const handleBrightChange = (brightValue: number) => {
    const newBrightValue = Math.round(brightValue);
    updatePreview(newBrightValue, temperature);
    putControlDataDP(newBrightValue, temperature);
  };

  const handleTempChange = (tempValue: number) => {
    updatePreview(brightness, tempValue);
    putControlDataDP(brightness, tempValue);
  };

  const handleTempComplete = (tempValue: number) => {
    if (typeof putControlDataDP.cancel === 'function') {
      putControlDataDP.cancel();
    }
    updatePreview(brightness, tempValue);
    lampPutDpData({
      [workModeCode]: 'white',
      [tempCode]: tempValue,
    });
  };

  const handleBrightnessComplete = brightValue => {
    if (typeof putControlDataDP.cancel === 'function') {
      putControlDataDP.cancel();
    }
    updatePreview(brightValue, temperature);
    lampPutDpData({
      [workModeCode]: 'white',
      [brightCode]: Math.round(brightValue),
    });
  };

  const updatePreview = throttle((brightValue: number, tempValue: number) => {
    const previewTemp = tempValue || 0;
    const hsv = calcHSV(previewTemp, brightValue);
    const backgroundColor = ColorParser.hsv2rgba(hsv[0], hsv[1] * 10, hsv[2] * 10);
    if (circleRef && circleRef.current) {
      circleRef.current.setNativeProps({
        style: {
          backgroundColor,
        },
      });
    }
    if (!isSupportWhiteTemp.current && tempBgRef && tempBgRef.current) {
      tempBgRef.current.setNativeProps({
        style: {
          tintColor: backgroundColor,
        },
      });
    }
  }, 50);

  const renderTrack = useCallback(() => {
    let previewTemp = 0;
    let img = Res.warmBg;
    if (isSupportWhiteTemp.current) {
      img = Res.tempBg;
      previewTemp = temperature;
    }
    const hsv = calcHSV(previewTemp, brightness);
    const backgroundColor = ColorParser.hsv2rgba(hsv[0], hsv[1] * 10, hsv[2] * 10);
    return (
      <Image
        ref={tempBgRef}
        style={[
          { width: TEMP_RADIUS * 2, height: TEMP_RADIUS * 2 },
          !isSupportWhiteTemp.current && {
            tintColor: backgroundColor,
          },
        ]}
        source={img}
      />
    );
  }, [brightness]);

  const getBackgroundColor = useCallback(() => {
    const hsv = calcHSV(temperature || 0, brightness);
    return ColorParser.hsv2rgba(hsv[0], hsv[1] * 10, hsv[2] * 10);
  }, [temperature, brightness]);

  return (
    <View style={styles.container}>
      <View style={styles.displayView}>
        <TempCirclePicker
          value={temperature}
          outerRadius={TEMP_RADIUS}
          innerRadius={TEMP_INNER_RADIUS}
          offsetAngle={44}
          thumbSize={THUMB_SIZE}
          disabled={!isSupportWhiteTemp.current}
          showThumb={isSupportWhiteTemp.current}
          stopColors={getStops()}
          thumbStyle={styles.thumbStyle}
          renderThumb={renderThumb}
          renderTrack={renderTrack}
          onMove={handleTempChange}
          onRelease={handleTempComplete}
        />
        <View style={[styles.led, { backgroundColor: getBackgroundColor() }]} ref={circleRef}>
          <Image source={Res.led} style={{ width: cx(28), height: cx(39) }} />
        </View>
      </View>
      <View style={styles.controlView}>
        {isSupportWhiteBright.current && (
          <SliderView
            accessibilityLabel="HomeScene_WhiteView_Brightness"
            theme={{ fontColor }}
            icon={icons.brightness}
            min={brightDpMin}
            max={brightDpMax}
            percentStartPoint={1}
            value={brightness}
            onValueChange={handleBrightChange}
            onSlidingComplete={handleBrightnessComplete}
          />
        )}
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
    marginTop: cy(40),
  },

  displayView: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlView: {
    height: cy(120),
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    marginTop: cy(15),
  },

  led: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: LED_SIZE,
    height: LED_SIZE,
    borderRadius: LED_SIZE * 0.5,
    backgroundColor: 'transparent',
  },
  thumbStyle: {
    backgroundColor: 'transparent',
  },
});

export default withTheme(MainWhiteView);
