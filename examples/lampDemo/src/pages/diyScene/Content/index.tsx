import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TYText, Utils, Divider, TopBar, BrickButton, useTheme } from 'tuya-panel-kit';
import LottieView from 'lottie-react-native';
import { BrightRectSlider } from '@tuya-rn/tuya-native-lamp-elements';
import { useDebounceFn } from 'ahooks';
import useNavigationBack from '@hooks/useNavigationBack';
import DimmerBox from '@components/DimmerBox';
import { DimmerMode, DimmerValue, SceneDataType, DimmerTab } from '@types';
import { DirectionAbleModes, SegmentableModes } from '@config/default/scene/mode';
import LottiesJSON from '@res/lotties';
import Strings from '@i18n';
import Res from '@res';
import BtnGroup from './BtnGroup';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { inMaxMin } = Utils.NumberUtils;
const dimmerTabs = [DimmerMode[1], DimmerMode[2]];

interface DiySceneContentProps {
  isEdit?: boolean;
  sceneData: SceneDataType;
  setSceneData: React.Dispatch<React.SetStateAction<SceneDataType>>;
  onRemove: () => void;
}

const DiySceneContent: React.FC<DiySceneContentProps> = ({
  isEdit,
  sceneData,
  setSceneData,
  onRemove,
}) => {
  const { mode, brightness, direction, segmented, speed, expand, colors } = sceneData.value || {};

  const positiveTurn = useRef<LottieView>(null);
  const reverseTurn = useRef<LottieView>(null);

  const { isDarkTheme, themeColor, dividerColor, boxBgColor }: any = useTheme();
  const navigationBack = useNavigationBack();

  const handleBrightComplete = (v: number) => {
    setSceneData(data => ({ ...data, value: { ...data.value, brightness: v } }));
  };

  const handleDirectionChange = (v: string) => {
    setSceneData(data => ({ ...data, value: { ...data.value, direction: +v } }));
  };

  const handleSegmentedChange = (v: string) => {
    setSceneData(data => ({ ...data, value: { ...data.value, segmented: +v } }));
  };

  const handleExpandChange = (v: string) => {
    setSceneData(data => ({ ...data, value: { ...data.value, expand: +v } }));
  };

  const handleSpeedChange = (v: number) => {
    setSceneData(data => ({ ...data, value: { ...data.value, speed: v } }));
  };

  const directionTabs = useMemo(
    () =>
      [0, 1].map(k => ({
        key: String(k),
        title:
          isDarkTheme || direction === k ? (
            <LottieView
              ref={k === 0 ? positiveTurn : reverseTurn}
              style={styles.btnTabs0}
              loop={false}
              source={k === 0 ? LottiesJSON.PositiveTurn : LottiesJSON.ReverseTurn}
            />
          ) : (
            <Image
              style={[styles.btnTabs1, { tintColor: themeColor }]}
              source={Res[`scene_direction_${k}`]}
            />
          ),
        onItemPress: () => setTimeout(() => (k === 0 ? positiveTurn : reverseTurn).current?.play()),
      })),
    [direction]
  );

  const segmentedTabs = useMemo(
    () =>
      [0, 1].map(k => ({
        key: String(k),
        title: (
          <Image
            style={[
              styles.btnTabs1,
              { tintColor: isDarkTheme ? '#fff' : segmented === k ? '#fff' : themeColor },
            ]}
            source={Res[`scene_segmented_${k}`]}
          />
        ),
      })),
    [segmented]
  );

  const meteorTabs = useMemo(
    () =>
      [0, 1, 2].map(k => ({
        key: String(k),
        title: (
          <Image
            style={[
              styles.btnTabs1,
              { tintColor: isDarkTheme ? '#fff' : expand === k ? '#fff' : themeColor },
            ]}
            source={Res[`scene_meteor_${k}`]}
          />
        ),
      })),
    [expand]
  );

  const reboundTabs = useMemo(
    () =>
      [0, 1].map(k => ({
        key: String(k),
        title: (
          <Image
            style={[
              styles.btnTabs2,
              { tintColor: isDarkTheme ? '#fff' : expand === k ? '#fff' : themeColor },
            ]}
            source={Res[`scene_rebound_${k}`]}
          />
        ),
      })),
    [expand]
  );

  const switchTabs = useMemo(
    () =>
      [0, 1].map(k => ({
        key: String(k),
        title: (
          <Image
            style={[
              styles.btnTabs1,
              { tintColor: isDarkTheme ? '#fff' : expand === k ? '#fff' : themeColor },
            ]}
            source={Res[`scene_switch_${k}`]}
          />
        ),
      })),
    [expand]
  );

  const circleArr = useMemo(
    () => (colors ?? []).map(item => ({ ...item, value: brightness, isColor: true })),
    [colors, brightness]
  );

  const [selectCircle, setSelectCircle] = useState(0);

  const [dimmerValue, setDimmerValue] = useState<DimmerValue>(() => ({
    [DimmerMode[1]]: { ...colors[0], value: brightness },
    [DimmerMode[2]]: { ...colors[0], value: brightness },
  }));

  const [dimmerTab, setDimmerTab] = useState(dimmerTabs[0]);
  const handleDimmerTabChange = (t: DimmerTab) => {
    setDimmerTab(t);
  };

  const handleToSetCircle = (dt: any, index: number) => {
    if (dt === 'plus') {
      const { hue, saturation } = dimmerValue[dimmerTab];
      setSceneData(data => ({
        ...data,
        value: {
          ...data.value,
          colors: colors.concat({ hue, saturation }),
        },
      }));
      setSelectCircle(index);
    } else if (dt === 'delete') {
      setSceneData(data => ({
        ...data,
        value: {
          ...data.value,
          colors: colors.filter((__, i) => i !== selectCircle),
        },
      }));
      setSelectCircle(v => inMaxMin(0, colors.length - 2, v));
    } else {
      setSelectCircle(index);
      setDimmerValue(d => ({ ...d, [dimmerTab]: dt }));
    }
  };

  const handleDimmerValueChange = (dv: DimmerValue) => {
    setDimmerValue(d => ({ ...d, ...dv }));
    if (selectCircle > circleArr.length - 1) return;
    const [{ hue, saturation }] = Object.values(dv);
    setSceneData(data => ({
      ...data,
      value: {
        ...data.value,
        colors: colors.map((it, i) => (i === selectCircle ? { hue, saturation } : it)),
      },
    }));
  };

  const { run: handleRemove } = useDebounceFn(
    async () => {
      onRemove();
      navigationBack();
    },
    { wait: 5000, leading: true, trailing: false }
  );

  const sliderProps = {
    style: { height: cx(40), borderRadius: cx(8), overflow: 'hidden' },
    trackStyle: { backgroundColor: boxBgColor },
    tintColor: isDarkTheme ? '#fff' : themeColor,
    iconColor: isDarkTheme ? '#000' : '#fff',
    outPercentColor: isDarkTheme ? '#fff' : '#000',
    showAnimation: false,
    showMin: 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainerStyle}>
      <DimmerBox
        style={styles.dimmerBox}
        styles={{
          colour: { width: cx(342), height: cx(156) },
          colourCard: { width: cx(342), height: cx(156) },
        }}
        filterTabs={tab => dimmerTabs.includes(tab)}
        hideBright={true}
        showColorUnits={true}
        colorUnitsProps={{
          circleArr,
          selectCircle,
          handleToSetCircle,
        }}
        value={dimmerValue}
        onChange={handleDimmerValueChange}
        onTabChange={handleDimmerTabChange}
      />
      <View style={{ paddingHorizontal: cx(16) }}>
        <TYText style={{ flexDirection: 'row', fontSize: cx(15) }}>
          <TYText>{Strings.getLang('scene_brightness')}</TYText>
          <TYText color={themeColor}>{` · ${Math.round(brightness / 10)}%`}</TYText>
        </TYText>
        <Divider
          style={{ marginTop: cx(4), marginBottom: cx(23) }}
          color={dividerColor}
          height={cx(1)}
        />
        <BrightRectSlider
          {...sliderProps}
          iconSize={cx(32)}
          percentStyle={{
            color: isDarkTheme ? '#000' : '#fff',
            marginLeft: cx(4),
            fontWeight: 'bold',
            fontSize: cx(16),
          }}
          min={10}
          max={1000}
          value={brightness}
          onMove={handleBrightComplete}
          onRelease={handleBrightComplete}
          onPress={handleBrightComplete}
        />
      </View>
      {DirectionAbleModes.includes(mode) && (
        <BtnGroup
          key="direction"
          title={Strings.getLang('scene_direction')}
          valueText={Strings.getLang(`scene_direction_${direction}`)}
          dataSource={directionTabs}
          value={String(direction)}
          onChange={handleDirectionChange}
        />
      )}
      {SegmentableModes.includes(mode) && (
        <BtnGroup
          key="segmented"
          title={Strings.getLang('scene_segmented')}
          valueText={Strings.getLang(`scene_segmented_${segmented}`)}
          dataSource={segmentedTabs}
          value={String(segmented)}
          onChange={handleSegmentedChange}
        />
      )}
      {mode === 5 && (
        <BtnGroup
          key="metor"
          title={Strings.getLang('scene_other')}
          valueText={Strings.getLang(`scene_meteor_${expand}`)}
          dataSource={meteorTabs}
          value={String(expand)}
          onChange={handleExpandChange}
        />
      )}
      {mode === 13 && (
        <BtnGroup
          key="rebound"
          title={Strings.getLang('scene_other')}
          valueText={Strings.getLang(`scene_rebound_${expand}`)}
          dataSource={reboundTabs}
          value={String(expand)}
          onChange={handleExpandChange}
        />
      )}
      {mode === 16 && (
        <BtnGroup
          key="switch"
          title={Strings.getLang('scene_other')}
          valueText={Strings.getLang(`scene_switch_${expand}`)}
          dataSource={switchTabs}
          value={String(expand)}
          onChange={handleExpandChange}
        />
      )}
      <View key="speed" style={{ paddingHorizontal: cx(16), marginTop: cx(24) }}>
        <TYText style={{ flexDirection: 'row', fontSize: cx(15) }}>
          <TYText>{Strings.getLang('scene_speed')}</TYText>
          <TYText color={themeColor}>{` · ${speed}`}</TYText>
        </TYText>
        <Divider
          style={{ marginTop: cx(4), marginBottom: cx(23) }}
          color={dividerColor}
          height={cx(1)}
        />
        <BrightRectSlider
          {...sliderProps}
          thumbStyle={styles.sliderThumbStyle}
          percentStyle={{ display: 'none' }}
          iconColor="transparent"
          outPercentColor="transparent"
          renderThumb={() => (
            <View
              style={[styles.sliderThumb, { backgroundColor: isDarkTheme ? '#000' : '#fff' }]}
            />
          )}
          min={1}
          max={100}
          value={speed}
          onMove={handleSpeedChange}
          onRelease={handleSpeedChange}
          onPress={handleSpeedChange}
        />
      </View>
      {isEdit && (
        <BrickButton
          text={Strings.getLang('title_delete')}
          style={{ alignSelf: 'center', marginTop: cx(24) }}
          textStyle={{ fontSize: cx(14), color: '#DA3737' }}
          wrapperStyle={{
            width: cx(343),
            height: cx(60),
            backgroundColor: boxBgColor,
            borderRadius: cx(12),
          }}
          onPress={handleRemove}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
  contentContainerStyle: {
    paddingTop: cx(176 + 10) + TopBar.height,
    paddingBottom: isIphoneX ? cx(44) : cx(24),
  },
  dimmerBox: {
    // height: cx(236),
    backgroundColor: 'transparent',
  },
  btnTabs0: {
    width: cx(26),
    height: cx(26),
  },
  btnTabs1: {
    width: cx(20),
    height: cx(20),
    resizeMode: 'stretch',
  },
  btnTabs2: {
    width: cx(34),
    height: cx(24),
    resizeMode: 'stretch',
  },
  sliderThumbStyle: {
    opacity: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 2,
    height: 13,
    borderRadius: 1,
    marginRight: cx(8),
  },
});

export default DiySceneContent;
