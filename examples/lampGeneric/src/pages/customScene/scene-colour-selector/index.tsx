/* eslint-disable @typescript-eslint/no-empty-function */
import color from 'color';
import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { TYSdk, Utils, TYText } from 'tuya-panel-kit';
import Button from '../../../components/Button';
import ColourEditor from './colour-editor';
import Strings from '../../../i18n';
import { randomHsb, ColorParser } from '../../../utils';
import icons from '../../../res/iconfont';
import DpCodes from '../../../config/dpCodes';

const { convertX: cx } = Utils.RatioUtils;
const { sceneCode: sceneValueCode } = DpCodes;
const TYNative = TYSdk.native;

// 每行的颜色方块数量
const RECT_NUM = 6;

interface SceneColorData {
  isColour: boolean;
  hsb: number[];
  kelvin: number;
  whiteBrightness: number;
  whiteHsb: number[];
}

interface SceneColourSelectorProps {
  theme: any;
  onlyOne: boolean;
  isCold: boolean;
  isSupportColor: boolean;
  isSupportWhite: boolean;
  isSupportWhiteTemp: boolean;
  isSupportWhiteBright: boolean;
  isBuiltIn: boolean;
  colours: SceneColorData[];
  maxLen: number;
  onChange: (colorData: SceneColorData[], colors: SceneColorData | undefined, key: string) => void;
}

interface SceneColourState {
  size: number;
  activeIdx: number;
  colours: SceneColorData[];
}

export default class SceneColourSelector extends Component<
  SceneColourSelectorProps,
  SceneColourState
> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    theme: {
      fontColor: '#fff',
      themeColor: '#39A9FF',
    },
    onlyOne: false,
    isCold: false,
    isSupportColor: true,
    isSupportWhite: true,
    isSupportWhiteTemp: true,
    isSupportWhiteBright: true,
    colours: [],
    maxLen: 8,
  };

  constructor(props: SceneColourSelectorProps) {
    super(props);
    this.state = {
      size: 0,
      activeIdx: -1,
      colours: this.props.colours,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: SceneColourSelectorProps) {
    // 当从多色切换成单色时，需要取消之前多色的选择框
    if (!this.props.onlyOne && nextProps.onlyOne) {
      this.setState({ activeIdx: -1 });
    }
    if (this.props.colours !== nextProps.colours) {
      this.setState({ colours: nextProps.colours });
    }
  }

  shouldComponentUpdate(nextProps: SceneColourSelectorProps, nextState: SceneColourState) {
    return (
      this.props.onlyOne !== nextProps.onlyOne ||
      this.state.size !== nextState.size ||
      this.state.activeIdx !== nextState.activeIdx ||
      this.state.colours !== nextState.colours
    );
  }

  _handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    this.setState({ size: layout.width / RECT_NUM });
  };

  _handleColourPress(idx: number) {
    this.setState(({ activeIdx, colours }: SceneColourState) => {
      const newActiveIdx = activeIdx === idx ? -1 : idx;
      this.props.onChange(colours, colours[newActiveIdx], 'select');
      return {
        activeIdx: newActiveIdx,
      };
    });
  }

  _handleAddColour = () => {
    const { maxLen, isCold, isSupportColor, isSupportWhiteTemp } = this.props;
    if (this.state.colours.length >= maxLen) {
      return TYNative.simpleTipDialog(Strings.getLang('exceedMaxLength'), () => {});
    }
    this.setState(({ activeIdx, colours }: SceneColourState) => {
      let kelvin = 9000;
      if (!isSupportWhiteTemp) {
        kelvin = isCold ? 9000 : 2500;
      }
      const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
      const whiteHsb = Utils.ColorUtils.color.rgb2hsb(...rgb);
      const newColours = [
        ...colours,
        {
          isColour: isSupportColor,
          hsb: randomHsb(),
          whiteHsb,
          kelvin,
          whiteBrightness: 100,
        },
      ];
      const newActiveIdx = newColours.length - 1;
      this.props.onChange(newColours, newColours[newActiveIdx], 'add');
      return {
        activeIdx: newActiveIdx,
        colours: newColours,
      };
    });
  };

  _handleChangeColor = (data: SceneColorData) => {
    const { isColour, hsb, whiteHsb, kelvin, whiteBrightness } = data;
    this.setState(({ activeIdx, colours }: SceneColourState) => {
      const newColours = [...colours];
      newColours[activeIdx].isColour = isColour;
      if (isColour) {
        newColours[activeIdx].hsb = hsb;
      } else {
        newColours[activeIdx].whiteHsb = whiteHsb;
        newColours[activeIdx].kelvin = kelvin;
        newColours[activeIdx].whiteBrightness = whiteBrightness;
      }
      this.props.onChange(newColours, newColours[activeIdx], 'change');
      return { colours: newColours };
    });
  };

  _handleDeleteColour = () => {
    const { onlyOne, isBuiltIn } = this.props;
    if (this.state.colours.length === 0) {
      return TYNative.simpleTipDialog(Strings.getLang('emptyColour'), () => {});
    }
    if (onlyOne) {
      return TYNative.simpleTipDialog(Strings.getLang('builtInSceneTip'), () => {});
    }
    // 非静态场景下，需要保留两个颜色
    if (!onlyOne && this.state.colours.length <= 2) {
      return TYNative.simpleTipDialog(Strings.getLang('builtInSceneTip'), () => {});
    }
    this.setState(({ activeIdx, colours }: SceneColourState) => {
      const newColours = [...colours];
      newColours.splice(activeIdx, 1);
      this.props.onChange(newColours, undefined, 'delete');
      return {
        activeIdx: -1,
        colours: newColours,
      };
    });
  };

  _renderColourRects = () => {
    let { colours } = this.state;
    if (this.props.onlyOne) {
      colours = this.state.colours.slice(0, 1);
    }
    return colours.map(({ isColour, hsb, whiteHsb }: SceneColorData, idx: number) => {
      const { activeIdx, size } = this.state;
      const isActive = idx === activeIdx;

      const backgroundColor = isColour
        ? ColorParser.hsv2rgba(hsb[0], hsb[1] * 10, hsb[2] * 10)
        : ColorParser.hsv2rgba(whiteHsb[0], whiteHsb[1] * 10, whiteHsb[2] * 10);
      return (
        <View
          key={idx} // eslint-disable-line react/no-array-index-key
          style={[styles.colourWrapper, { marginLeft: idx % 6 === 0 ? 0 : cx(14) }]}
        >
          <TouchableOpacity
            accessibilityLabel={`CustomScene_ColourRect${idx}`}
            activeOpacity={0.9}
            style={[styles.colour__outer, isActive && styles.colour__outer_active]}
            onPress={() => this._handleColourPress(idx)}
          >
            <View style={[styles.colour__inner, { backgroundColor }]} />
            {isActive && <View style={styles.innerSelected} />}
          </TouchableOpacity>
        </View>
      );
    });
  };

  render() {
    const {
      theme: { fontColor, themeColor },
      onlyOne,
      isCold,
      isSupportColor,
      isSupportWhite,
      isSupportWhiteTemp,
      isSupportWhiteBright,
    } = this.props;
    const { size, colours, activeIdx } = this.state;
    const iconBgColor = color(fontColor).alpha(0.2).rgbString();
    const activeColour = colours[activeIdx] || colours[0];
    return (
      <View style={[styles.section, styles.section__colour]}>
        <TYText style={[styles.text, { color: fontColor, marginHorizontal: cx(16) }]}>
          {Strings.getDpLang(sceneValueCode, 'colour')}
        </TYText>
        <View style={styles.container}>
          <View style={styles.section__colourList} onLayout={this._handleLayout}>
            {this._renderColourRects()}
            {(!onlyOne || colours.length === 0) && (
              <Button
                accessibilityLabel="CustomScene_AddColor"
                style={[
                  styles.colour__adder,
                  {
                    marginBottom: 8,
                    opacity: colours.length === 8 ? 0.4 : 1,
                    marginLeft: colours.length % 6 === 0 ? 0 : cx(14),
                  },
                ]}
                size={cx(24)}
                icon={icons.add}
                iconColor={fontColor}
                useART={false}
                iconStyle={[styles.colour__adder, { backgroundColor: iconBgColor }]}
                onPress={this._handleAddColour}
              />
            )}
          </View>
          {activeIdx !== -1 && (
            <ColourEditor
              theme={{
                fontColor,
                themeColor,
              }}
              isCold={isCold}
              isSupportColor={isSupportColor}
              isSupportWhite={isSupportWhite}
              isSupportWhiteTemp={isSupportWhiteTemp}
              isSupportWhiteBright={isSupportWhiteBright}
              isColour={activeColour.isColour}
              hsb={activeColour.hsb}
              kelvin={activeColour.kelvin}
              whiteBrightness={activeColour.whiteBrightness}
              onChange={this._handleChangeColor}
              onDelete={this._handleDeleteColour}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},

  text: { fontSize: cx(14) },

  section: {
    marginTop: 24,
    backgroundColor: 'transparent',
  },

  section__colour: {
    justifyContent: 'center',
  },

  section__colourList: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 16,
    marginHorizontal: cx(16),
  },

  colourWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  colour__outer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(44),
    height: cx(44),
    borderRadius: cx(22),
    backgroundColor: 'rgba(255,255,255,.2)',
  },

  colour__outer_active: {
    backgroundColor: 'rgba(255,255,255,.8)',
  },

  colour__inner: {
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
  },
  innerSelected: {
    width: cx(12),
    height: cx(12),
    borderRadius: cx(6),
    backgroundColor: '#fff',
    position: 'absolute',
  },
  colour__adder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
  },
});
