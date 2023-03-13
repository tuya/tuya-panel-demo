import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  StyleSheet,
  Animated,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { useControllableValue, usePersistFn } from 'ahooks';
import Res from '@res';
import { objectShallowEqual } from '@utils';
import RectColorAndBrightPicker from '../RectColorAndBrightPicker2';
import { Color as ColorData } from './Colors';

const { convertX: cx } = Utils.RatioUtils;

interface ColorCardsProps {
  style?: StyleProp<ViewStyle>;
  opacityAnimationValue?: number;
  disabled?: boolean;
  brightOption?: any;
  cardLength?: number;
  xNum?: number;
  yNum?: number;
  /**
   * 彩光模式对应数据
   */
  value?: ColourData;
  onMove?: (data: ColourData) => void;
  onRelease?: (data: ColourData) => void;
  hideBright?: boolean;
}

const ColorCards: React.FC<ColorCardsProps> = props => {
  const {
    style,
    cardLength = cx(31),
    xNum = 11,
    yNum = 5,
    hideBright,
    brightOption,
    opacityAnimationValue = 1,
    disabled,
    onMove,
  } = props;

  const opacity = useRef(new Animated.Value(opacityAnimationValue)).current;

  const [value, setValue] = useControllableValue<ColourData>(props, { trigger: 'onRelease' });

  const handleCardPress = usePersistFn(e => {
    if (disabled) return;
    const { locationX, locationY } = e.nativeEvent;
    const xCount = Math.floor(locationX / cardLength) + 1;
    const yCount = Math.floor(locationY / cardLength);
    const totalCount = xNum * yCount + xCount;
    setValue({ ...ColorData[totalCount - 1], value: value.value });
  });

  const colourCards = useMemo(() => {
    const width = cardLength * xNum;
    const height = cardLength * yNum;
    const currentIndex = ColorData.findIndex(item =>
      objectShallowEqual(item, value, ['hue', 'saturation'])
    );
    const xIndex = currentIndex % xNum;
    const yIndex = Math.floor(currentIndex / xNum);
    return (
      <TouchableWithoutFeedback
        style={[styles.cardsContainer, { width, height }]}
        onPress={handleCardPress}
      >
        <View>
          <Animated.Image
            style={[styles.cardsBg, { width, height, opacity }]}
            source={Res.colorCard_colour}
            resizeMode="stretch"
          />
          <Animated.View
            style={[
              styles.activeCard,
              {
                width: cardLength,
                height: cardLength,
                top: yIndex * cardLength,
                left: xIndex * cardLength,
              },
              opacityAnimationValue < 1 && {
                backgroundColor: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#000', 'rgba(0,0,0,0)'],
                }),
              },
              currentIndex === 0 && { borderTopLeftRadius: cx(12) },
              currentIndex === xNum - 1 && { borderTopRightRadius: cx(12) },
              hideBright &&
                currentIndex === xNum * (yNum - 1) && { borderBottomLeftRadius: cx(12) },
              hideBright && currentIndex === xNum * yNum - 1 && { borderBottomRightRadius: cx(12) },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }, [cardLength, xNum, yNum, value, opacityAnimationValue]);

  const handleBrightMove = (v: number) => {
    onMove?.({ ...value, value: v });
  };

  const handleBrightComplete = (v: number) => {
    setValue({ ...value, value: v });
  };

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: opacityAnimationValue,
      duration: 300,
    }).start();
  }, [opacityAnimationValue]);

  return (
    <View style={[styles.container, style]}>
      {colourCards}
      {!hideBright && (
        <RectColorAndBrightPicker.BrightnessSlider
          {...brightOption}
          opacityAnimationValue={opacityAnimationValue}
          disabled={disabled}
          min={10}
          max={1000}
          clickEnabled={true}
          value={value.value}
          onMove={handleBrightMove}
          onRelease={handleBrightComplete}
          onPress={handleBrightComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  cardsContainer: {},
  cardsBg: {},
  activeCard: {
    position: 'absolute',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default ColorCards;
