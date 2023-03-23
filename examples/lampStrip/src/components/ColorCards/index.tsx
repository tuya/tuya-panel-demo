import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Utils, Button } from 'tuya-panel-kit';
import Res from '@res';
import RectColorAndBrightPicker from '../RectColorAndBrightPicker2';
import { Color, White } from './Colors';

const { hsvToRgb } = Utils.ColorUtils;
const ISCOLORFUL = true;
const MAX = 1000;
const MIN = 10;

type LightModeType = 'colour' | 'white';

interface ColorWeelProps {
  style?: StyleProp<ViewStyle>;
  isDark: boolean;
  lightMode: LightModeType;
  /**
   * 彩光模式对应数据
   */
  colourData?: ColourData;
  /**
   * 白光模式对应数据
   */
  brightData?: WhiteData;
  onReleseBackColorful?: (data: ColourData) => void;
  onMoveBackColorful?: (data: ColourData) => void;
  onReleseBackWhite?: (data: WhiteData) => void;
  onMoveBackWhite?: (data: WhiteData) => void;
  hideBright?: boolean;
}

interface ColorWeelState {
  bright: number;
  hsv: { [key: string]: number } | any;
  temp: number | undefined;
}

export default class ColorCards extends PureComponent<ColorWeelProps, ColorWeelState> {
  constructor(props: ColorWeelProps) {
    super(props);
    const { colourData, brightData } = props;
    this.state = {
      bright: brightData?.brightness || 1000,
      hsv: colourData || {},
      temp: brightData?.temperature,
    };
  }

  componentWillReceiveProps(nextProps: ColorWeelProps) {
    const { brightData, colourData } = this.props;
    if (brightData !== nextProps.brightData) {
      const { temperature, brightness } = nextProps.brightData;
      this.setState({
        bright: brightness,
        temp: temperature,
      });
    }
    if (colourData !== nextProps.colourData) {
      this.setState({
        hsv: nextProps.colourData,
      });
    }
  }

  getImg = (idx: number) => {
    let img = Res.selectBox2;
    switch (idx) {
      case 0:
        img = Res.selectBoxLeft2;
        break;
      case 10:
        img = Res.selectBoxRight2;
        break;
      default:
        break;
    }
    return img;
  };

  handleBrightMove = (v: number, isColor: boolean) => {
    if (isColor) {
      const { hsv } = this.state;
      const { onMoveBackColorful } = this.props;
      const data = {
        ...hsv,
        value: v,
      };
      this.setState({
        hsv: data,
      });
      onMoveBackColorful && onMoveBackColorful(data);
    } else {
      const { onMoveBackWhite } = this.props;
      const { temp } = this.state;
      this.setState({
        bright: v,
      });
      onMoveBackWhite &&
        onMoveBackWhite({
          brightness: v,
          temperature: temp,
        });
    }
  };

  handleBrightRelease = (v: number, isColor: boolean) => {
    if (isColor) {
      const { hsv } = this.state;
      const { onReleseBackColorful } = this.props;
      const data = {
        ...hsv,
        value: v,
      };
      this.setState({
        hsv: data,
      });
      onReleseBackColorful && onReleseBackColorful(data);
    } else {
      const { onReleseBackWhite } = this.props;
      const { temp } = this.state;
      this.setState({
        bright: v,
      });
      onReleseBackWhite &&
        onReleseBackWhite({
          brightness: v,
          temperature: temp,
        });
    }
  };

  handleClick = ({ h, s, hsvState }) => {
    const { onReleseBackColorful } = this.props;
    const data = {
      hue: h,
      saturation: s,
      value: hsvState.value,
    };
    this.setState({
      hsv: data,
    });
    onReleseBackColorful?.(data);
  };

