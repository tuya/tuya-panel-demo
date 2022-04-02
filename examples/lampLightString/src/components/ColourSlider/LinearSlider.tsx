/* eslint-disable react/no-unused-state */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React from 'react';
import { StyleProp, View, ViewStyle, StyleSheet } from 'react-native';
import { NumberSlider } from '@tuya/tuya-panel-lamp-sdk';
import { Utils, LinearGradient } from 'tuya-panel-kit';
import _ from 'lodash';
// @ts-ignore
import { Rect } from 'react-native-svg';
import { ColorUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { dpCodes } from '@config';
import { connect } from 'react-redux';

const { withTheme } = Utils.ThemeUtils;
const { convertX: cx, width: winWidth } = Utils.RatioUtils;
const { smearCode } = dpCodes;
type IMenu = 'hue' | 'brightness' | 'temperature' | 'custom' | 'saturation';
interface LinearSliderProps {
  type: IMenu;
  color: any;
  uiColor: any;
  value: number;
  min: number;
  max: number;
  showMin: number;
  trackBg?: any;
  trackStyle?: StyleProp<ViewStyle>;
  onMove?: (v: number) => void;
  onRelease?: (v: number) => void;
  onPress?: (v: number) => void;
  theme?: any;
  disabled: boolean;
  smearData: any;
}

interface State {
  value: number;
  disabled: boolean;
}
class LinearSlider extends React.Component<LinearSliderProps, State> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    trackBg: {
      '0%': '#343434',
      '100%': '#FFFFFF',
    },
  };

  constructor(props: LinearSliderProps | Readonly<LinearSliderProps>) {
    super(props);
    this.state = {
      disabled: props.disabled,
      value: props.value,
    };
  }

  // eslint-disable-next-line react/sort-comp
  handlePress = (v: number) => {
    const { onPress } = this.props;
    !!onPress && onPress(v);
  };

  handleMove = _.throttle(v => {
    // 根据type值分别计算thumb的颜色
    const { onMove } = this.props;
    !!onMove && onMove(v);
  }, 50);

  componentWillReceiveProps(nextProps: LinearSliderProps) {
    this.setState({
      disabled: nextProps.disabled,
    });
    if (this.thumbRef) {
      // @ts-ignore
      this.thumbRef?.setNativeProps({
        style: {
          backgroundColor: this.tintColor(nextProps),
        },
      });
    }
  }

  renderMaximumTrack = () => {
    const { type, trackBg } = this.props;
    let stops;
    switch (type) {
      case 'hue':
        stops = {
          '0%': '#FF0000',
          '12.5%': '#FFBF00',
          '25%': '#7FFF00',
          '37.5%': '#00FF3F',
          '50%': '#00FFFF',
          '62.5%': '#003FFF',
          '75%': '#7F00FF',
          '87.5%': '#FF00BF',
          '100%': '#FF0000',
        };
        break;
      case 'temperature':
        stops = {
          '0%': '#F49B43',
          '65%': '#E6EEE4',
          '100%': '#8CD1D7',
        };
        break;
      default:
        stops = trackBg;
    }
    return (
      <LinearGradient stops={stops} y2="0%" x2="100%">
        <Rect width={winWidth} height={cx(31)} />
      </LinearGradient>
    );
  };

  tintColor = (props: Readonly<LinearSliderProps> & Readonly<{ children?: React.ReactNode }>) => {
    const { type, value, color } = props;
    if (type === 'hue') {
      return ColorUtils.hsv2rgba(color.hue, 1000, 1000);
    }
    if (type === 'saturation') {
      return ColorUtils.hsv2rgba(color.hue, color.saturation, 1000);
    }
    if (type === 'brightness') {
      return `rgba(0,0,0, ${1 - value * 0.001})`;
    }
    return ColorUtils.hsv2rgba(0, 0, 0);
  };

  thumbRef: React.ReactNode | undefined = undefined;

  render() {
    const { value, min, max, showMin, onRelease, theme } = this.props;
    const { disabled } = this.state;
    const {
      global: { isDefaultTheme },
    } = theme;
    const tintColor = this.tintColor(this.props);

    return (
      <NumberSlider
        value={value} // 0-1000
        min={min}
        max={max}
        showMin={showMin}
        showAnimation={false}
        onMove={(v: any) => {
          if (disabled) {
            return;
          }
          this.handleMove(v);
        }}
        onPress={this.handlePress}
        onRelease={(v: number) => {
          if (disabled) {
            return;
          }
          !!onRelease && onRelease(v);
        }}
        style={styles.linerSlider}
        trackStyle={{
          height: cx(14),
          borderRadius: cx(7),
        }}
        thumbTouchSize={styles.thumbSize}
        thumbStyle={styles.thumb}
        showTint={false}
        renderTrack={this.renderMaximumTrack}
        renderThumb={() => {
          return (
            <View
              style={[
                styles.thumbContainer,
                { backgroundColor: isDefaultTheme ? 'rgba(37,45,59,1)' : 'rgba(255,255,255,1)' },
              ]}
            >
              <View style={styles.renderStyle}>
                <View
                  style={[styles.renderThumb, { backgroundColor: String(tintColor) }]}
                  ref={ref => {
                    this.thumbRef = ref;
                  }}
                />
              </View>
            </View>
          );
        }}
      />
    );
  }
}

export default connect(({ uiState, dpState }: any) => {
  return {
    uiColor: { hue: uiState.hue, saturation: uiState.saturation, value: uiState.value },
    smearData: dpState[smearCode],
  };
})(withTheme(LinearSlider));

const styles = StyleSheet.create({
  linerSlider: {
    width: '100%',
    height: cx(26),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: cx(8),
  },
  thumb: {
    backgroundColor: 'transparent',
    width: cx(18),
    height: '100%',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbContainer: {
    width: cx(32),
    height: cx(32),
    borderRadius: cx(16),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbSize: {
    width: cx(52),
    height: cx(52),
  },
  renderStyle: {
    width: cx(26),
    height: cx(26),
    borderRadius: cx(13),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  renderThumb: {
    width: cx(22),
    height: cx(22),
    borderRadius: cx(11),
  },
});
