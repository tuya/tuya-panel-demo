/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { TYText, IconFont } from 'tuya-panel-kit';
import icons from './icons';

interface IPercentProps {
  layout: 'left' | 'top' | 'right' | 'bottom';
  percent?: number;
  colorOver: string;
  style: any; // 百分比样式
  outColor: string; // 滑动激活区外的百分比颜色
  length?: number;
  iconSize: number;
  iconColor: string;
  tintStyle?: ViewStyle;
  customIcon?: string;
}

export default class Percent extends React.Component<IPercentProps, IPercentProps> {
  constructor(props: IPercentProps) {
    super(props);
    this.state = { ...this.props };
  }

  componentWillReceiveProps(nextProps: IPercentProps) {
    this.setState({ ...nextProps });
  }

  setNativeProps(nextProps: IPercentProps) {
    this.setState({ ...nextProps });
  }

  render() {
    const {
      percent = 0,
      length = 0,
      colorOver,
      style,
      outColor,
      iconSize,
      layout,
      iconColor,
    } = this.state;
    const { customIcon } = this.props;
    let icon = icons.brightLevel1;
    if (percent > 20 && percent <= 60) {
      icon = icons.brightLevel2;
    } else if (percent > 60) {
      icon = icons.brightLevel3;
    }
    let lengthKey = 'width';
    const isVertical = layout === 'top' || layout === 'bottom';
    if (layout === 'top' || layout === 'bottom') {
      lengthKey = 'height';
    }
    const { fontSize } = StyleSheet.flatten([styles.percentText, style]);
    const textWidth = fontSize * 3;
    const minWidth = iconSize + textWidth + 4;
    return (
      <View style={styles.percent} pointerEvents="none">
        <View style={styles[layout]}>
          <View style={[styles[`${layout}Text`], isVertical ? { minWidth } : { width: minWidth }]}>
            <IconFont
              d={customIcon || icon}
              size={iconSize}
              color={outColor}
              style={styles.percentIcon}
            />
            <TYText style={[styles.percentText, style, { color: outColor }]}>{percent}%</TYText>
          </View>
        </View>
        <View
          style={[
            styles.mark,
            styles[layout],
            {
              [layout]: 0,
              [lengthKey]: length,
              backgroundColor: colorOver,
              borderRadius: 14,
            },
            // eslint-disable-next-line react/destructuring-assignment
            this.props.tintStyle,
          ]}
        >
          <View style={[styles[`${layout}Text`], isVertical ? { minWidth } : { width: minWidth }]}>
            <IconFont
              style={styles.percentIcon}
              d={customIcon || icon}
              size={iconSize}
              color={iconColor}
            />
            <TYText style={[styles.percentText, style]}> {percent}% </TYText>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mark: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 1,
    height: '100%',
    width: '100%',
  },
  percent: {
    flex: 1,
  },
  percentIcon: {
    // marginLeft: 16,
  },
  percentText: {
    marginLeft: 4,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  right: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  top: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  leftText: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    marginLeft: 16,
  },
  rightText: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    height: '100%',
    marginRight: 16,
  },
  topText: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  bottomText: {
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
});
