/* eslint-disable indent */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, Image, Easing } from 'react-native';
import { TYText, LinearGradient, Utils } from 'tuya-panel-kit';
// @ts-ignore
import { Rect } from 'react-native-svg';
import { dynamices } from 'config/default';
import { useSelector } from '@models';

const { withTheme } = Utils.ThemeUtils;
const { convert: cx } = Utils.RatioUtils;
interface Props {
  setDynamic: (...args: any) => void;
  // eslint-disable-next-line react/require-default-props
  theme?: any;
}
const Dynamic: React.FC<Props> = props => {
  const { theme, setDynamic } = props;
  const {
    global: { fontColor, isDefaultTheme },
  } = theme;
  const { effect } = useSelector(({ uiState }) => {
    return {
      effect: uiState.effect,
    };
  });
  const opacityRef = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const time = setTimeout(() => {
      opactiyAnimation(1);
    }, 100);
    return () => {
      clearTimeout(time);
    };
  }, []);
  const opactiyAnimation = (value: number) => {
    Animated.timing(opacityRef, {
      toValue: value,
      duration: 100,
      easing: Easing.linear,
    }).start();
  };
  const [currentDynamic, setCurrentDynamic] = useState(
    effect > 1
      ? dynamices.find(item => {
          return item.value === effect;
        })?.name
      : undefined
  );
  useEffect(() => {
    setCurrentDynamic(
      effect > 1
        ? dynamices.find(item => {
            return item.value === effect;
          })?.name
        : undefined
    );
  }, [effect]);

  return (
    <Animated.View style={[styles.dynamicContainer]}>
      {dynamices.map(dynamicItem => {
        return (
          <View key={dynamicItem.name} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.dynamicItem}
              onPress={() => {
                setDynamic(dynamicItem.value);
                setCurrentDynamic(dynamicItem.name);
              }}
            >
              <LinearGradient
                style={styles.linerGradient}
                stops={dynamicItem.stops}
                x1="100%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <Rect width={cx(88)} height={cx(68)} />
              </LinearGradient>
              <Animated.View
                style={[
                  styles.dynamicContent,
                  currentDynamic === dynamicItem.name
                    ? {
                        borderWidth: 4,
                        borderColor: isDefaultTheme ? 'rgba(37,45,59,1)' : '#fff',
                      }
                    : {},
                ]}
              >
                <Image style={{ width: cx(35), height: cx(35) }} source={dynamicItem.icon} />
              </Animated.View>
            </TouchableOpacity>
            <TYText color={fontColor} text={dynamicItem.label} />
          </View>
        );
      })}
    </Animated.View>
  );
};
export default withTheme(Dynamic);

const styles = StyleSheet.create({
  dynamicContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: cx(24),
  },
  dynamicItem: {
    width: cx(88),
    height: cx(68),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: cx(8),
  },
  linerGradient: {
    width: cx(88),
    height: cx(68),
    borderRadius: cx(34),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dynamicContent: {
    width: cx(84),
    height: cx(64),
    backgroundColor: 'transparent',
    borderRadius: cx(34),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
