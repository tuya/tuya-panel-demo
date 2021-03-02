import React, { useState } from 'react';
import {
  Animated,
  Easing,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import icons from '../icons';

const { convertX: cx } = Utils.RatioUtils;
const { set } = icons;
interface DropDownProps {
  content?: () => void;
  isDefaultTheme?: boolean;
  themeColor?: string;
  tintColor?: string;
  title?: string;
  iconPath?: string;
  style?: StyleProp<ViewStyle>;
  topStyle?: StyleProp<ViewStyle>;
  arrow?: boolean;
  maxHeight?: number;
  titleStyle?: StyleProp<TextStyle>;
  duration?: number;
  animateWapperStyle?: StyleProp<ViewStyle>;
  size?: number;
  icon?: number;
}

const DropDown: React.FC<DropDownProps> = props => {
  const {
    content,
    animateWapperStyle,
    themeColor = '#338CE5',
    titleStyle,
    iconPath = set,
    title,
    style,
    topStyle,
    arrow = true,
    icon = null,
    size = 20,
    isDefaultTheme,
    maxHeight = 0,
  } = props;

  const [state, setstate] = useState({
    rotateValue: new Animated.Value(180),
    changeValue: 180,
  });

  const handleToToggle = (changeValue: number) => {
    const { duration = 200 } = props;
    const rotateValue = changeValue === 0 ? 180 : 0;
    Animated.timing(state.rotateValue, {
      toValue: rotateValue, // 最终值 为1，这里表示最大旋转 360度
      duration,
      easing: Easing.linear,
    }).start(() => {
      state.rotateValue.setValue(rotateValue);
    });
    setstate({
      ...state,
      changeValue: state.changeValue === 0 ? 180 : 0,
    });
  };

  const rotateValue = (min: number | string, max: any) => {
    return state.rotateValue.interpolate({
      inputRange: [0, 180], // 输入值
      outputRange: [min, max], // 输出值
    });
  };

  const { changeValue } = state;
  const height = rotateValue(0, maxHeight);
  const rote = rotateValue('360deg', '180deg');
  return (
    <View style={[styles.content, style]}>
      <TouchableOpacity
        style={[styles.title, topStyle]}
        onPress={() => handleToToggle(changeValue)}
      >
        <View style={styles.leftcontent}>
          {!!icon && (
            <Image
              source={icon}
              style={[
                styles.img,
                { tintColor: isDefaultTheme ? 'rgba(230,230,230,.5)' : 'rgba(0,0,0,.1)' },
              ]}
            />
          )}
          <TYText
            style={[
              styles.titleText,
              titleStyle,
              { color: isDefaultTheme ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.9)' },
            ]}
          >
            {title}
          </TYText>
        </View>
        {arrow && (
          <Animated.View
            style={[
              {
                transform: [
                  {
                    rotate: rote,
                  },
                ],
              },
            ]}
          >
            <IconFont
              d={iconPath}
              color={isDefaultTheme ? 'rgba(216,216,216,.5)' : themeColor}
              size={size}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
      {content && (
        <Animated.View
          style={[
            styles.animate,
            {
              height,
            },
            animateWapperStyle,
          ]}
        >
          {content()}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: cx(343),
    alignSelf: 'center',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: cx(16),
    backgroundColor: 'transparent',
  },
  title: {
    width: cx(343),
    height: cx(72),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: cx(16),
  },
  img: {
    width: cx(28),
    height: cx(28),
  },
  leftcontent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleText: {
    backgroundColor: 'transparent',
    color: '#333333',
    fontSize: cx(16),
  },
  animate: {
    width: cx(343),
  },
});

export default DropDown;
