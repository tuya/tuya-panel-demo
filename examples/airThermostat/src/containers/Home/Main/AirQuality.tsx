import React, { Component } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Color from 'color';
import { LinearGradient, TYText, UnitText, Utils } from 'tuya-panel-kit';
import { Circle } from 'react-native-svg';
import Strings from 'i18n/index';
import Res from 'res/index';
import dpCodes from 'config/default/dpCodes';

const {
  RatioUtils: { convertX: cx },
  ThemeUtils: { withTheme },
} = Utils;
const { pm25Code } = dpCodes;

interface IProps {
  pm25: number;
  power: boolean;
  airQuality: string;
  theme?: any;
}

@withTheme
export default class AirQuality extends Component<IProps> {
  animation: Animated.Value = new Animated.Value(0);
  loop: boolean = false;
  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.power !== this.props.power) {
      if (nextProps.power) {
        this.loop = true;
        this.runAnimation();
      } else {
        this.loop = false;
      }
    }
  }
  componentDidMount() {
    if (this.props.power) {
      this.loop = true;
      this.runAnimation();
    }
  }
  shouldComponentUpdate(nextProps: IProps) {
    const { power, pm25, airQuality } = nextProps;
    return (
      power !== this.props.power || pm25 !== this.props.pm25 || airQuality !== this.props.airQuality
    );
  }
  componentWillUnmount() {
    this.animation.stopAnimation();
  }
  runAnimation = () => {
    this.animation.stopAnimation();
    Animated.timing(this.animation, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
    }).start(({ finished }) => {
      this.animation.setValue(0);
      if (finished && this.loop) {
        this.runAnimation();
      }
    });
  };
  renderAnimation() {
    const color = this.getColor();
    return [0, 1, 2].map(i => {
      return (
        <Animated.Image
          key={i}
          source={Res.ellipse}
          style={[
            styles.ellipse,
            {
              tintColor: color,
              transform: [
                {
                  rotate: Animated.add(i * 0.33, this.animation).interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      );
    });
  }
  getColor() {
    const {
      airQuality,
      theme: {
        global: { brand: themeColor },
      },
    } = this.props;
    try {
      return Color(Strings.getLang(`airColor_${airQuality}`)).rgbaString();
    } catch (e) {
      return themeColor;
    }
  }
  render() {
    const { pm25 } = this.props;
    const color = this.getColor();
    return (
      <View style={styles.container}>
        {this.renderAnimation()}
        <View style={styles.circleBox}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [
                  {
                    scale: this.animation.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [1, 1.02, 0.98, 1.02, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              stops={{ '0%': Color(color).mix(Color('rgba(255,255,255, 0.4)')), '100%': color }}
              style={{ width: circleSize, height: circleSize }}
            >
              <Circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2} />
            </LinearGradient>
          </Animated.View>
          <TYText style={styles.pm25Label}>{Strings.getDpLang(pm25Code)}</TYText>
          <UnitText size={cx(70)} value={pm25} />
          <TYText style={styles.room}>{Strings.getLang('room')}</TYText>
        </View>
      </View>
    );
  }
}

const circleSize = cx(176);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: cx(140),
    width: cx(340),
    height: cx(340),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipse: {
    position: 'absolute',
    height: cx(314),
    width: cx(242),
  },
  circleBox: {
    width: circleSize,
    height: circleSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: circleSize,
    height: circleSize,
  },
  pm25Label: {
    fontSize: cx(13),
    color: '#fff',
    marginBottom: cx(8),
  },
  room: {
    fontSize: cx(12),
    color: '#fff',
    marginTop: cx(8),
  },
});
