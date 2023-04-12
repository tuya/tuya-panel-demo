/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { FC, useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Utils, TabBar, useTheme } from 'tuya-panel-kit';
import { useControllableValue, useCreation } from 'ahooks';
import RectColorAndBrightPicker from '@components/RectColorAndBrightPicker';
import ColorCards from '@components/ColorCards/ColorCard';
import { BlurView } from '@react-native-community/blur';
import { checkDp } from '@utils';
import Strings from './i18n';
import Combination from './Combination';
import WeelCircles from './WeelCircles';
import { DimmerBoxProps, DimmerValue, DimmerMode, DimmerTab } from './interface';

const { convertX: cx } = Utils.RatioUtils;

const DimmerBox: FC<DimmerBoxProps> = props => {
  const {
    style,
    styles: propStyles,
    contentContainerStyle,
    background = 'transparent',
    blured,
    disabled,
    powerOff,
    hideBright,
    filterTabs,
    showColorUnits,
    colorUnitsProps,
  } = props;

  const { isColorfulExist, isWhiteExist, isTempExist } = useCreation(checkDp, []);

  const { isDarkTheme, themeColor, fontColor, subFontColor }: any = useTheme();

  const topBlurRef = useRef(null);
  const [opacity, setOpacity] = useState(() => (disabled || powerOff ? 0.4 : 1));

  const [tab, setActiveTab] = useControllableValue<DimmerTab>(props, {
    valuePropName: 'tab',
    trigger: 'onTabChange',
    defaultValue: DimmerMode[1] as DimmerTab,
  });

  const [value, setValue] = useControllableValue<DimmerValue>(props, {
    defaultValue: {
      [DimmerMode[0]]: { brightness: 1000, temperature: 0 },
      [DimmerMode[1]]: { hue: 0, saturation: 1000, value: 1000 },
      [DimmerMode[2]]: { hue: 339, saturation: 980, value: 980 },
      [DimmerMode[3]]: [],
    },
  });

  const handleColorCompelete = (d: any) => {
    setValue({ [tab]: d });
  };

  const handleBrightnessComplete = (v: number) => {
    setValue({ [DimmerMode[0]]: { brightness: v, temperature: 1000 } });
  };

  const handleCombinationChange = (colors: ColourData[]) => {
    setValue({ [DimmerMode[3]]: colors });
  };

  const handleCombinationScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { y } = nativeEvent.contentOffset;
    // The blurring effect is displayed when the scene content is scroll below Top
    // @ts-ignore
    topBlurRef.current?.setNativeProps?.({
      style: { opacity: y > cx(12) ? 1 : 0 },
    });
  };

  const tabs = useMemo(() => {
    return [
      {
        key: DimmerMode[1],
        title: Strings.getLang(`dimmer_${DimmerMode[1]}`),
        hidden: !isColorfulExist,
      },
      {
        key: DimmerMode[0],
        title: Strings.getLang(`dimmer_${DimmerMode[0]}`),
        hidden: !isWhiteExist && !isTempExist,
      },
      { key: DimmerMode[2], title: Strings.getLang(`dimmer_${DimmerMode[2]}`) },
      { key: DimmerMode[3], title: Strings.getLang(`dimmer_${DimmerMode[3]}`) },
    ].filter((item, index) => !item.hidden && (filterTabs ? filterTabs(item.key, index) : true));
  }, [filterTabs]);

  // Color light or not
  const isColor = tab !== DimmerMode[0];

  const brightOption = {
    trackColor: isDarkTheme ? '#383838' : '#E8EDFB',
    activeColor: isDarkTheme ? '#fff' : themeColor,
    fontColor: isDarkTheme ? '#000' : '#fff',
  };

  useEffect(() => {
    setOpacity(disabled || powerOff ? 0.4 : 1);
  }, [disabled, powerOff]);

  return (
    <View style={[styles.container, { backgroundColor: background }, style]}>
      <View
        style={[styles.content, tab !== DimmerMode[3] && styles.tabPanel, contentContainerStyle]}
      >
        {showColorUnits && (
          // @ts-ignore
          <WeelCircles
            isDark={isDarkTheme}
            themeColor={themeColor}
            isColorFul={isColor}
            isColorfulExist={isColorfulExist}
            isWhiteExist={isWhiteExist}
            isSingleCircle={false}
            minCircleNum={2}
            maxCircleNum={8}
            {...colorUnitsProps}
          />
        )}
        {tab === DimmerMode[1] && (
          <RectColorAndBrightPicker.ColourPicker
            // @ts-ignore
            style={[styles.picker, propStyles?.colour]}
            opacityAnimationValue={opacity}
            brightOption={brightOption}
            disabled={disabled}
            value={value.colour}
            hideBright={hideBright}
            // @ts-ignore
            onRelease={handleColorCompelete}
            // @ts-ignore
            onPress={handleColorCompelete}
          />
        )}
        {tab === DimmerMode[0] &&
          isWhiteExist &&
          (isTempExist ? (
            <RectColorAndBrightPicker.WhitePicker
              // @ts-ignore
              style={[styles.picker, propStyles?.white]}
              direction="left"
              opacityAnimationValue={opacity}
              brightOption={brightOption}
              hideBright={hideBright}
              disabled={disabled}
              // @ts-ignore
              value={value.white}
              // @ts-ignore
              onRelease={handleColorCompelete}
              // @ts-ignore
              onPress={handleColorCompelete}
            />
          ) : (
            <RectColorAndBrightPicker.BrightnessSlider
              style={{ height: cx(110), borderRadius: cx(12), overflow: 'hidden' }}
              trackColor={isDarkTheme ? '#383838' : '#E8EDFB'}
              activeColor={isDarkTheme ? '#fff' : themeColor}
              fontColor={isDarkTheme ? '#000' : '#fff'}
              opacityAnimationValue={opacity}
              // @ts-ignore
              brightOption={brightOption}
              disabled={disabled}
              clickEnabled={true}
              value={value.white?.brightness}
              // @ts-ignore
              onRelease={handleBrightnessComplete}
              // @ts-ignore
              onPress={handleBrightnessComplete}
            />
          ))}
        {tab === DimmerMode[2] && (
          <ColorCards
            style={[styles.picker, propStyles?.colourCard]}
            opacityAnimationValue={opacity}
            disabled={disabled}
            brightOption={brightOption}
            hideBright={hideBright}
            value={value.colourCard!}
            // @ts-ignore
            onRelease={handleColorCompelete}
          />
        )}
        {tab === DimmerMode[3] && (
          <Combination
            containerStyle={{
              paddingTop: cx(52),
              paddingBottom: cx(24),
              paddingHorizontal: cx(11),
            }}
            opacityAnimationValue={opacity}
            // @ts-ignore
            value={value.combination}
            onChange={handleCombinationChange}
            onScroll={handleCombinationScroll}
          />
        )}
      </View>
      <View style={[styles.top, propStyles?.topbar]}>
        {blured && Platform.OS === 'ios' && tab === DimmerMode[3] ? (
          <BlurView
            ref={topBlurRef}
            style={styles.blurView}
            blurType={isDarkTheme ? 'dark' : 'xlight'}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: background }]} />
        )}
        <TabBar
          style={styles.tabBar}
          underlineStyle={{
            width: cx(9),
            bottom: cx(8),
            borderRadius: cx(1.5),
            backgroundColor: fontColor,
          }}
          tabStyle={{ backgroundColor: 'transparent', width: 'auto', marginRight: cx(14) }}
          tabTextStyle={{ fontSize: cx(16), color: subFontColor }}
          tabActiveTextStyle={{ color: fontColor }}
          tabs={tabs}
          activeKey={tab}
          onChange={(v: DimmerTab) => setActiveTab(v)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: cx(16),
    borderTopRightRadius: cx(16),
    overflow: 'hidden',
  },
  top: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: cx(46),
    overflow: 'hidden',
  },
  blurView: {
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  tabBar: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    paddingHorizontal: cx(16),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  tabPanel: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: cx(17),
    paddingTop: cx(52),
    paddingBottom: cx(12),
  },
  picker: {
    width: '100%',
    height: cx(197),
    borderRadius: cx(12),
    overflow: 'hidden',
  },
});

export default DimmerBox;