  renderColorfulPiece = () => {
    const { isDark, hideBright } = this.props;
    const { hsv: hsvState } = this.state;
    const { hue, saturation } = hsvState;
    return (
      <View style={styles.content}>
        <View
          style={[
            styles.flatStyle,
            { flexWrap: 'wrap' },
            hideBright && { borderRadius: 12, overflow: 'hidden' },
          ]}
        >
          {Color.map((item, idx) => {
            const hsv = item;
            const { hue: h, saturation: s, value: v } = hsv;
            const rgb = hsvToRgb(h, s / 1000, v / 1000);
            const { r, g, b } = rgb;
            const rgbColor = `rgb(${r},${g},${b})`;
            const isActicve = h === hue && s === saturation;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <View key={idx}>
                <Button
                  activeOpacity={0.8}
                  style={[
                    styles.touchStyle,
                    {
                      width: 30,
                      backgroundColor: rgbColor,
                    },
                  ]}
                  onPress={() => this.handleClick({ h, s, hsvState })}
                />
                {isActicve && (
                  <TouchableWithoutFeedback onPress={() => this.handleClick({ h, s, hsvState })}>
                    <View
                      style={[
                        {
                          width: 30,
                          height: 30,
                          borderRadius: 2,
                          backgroundColor: 'transarent',
                          borderColor: isActicve ? '#fff' : 'transparent',
                          borderWidth: isActicve ? 3 : 0,
                          position: 'absolute',
                        },
                        idx === 0 && { borderTopLeftRadius: 12 },
                        idx === 10 && { borderTopRightRadius: 12 },
                      ]}
                    />
                  </TouchableWithoutFeedback>
                )}
              </View>
            );
          })}
        </View>
        {!hideBright && (
          <RectColorAndBrightPicker.BrightnessSlider
            trackColor={isDark ? 'rgba(255,255,255,.1)' : '#EFEFEF'}
            value={hsvState.value}
            max={MAX}
            min={MIN}
            style={{ width: 330, height: 38 }}
            onMove={(v: number) => this.handleBrightMove(v, ISCOLORFUL)}
            onRelease={(v: number) => this.handleBrightRelease(v, ISCOLORFUL)}
            onPress={(v: number) => this.handleBrightRelease(v, ISCOLORFUL)}
            clickEnabled={true}
          />
        )}
      </View>
    );
  };

  renderWhitePiece = () => {
    const { onReleseBackWhite, isDark } = this.props;
    const { bright } = this.state;
    return (
      <View style={styles.content}>
        <View style={styles.flatStyle}>
          {White.map((item, idx) => {
            return (
              <View key={idx}>
                <Button
                  activeOpacity={0.8}
                  style={[
                    styles.touchWhiteStyle,
                    {
                      backgroundColor: item.color,
                    },
                  ]}
                  onPress={() => {
                    this.setState({
                      temp: item.value,
                    });
                    onReleseBackWhite &&
                      onReleseBackWhite({
                        brightness: bright,
                        temperature: item.value,
                      });
                  }}
                />
              </View>
            );
          })}
        </View>
        <RectColorAndBrightPicker.BrightnessSlider
          trackColor={isDark ? 'rgba(255,255,255,.1)' : '#EFEFEF'}
          value={bright < 10 ? 10 : bright}
          max={1000}
          min={10}
          style={{ width: 330, height: 38 }}
          onMove={(v: number) => this.handleBrightMove(v, !ISCOLORFUL)}
          onRelease={(v: number) => this.handleBrightRelease(v, !ISCOLORFUL)}
          onPress={(v: number) => this.handleBrightRelease(v, !ISCOLORFUL)}
          clickEnabled={true}
        />
      </View>
    );
  };

  render() {
    const { lightMode, style } = this.props;
    const { temp } = this.state;
    const isWhite = lightMode === 'white';
    const valueArr = White.map(w => w.value);
    const realIdx = valueArr.indexOf(temp);
    const idx = realIdx !== -1 ? realIdx : 0;
    const left = idx * 30;

    return (
      <View style={[styles.weelContent, style]}>
        {isWhite ? this.renderWhitePiece() : this.renderColorfulPiece()}
        {isWhite && realIdx !== -1 && (
          <Image
            source={this.getImg(idx)}
            style={[
              styles.selectBox,
              {
                top: -2,
                left,
              },
              idx === 0 && {
                width: 33,
                height: 153,
              },
              idx === 10 && {
                width: 30,
                height: 153,
              },
            ]}
            resizeMode="stretch"
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  touchStyle: {
    width: 30,
    height: 30,
  },
  flatStyle: {
    width: 330,
    height: 150,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  touchWhiteStyle: {
    width: 30,
    height: 150,
  },
  weelContent: {
    width: 330,
    height: 190,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    width: 330,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  selectBox: {
    width: 34,
    height: 153,
    position: 'absolute',
  },
});
