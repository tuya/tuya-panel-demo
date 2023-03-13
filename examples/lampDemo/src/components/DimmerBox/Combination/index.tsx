/* eslint-disable react/no-array-index-key */
import React, { FC, useEffect, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { usePersistFn, useControllableValue } from 'ahooks';
import { jsonShallowEqual } from '@utils';
import { hexColors, hsvColors } from '@config/default/CombineColors';
import CombinationBox from './Box';

const { convertX: cx } = Utils.RatioUtils;
const fixedHexColors = hexColors.map(c => c.slice(1).concat(c[0])); // 渲染的顺序跟产品要求的顺序不一样

export interface CombinationProps {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  opacityAnimationValue?: number;
  circleRadius?: number;
  circleBorderWidth?: number;
  circleMargin?: number;
  value?: ColourData[];
  onChange?: (value: ColourData[]) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const Combination: FC<CombinationProps> = props => {
  const {
    style,
    containerStyle,
    circleRadius = cx(23),
    circleBorderWidth = cx(2),
    circleMargin = cx(4),
    opacityAnimationValue = 1,
    onScroll,
  } = props;

  const opacity = useRef(new Animated.Value(opacityAnimationValue)).current;

  const [value, setValue] = useControllableValue<ColourData[]>(props);

  // 用两个JSON来对比寻找出hexColor(直接转换颜色再对比的话，有误差且转换效率低)
  const selectedIndex = useMemo(
    () => hsvColors.findIndex(item => jsonShallowEqual(item, value)),
    [value]
  );

  const handleSelect = usePersistFn((index: number) => {
    setValue?.(hsvColors[index]);
  });

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: opacityAnimationValue,
      duration: 300,
    }).start();
  }, [opacityAnimationValue]);

  return (
    <Animated.View style={[style, { opacity }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.container, containerStyle]}
        onScroll={onScroll}
      >
        {fixedHexColors.map((item, index) => (
          <CombinationBox
            key={index}
            style={{ margin: circleMargin, borderWidth: circleBorderWidth }}
            radius={circleRadius}
            colors={item}
            selected={index === selectedIndex}
            onPress={() => handleSelect(index)}
          />
        ))}
        {/* 处理Flex布局最后一行左对齐问题 */}
        {fixedHexColors.map((__, index) => (
          <View
            key={index}
            style={{
              width: (circleRadius + circleBorderWidth) * 2,
              marginHorizontal: circleMargin,
            }}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Combination;
