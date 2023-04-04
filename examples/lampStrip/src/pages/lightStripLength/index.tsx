/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, BackHandler } from 'react-native';
import { useUnmount } from 'ahooks';
import { useTheme, Utils, TYText, BrickButton } from 'tuya-panel-kit';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { NumberSlider } from '@tuya/tuya-panel-lamp-sdk';
import MyTopBar from '@components/MyTopBar';
import PageBackground from '@components/PageBackground';
import useSelector from '@hooks/useSelector';
import useNavigationBack from '@hooks/useNavigationBack';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';

const { convertX: cx } = Utils.RatioUtils;
const { lightPixelNumberSetCode, lightPixelCode, lightLengthCode, workModeCode } = DpCodes;

const LightStripLength: React.FC = () => {
  const navigationBack = useNavigationBack();

  const { isDarkTheme, themeColor, fontColor, subFontColor, boxBgColor }: any = useTheme();
  const { workMode, lightPixelNumberSet, lightPixel, lightLength } = useSelector(({ dpState }) => ({
    workMode: dpState[workModeCode],
    lightPixelNumberSet: dpState[lightPixelNumberSetCode],
    lightPixel: dpState[lightPixelCode] || 0,
    lightLength: dpState[lightLengthCode] || 0, // The reported unit of length is centimeters
  }));
  const max = lightPixel;
  const min = 10;

  const initLightPixel = useRef(lightPixelNumberSet);
  const valueTextRef = useRef(null);

  const hasLength = useMemo(() => SupportUtils.isSupportDp(lightLengthCode), []); // If there is no total length dp, the panel displays the number of points

  // Handle the side swipe return situation in the Android environment
  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    }
    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      }
    };
  }, []);

  const getValueText = useCallback(
    v => {
      return hasLength ? (((lightLength / 100) * v) / max).toFixed(2) : v;
    },
    [hasLength, lightLength, max]
  );

  const maxText = useMemo(
    () => (hasLength ? `${getValueText(max)} ${Strings.getLang('unit_meter')}` : max),
    [getValueText, hasLength, max]
  );
  const minText = useMemo(
    () => (hasLength ? `${getValueText(min)} ${Strings.getLang('unit_meter')}` : min),
    [getValueText, hasLength, min]
  );
  const valueText = useMemo(
    () => getValueText(lightPixelNumberSet),
    [getValueText, lightPixelNumberSet]
  );

  const handleSliderChange = (v: number) => {
    // @ts-ignore wtf
    valueTextRef.current?.setText?.(getValueText(v));
  };

  const handleSliderComplete = (v: number) => {
    // @ts-ignore wtf
    valueTextRef.current?.setText?.(getValueText(v));
    dragon.putDpData({ [lightPixelNumberSetCode]: v });
  };

  const handleBack = () => {
    dragon.putDpData(
      { [lightPixelNumberSetCode]: initLightPixel.current },
      { checkCurrent: false } // Trim fast click cancel does not take effect
    );
  };

  const handleCancel = () => {
    dragon.putDpData(
      { [lightPixelNumberSetCode]: initLightPixel.current },
      { checkCurrent: false } // Trim fast click cancel does not take effect
    );
    setTimeout(navigationBack, 300);
  };

  const handleConfirm = () => {
    navigationBack();
  };

  // Restore workMode when exiting
  useUnmount(() => {
    dragon.putDpData({ [workModeCode]: workMode }, { checkCurrent: false });
  });

  const renderSliderTrackLineBox = (lineColor?: string) => (
    <View style={styles.sliderTrackLineBox} pointerEvents="none">
      {new Array(11).fill(1).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          style={[
            styles.sliderTrackLine,
            {
              opacity: index % 10 === 0 ? 0 : 1,
            },
            !!lineColor && {
              backgroundColor: lineColor,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <PageBackground />
      <MyTopBar
        title={Strings.getLang('title_light_strip_length')}
        leftActions={[
          {
            name: 'backIos',
            style: {
              marginLeft: cx(10),
            },
            onPress: handleCancel,
          },
        ]}
      />
      <View style={styles.content}>
        <TYText style={{ marginTop: cx(18) }} size={cx(12)} color={subFontColor}>
          {Strings.getLang('tip_light_strip_length')}
        </TYText>
        <View style={[styles.sliderBox, { backgroundColor: boxBgColor }]}>
          <View style={styles.sliderTitle}>
            <TYText>
              {Strings.getLang(
                hasLength ? 'light_strip_actual_length' : 'light_strip_actual_point'
              )}
            </TYText>
            <TYText>
              <TYText color={themeColor} size={cx(16)} ref={valueTextRef}>
                {valueText}
              </TYText>
              {hasLength && ` ${Strings.getLang('unit_meter')}`}
            </TYText>
          </View>

          <NumberSlider
            style={[styles.sliderTrack, { marginTop: cx(34) }]}
            trackStyle={styles.sliderTrack}
            min={min}
            max={max}
            showMin={min}
            value={lightPixelNumberSet}
            step={1}
            showAnimation={false}
            thumbStyle={{ opacity: 0 }}
            tintStyle={styles.sliderTint}
            thumbTouchSize={{ width: cx(50), height: cx(50) }}
            trackColor={isDarkTheme ? '#3c3b3b' : '#EBF0FF'}
            tintColor={themeColor}
            onChange={handleSliderChange}
            onRelease={handleSliderComplete}
            onPress={handleSliderComplete}
            renderTrack={() => renderSliderTrackLineBox(isDarkTheme ? '#fff' : themeColor)}
            renderTint={renderSliderTrackLineBox}
          />
          <View style={styles.rangeRange}>
            <TYText size={cx(12)} color={subFontColor}>
              {minText}
            </TYText>
            <TYText size={cx(12)} color={subFontColor}>
              {maxText}
            </TYText>
          </View>
        </View>
        <View style={styles.footer}>
          <BrickButton
            theme={{
              bgColor: boxBgColor,
              fontColor: isDarkTheme ? fontColor : '#000',
              fontSize: cx(14),
              bgWidth: cx(167),
              bgHeight: cx(47),
            }}
            text={Strings.getLang('cancel')}
            onPress={handleCancel}
          />
          <BrickButton
            theme={{ bgColor: themeColor, fontSize: cx(14), bgWidth: cx(167), bgHeight: cx(47) }}
            text={Strings.getLang('confirm')}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: cx(16),
  },
  sliderBox: {
    marginTop: cx(16),
    paddingHorizontal: cx(16),
    paddingTop: cx(26),
    paddingBottom: cx(32),
    borderRadius: cx(12),
  },
  sliderTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: cx(4),
  },
  footer: {
    marginTop: cx(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sliderTrack: {
    width: cx(311),
    height: cx(32),
    borderRadius: cx(8),
  },
  sliderTint: {
    borderRadius: 0,
    borderTopRightRadius: cx(8),
    borderBottomRightRadius: cx(8),
    overflow: 'hidden',
  },
  sliderTrackLineBox: {
    position: 'absolute',
    width: cx(311),
    height: cx(32),
    borderRadius: cx(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderTrackLine: {
    width: 1,
    height: cx(10),
    backgroundColor: '#fff',
  },
});

export default LightStripLength;
