import color from 'color';
import throttle from 'lodash/throttle';
import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Utils, IconFont } from 'tuya-panel-kit';
import RectColorPicker, { PickerData } from '../../../components/RectColorPicker';
import Res from '../../../res';
import SliderView from '../../../components/SliderView';
import Strings from '../../../i18n';
import { calcPercent } from '../../../utils';
import icons from '../../../res/iconfont';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface ColourEditorProps {
  theme: {
    fontColor: string;
    themeColor: string;
  };
  isCold: boolean;
  isSupportColor: boolean;
  isSupportWhite: boolean;
  isSupportWhiteTemp: boolean;
  isSupportWhiteBright: boolean;
  isColour: boolean;
  hsb: number[];
  kelvin: number;
  whiteBrightness: number;
  onDelete: () => void;
  onChange: (data: EditColorData) => void;
}

interface EditColorData {
  isColour: boolean;
  hsb: number[];
  whiteHsb: number[];
  kelvin: number;
  whiteBrightness: number;
}

interface ColourEditorState {
  isColour: boolean;
  hsb: number[];
  whiteHsb: number[];
  kelvin: number;
  whiteBrightness: number;
}

// 点击颜色方块展开的颜色编辑器
export default class ColourEditor extends Component<ColourEditorProps, ColourEditorState> {
  constructor(props) {
    super(props);
    const { isSupportColor, isColour } = props;
    const whiteHsb = this.calcWhiteHsb(props.kelvin, props.whiteBrightness);
    this.state = {
      isColour: isSupportColor && isColour,
      hsb: props.hsb,
      whiteHsb,
      kelvin: props.kelvin,
      whiteBrightness: props.whiteBrightness,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: ColourEditorProps) {
    const { isColour, hsb, kelvin, whiteBrightness } = this.props;
    if (isColour !== nextProps.isColour) {
      this.setState({
        isColour: nextProps.isSupportColor && nextProps.isColour,
      });
    }
    if (hsb !== nextProps.hsb) {
      this.setState({ hsb: nextProps.hsb });
    }
    if (kelvin !== nextProps.kelvin) {
      const whiteHsb = this.calcWhiteHsb(nextProps.kelvin, nextProps.whiteBrightness);
      this.setState({
        whiteHsb,
        kelvin: nextProps.kelvin,
      });
    }
    if (whiteBrightness !== nextProps.whiteBrightness) {
      this.setState({
        whiteBrightness: nextProps.whiteBrightness,
      });
    }
  }

  shouldComponentUpdate(nextProps: ColourEditorProps, nextState: ColourEditorState) {
    const { isColour, hsb, whiteHsb, kelvin, whiteBrightness } = this.state;
    return (
      isColour !== nextState.isColour ||
      hsb !== nextState.hsb ||
      whiteHsb !== nextState.whiteHsb ||
      kelvin !== nextState.kelvin ||
      whiteBrightness !== nextState.whiteBrightness
    );
  }

  calcWhiteHsb(k: number, b: number) {
    const { isCold, isSupportWhiteTemp } = this.props;
    let kelvin = k;
    if (!isSupportWhiteTemp) {
      kelvin = isCold ? 9000 : 2500;
    }
    const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
    const [h, s] = Utils.ColorUtils.color.rgb2hsb(...rgb);
    return [h, s, b];
  }

  _toggleSelector = (value: boolean) => () => {
    const { onChange } = this.props;
    const { isColour, hsb, kelvin, whiteHsb, whiteBrightness } = this.state;
    if (value === isColour) {
      return;
    }
    this.setState({ isColour: value });
    const newWhiteHsb = [...whiteHsb];
    newWhiteHsb[2] = whiteBrightness;
    onChange({
      isColour,
      hsb,
      whiteHsb: newWhiteHsb,
      kelvin,
      whiteBrightness,
    });
  };

  _handleColourChange = throttle((data: PickerData) => {
    const [hue] = data.hsb;
    const { onChange } = this.props;
    this.setState(({ isColour, hsb, whiteHsb, kelvin, whiteBrightness }) => {
      const newHsb = [...hsb];
      newHsb[0] = hue;
      onChange({
        isColour,
        hsb: newHsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      });
      return { hsb: newHsb };
    });
  }, 150);

  _handleTempChange = throttle((data: PickerData) => {
    const { onChange } = this.props;
    this.setState(({ isColour, hsb, whiteBrightness }) => {
      const whiteHsb = data.hsb;
      const kelvin = data.k;
      whiteHsb[2] = whiteBrightness;
      onChange({
        isColour,
        hsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      });
      return { whiteHsb, kelvin };
    });
  }, 150);

  _handleBrightnessChange = throttle((brightness: number) => {
    const { onChange } = this.props;
    const { kelvin, whiteBrightness } = this.state;
    this.setState(({ isColour, hsb, whiteHsb }) => {
      const newHsb = [...hsb];
      newHsb[2] = Math.round(brightness);
      onChange({
        isColour,
        hsb: newHsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      });
      return { hsb: newHsb };
    });
  }, 150);

  _handleWBrightnessChange = throttle((whiteBrightness: number) => {
    const { onChange } = this.props;
    this.setState(({ isColour, hsb, whiteHsb, kelvin }) => {
      const newHsb = [...whiteHsb];
      newHsb[2] = whiteBrightness;
      onChange({
        isColour,
        hsb,
        whiteHsb: newHsb,
        kelvin,
        whiteBrightness: Math.round(whiteBrightness),
      });
      return { whiteBrightness: Math.round(whiteBrightness) };
    });
  }, 150);

  _handleSaturationChange = throttle((saturation: number) => {
    const { onChange } = this.props;
    this.setState(({ isColour, hsb, whiteHsb, kelvin, whiteBrightness }) => {
      const newHsb = [...hsb];
      newHsb[1] = Math.round(saturation);
      onChange({
        isColour,
        hsb: newHsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      });
      return { hsb: newHsb };
    });
  }, 150);

  _renderSelectSection() {
    const {
      theme: { fontColor: C1, themeColor: C2 },
      isSupportColor,
      isSupportWhite,
      onDelete,
    } = this.props;

    const { isColour } = this.state;
    const borderColor = color(C1).alpha(0.3).rgbString();
    const iconBgColor = color(C1).alpha(0.1).rgbString();
    const activeIconBgColor = color(C2).alpha(0.5).rgbString();
    return (
      <View style={[styles.row, { width: '100%', marginTop: 30 }]}>
        <View
          style={[styles.row, styles.colourSelector, { borderColor, backgroundColor: iconBgColor }]}
        >
          {isSupportColor && (
            <TouchableOpacity
              accessibilityLabel="CustomScene_ColourEditor_ColourTab"
              activeOpacity={0.9}
              style={[styles.colourBox, isColour && { backgroundColor: activeIconBgColor }]}
              onPress={this._toggleSelector(true)}
            >
              <Image source={Res.colour} />
            </TouchableOpacity>
          )}
          {isSupportWhite && (
            <TouchableOpacity
              accessibilityLabel="CustomScene_ColourEditor_WhiteTab"
              activeOpacity={0.9}
              style={[styles.colourBox, !isColour && { backgroundColor: activeIconBgColor }]}
              onPress={this._toggleSelector(false)}
            >
              <Image source={Res.temp} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          accessibilityLabel="CustomScene_ColourEditor_Delete"
          activeOpacity={0.9}
          style={[styles.row, styles.deleteBox, { backgroundColor: iconBgColor }]}
          onPress={onDelete}
        >
          <IconFont d={icons.delete} size={cx(16)} fill={C1} stroke={C1} />
          <Text style={[styles.text, { color: C1, marginLeft: cx(7) }]}>
            {Strings.getLang('delete')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderControlSection() {
    const { isSupportWhite, isSupportWhiteTemp, isSupportWhiteBright, theme } = this.props;
    const { fontColor } = theme;
    const { isColour, hsb, whiteHsb, kelvin, whiteBrightness } = this.state;
    // 白光对应的Hue值与彩光的不同，需要经过转换，用于定位白光位置
    const whiteHue = calcPercent(2500, 9000, kelvin) * 360;
    const [, saturation, brightness] = hsb;
    const [, wSaturation, wBrightness] = whiteHsb;

    return (
      <View style={[styles.sliderBox, !isColour && { height: cy(120) }]}>
        {isColour ? (
          <RectColorPicker
            accessibilityLabel="CustomScene_ColourEditor_Colour"
            style={styles.slider}
            hueStyle={styles.sliderTrack}
            thumbStyle={[styles.sliderThumb, { backgroundColor: fontColor }]}
            hsb={hsb}
            renderThumb={props => <View {...props} />}
            onValueChange={this._handleColourChange}
            onComplete={this._handleColourChange}
          />
        ) : (
          isSupportWhite &&
          isSupportWhiteTemp && (
            <RectColorPicker
              accessibilityLabel="CustomScene_ColourEditor_Kelvin"
              kelvin={true}
              style={styles.slider}
              hueStyle={styles.sliderTrack}
              thumbStyle={[styles.sliderThumb, { backgroundColor: fontColor }]}
              hsb={[whiteHue, wSaturation, wBrightness]}
              renderThumb={props => <View {...props} />}
              onValueChange={this._handleTempChange}
              onComplete={this._handleTempChange}
            />
          )
        )}
        {isColour ? (
          <SliderView
            id={hsb.join()}
            accessibilityLabel="CustomScene_ColourEditor_Brightness"
            theme={theme}
            icon={icons.brightness}
            min={1}
            max={100}
            sliderStyle={{ width: SLIDER_WIDTH1 }}
            percentStartPoint={1}
            value={brightness}
            onValueChange={this._handleBrightnessChange}
            onSlidingComplete={this._handleBrightnessChange}
          />
        ) : (
          isSupportWhite &&
          isSupportWhiteBright && (
            <SliderView
              id={hsb.join()}
              accessibilityLabel="CustomScene_ColourEditor_WhiteBrightness"
              theme={theme}
              icon={icons.brightness}
              min={1}
              max={100}
              sliderStyle={{ width: SLIDER_WIDTH1 }}
              percentStartPoint={1}
              value={whiteBrightness}
              onValueChange={this._handleWBrightnessChange}
              onSlidingComplete={this._handleWBrightnessChange}
            />
          )
        )}
        {isColour && (
          <SliderView
            id={hsb.join()}
            accessibilityLabel="CustomScene_ColourEditor_Saturation"
            theme={theme}
            icon={icons.saturation}
            min={0}
            max={100}
            sliderStyle={{ width: SLIDER_WIDTH1 }}
            value={saturation}
            onValueChange={this._handleSaturationChange}
            onSlidingComplete={this._handleSaturationChange}
          />
        )}
      </View>
    );
  }

  render() {
    const {
      theme: { fontColor: C1 },
      isSupportColor,
      isSupportWhite,
    } = this.props;
    if (!isSupportColor && !isSupportWhite) {
      return null;
    }
    const bgColor = color(C1).alpha(0.06).rgbString();
    return (
      <View style={styles.container}>
        <View style={[styles.arrow, { borderBottomColor: bgColor }]} />
        <View style={[styles.content, { backgroundColor: bgColor }]}>
          {/* 彩光、白光、删除选择区域 */}
          {this._renderSelectSection()}
          {/* Slider区域 */}
          {this._renderControlSection()}
        </View>
      </View>
    );
  }
}

const SLIDER_WIDTH = cx(316);
const SLIDER_WIDTH1 = cx(238);
const SLIDER_HEIGHT = Math.max(6, cy(6));

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 8,
  },
  arrow: {
    width: 0,
    height: 0,
    borderWidth: 10,
    borderColor: 'transparent',
    marginLeft: cx(30),
    position: 'absolute',
    top: -10,
  },

  content: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: cx(16),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  colourSelector: {
    borderRadius: Math.max(40, cx(40)) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  colourBox: {
    width: Math.max(58, cx(58)),
    height: Math.max(40, cx(40)),
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteBox: {
    height: cy(30),
    borderRadius: cy(15),
    paddingHorizontal: cx(14),
  },

  text: {
    fontSize: cx(12),
    color: '#fff',
  },

  sliderBox: {
    height: cy(180),
    justifyContent: 'space-around',
    marginVertical: cy(30),
  },

  slider: {
    width: SLIDER_WIDTH,
    height: cx(28),
    justifyContent: 'center',
  },

  sliderTrack: {
    justifyContent: 'center',
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
  },

  sliderThumb: {
    width: cx(24),
    height: cx(24),
    borderRadius: cx(12),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
});
