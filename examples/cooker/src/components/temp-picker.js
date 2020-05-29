/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-multi-assign */
/* eslint-disable no-undef */
/* eslint-disable no-bitwise */
import PropTypes from 'prop-types';
import _ from 'lodash';
import React, { Component } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Animated,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Utils, Picker, TYText, I18N as Strings } from 'tuya-panel-kit';

const { NumberUtils, CoreUtils, RatioUtils } = Utils;
const { convert } = RatioUtils;
const window = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
export default class PluralPickerView extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number, // 单位: 分钟
    onValueChange: PropTypes.func.isRequired, // 返回单位: 分钟
    max: PropTypes.number, // 单位: 分钟
    min: PropTypes.number,
    step: PropTypes.number, // 单位: 分钟
    scale: PropTypes.number,
    onCancel: PropTypes.func,
  };
  static defaultProps = {
    max: 360,
    min: 0,
    step: 1,
    value: 15,
    scale: 0,
    onCancel: () => {},
  };
  constructor(props) {
    super(props);
    this.handleSwitchButton = this.handleSwitchButton.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
    const value = NumberUtils.inMaxMin(props.min, props.max, props.value);
    const scaleValue = NumberUtils.scaleNumber(props.scale, value);
    const steps = this.getStepsByValue(props.step, props.scale);
    [this.IntStep, this.FloatOneStep, this.FloatTwoStep] = steps;
    this.selectedInt = ~~+scaleValue; // '3.1415' -> 3
    if (Number.isInteger(+scaleValue)) {
      this.selectFloatOne = 0;
      this.selectFloatTwo = 0;
    } else {
      const numFixed = (+scaleValue).toFixed(2);
      const numArr = numFixed.split('.');
      this.selectFloatOne = Math.floor(+numArr[1] / 10);
      this.selectFloatTwo = +numArr[1] % 10;
    }
    const maxScale = +NumberUtils.scaleNumber(props.scale, props.max);
    const minScale = +NumberUtils.scaleNumber(props.scale, props.min);
    this.int = NumberUtils.range(
      Math.floor(minScale),
      this.IntStep === 1 ? Math.floor(maxScale) + this.IntStep : Math.floor(maxScale),
      this.IntStep
    );
    const fOneMaxRange =
      this.selectedInt === ~~maxScale && props.max % 100 !== 0
        ? parseInt(`${props.max}`[1], 10) + 1
        : 10;
    let fTwoMaxRange = 10;
    if (
      this.selectedInt === _.last(this.int) &&
      this.selectFloatOne === parseInt(`${props.max}`[1], 10)
    ) {
      fTwoMaxRange = parseInt(`${props.max}`[2], 10);
    }
    this.floatOnes = NumberUtils.range(0, fOneMaxRange, this.FloatOneStep);
    this.floatTwos = NumberUtils.range(0, fTwoMaxRange, this.FloatTwoStep);
    const dataSchema = [
      { key: this.int, val: this.selectedInt },
      { key: this.floatOnes, val: this.selectFloatOne },
      { key: this.floatTwos, val: this.selectFloatTwo },
    ];
    _.forEach(dataSchema, el => {
      const { key } = el;
      let { val } = el;
      if (val > _.last(key)) val = _.head(key);
    });
    this.state = {
      disabled: false,
      fadeAnim: new Animated.Value(0),
    };
  }
  componentDidMount() {
    this._animateOn();
  }
  componentWillUnmount() {
    this._animateOff();
  }
  onFloatOneChange = v => {
    const { max, scale } = this.props;
    const maxScale = +NumberUtils.scaleNumber(scale, max);
    if (v === _.last(this.int)) {
      // 24 === ~~24.00 true
      if (maxScale === ~~maxScale) {
        this.floatOnes = [0];
        this.floatTwos = [0];
      } else {
        this.floatOnes = NumberUtils.range(0, (maxScale * 10) % 10, this.FloatOneStep);
        const lastFloatOne =
          this.selectFloatOne === Math.floor((maxScale * 10) % 10)
            ? Math.floor((maxScale * 10) % 10)
            : 0;
        this.onFloatTwoChange(lastFloatOne);
      }
      if (this.selectFloatOne > _.last(this.floatOnes)) {
        this.selectFloatOne = _.head(this.floatOnes);
      }
    } else {
      this.formatRanges();
    }
  };
  onFloatTwoChange = v => {
    const { max, scale } = this.props;
    const maxScale = +NumberUtils.scaleNumber(scale, max);
    const lastFloatOne = Math.floor((maxScale * 10) % 10);
    const maxFloatTwo = Math.floor((maxScale * 100) % 10);
    if (this.selectedInt === _.last(this.int) && v === lastFloatOne) {
      if (maxFloatTwo === 0) {
        this.floatTwos = [0];
      } else {
        this.floatTwos = NumberUtils.range(0, maxFloatTwo + this.FloatTwoStep, this.FloatTwoStep);
      }
      if (this.selectFloatTwo > _.last(this.floatTwos)) {
        this.selectFloatTwo = _.head(this.floatTwos);
      }
    } else {
      this.formatRanges(this.props, false);
    }
  };
  getStepsByValue = (step = 1, scale = 0) => {
    const st = Number(step);
    const num = 1;
    let int = (fOne = fTwo = num);
    switch (scale) {
      case 0:
        int = st;
        break;
      case 1:
        int = st >= 10 ? parseInt(st / 10, 10) : int;
        fOne = st % 10;
        break;
      case 2:
        int = st >= 100 ? parseInt(st / 100, 10) : int;
        fOne = st >= 10 ? `${st}`.split('').reverse()[1] : fOne;
        fTwo = st % 10;
        break;
      default:
        break;
    }
    const res = [int, fOne, fTwo].map(d => (d < 1 ? 1 : +d));
    return res;
  };
  formatRanges = (p, showBoth = true) => {
    const props = p || this.props;
    const steps = this.getStepsByValue(props.step, props.scale);
    [this.IntStep, this.FloatOneStep, this.FloatTwoStep] = steps;
    const maxScale = NumberUtils.scaleNumber(props.scale, props.max);
    const fOneMaxRange =
      this.selectedInt === ~~maxScale && props.max % 100 !== 0
        ? parseInt(`${props.max}`[1], 10) + 1
        : 10;
    let fTwoMaxRange = 10;
    if (
      this.selectedInt === _.last(this.int) &&
      this.selectFloatOne === parseInt(`${props.max}`[1], 10)
    ) {
      fTwoMaxRange = parseInt(`${props.max}`[2], 10);
    }
    if (showBoth) {
      this.floatOnes = NumberUtils.range(0, fOneMaxRange, this.FloatOneStep);
      this.floatTwos = NumberUtils.range(0, fTwoMaxRange, this.FloatTwoStep);
    } else {
      this.floatTwos = NumberUtils.range(0, fTwoMaxRange, this.FloatTwoStep);
    }
  };
  handleComplete() {
    if (this.props.onValueChange) {
      const response = +`${this.selectedInt}.${this.selectFloatOne}${this.selectFloatTwo}`;
      this.props.onValueChange(response);
    }
  }
  handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };
  handleValueChangeInt = v => {
    this.selectedInt = v;
    this.onFloatOneChange(v);
    this.forceUpdate();
  };
  handleValueChangeFloatOne = v => {
    this.selectFloatOne = v;
    this.onFloatTwoChange(v);
    this.forceUpdate();
  };
  handleValueChangeFloatTwo = v => {
    this.selectFloatTwo = v;
  };
  handleSwitchButton(v) {
    this.setState({ disabled: !v });
  }
  _animateOn = () => {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 300,
    }).start();
    LayoutAnimation.easeInEaseOut();
  };
  _animateOff = () => {
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 100,
    }).start();
  };
  _renderOnePicker() {
    return (
      <View style={[styles.container, { backgroundColor: 'red' }]}>
        <View style={styles.itemContainer}>
          <TYText style={styles.title}>{this.props.name}</TYText>
        </View>
        <View
          style={[styles.content, this.state.disabled && { opacity: 0.6 }]}
          pointerEvents={this.state.disabled ? 'none' : 'auto'}
        >
          <View style={[styles.overview, { flex: 1 }]}>
            <Picker
              selectedValue={this.selectedInt}
              onValueChange={this.handleValueChangeInt}
              style={{ width: window.width, height: 200 }}
            >
              {this.int.map(k => (
                <Picker.Item key={k} label={`${k}`} value={k} />
              ))}
            </Picker>
            <TYText
              style={[
                styles.label,
                {
                  marginLeft: -(window.width / 2) + 20,
                },
              ]}
              pointerEvents="none"
              text={Strings.t_minute}
            />
          </View>
        </View>
        <TouchableWithoutFeedback onPress={this.handleComplete}>
          <View style={[styles.itemContainer, styles.completeContainer]}>
            <TYText style={styles.completeText}>{Strings.confirm}</TYText>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
  _renderTwoPicker = () => {
    const { scale } = this.props;
    const marginLeft = scale > 1 ? convert(40) : 0;
    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: this.state.fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.itemContainer]}>
          <TYText style={styles.title}>{this.props.name}</TYText>
        </View>
        <View
          style={[
            styles.content,
            {
              backgroundColor: '#fff',
            },
            this.state.disabled && { opacity: 0.6 },
          ]}
          pointerEvents={this.state.disabled ? 'none' : 'auto'}
        >
          <View
            style={[
              styles.overview,
              {
                flex: 1.1,
                height: 240,
              },
            ]}
          >
            <Picker
              selectedValue={this.selectedInt}
              onValueChange={this.handleValueChangeInt}
              itemStyle={styles.itemText}
              textSize={16}
              style={{
                width: window.width * (5 / 10) - marginLeft,
                marginRight: isIOS ? 0 : 20,
                backgroundColor: 'transparent',
                // flex: 1,
                // height: 200,
              }}
            >
              {this.int.map(k => (
                <Picker.Item
                  // textSize={40}
                  key={k}
                  label={`${k}`}
                  value={k}
                />
              ))}
            </Picker>
            <TYText
              style={[
                styles.label,
                {
                  marginLeft: -(window.width * (4 / 10 / 2)) + (isIOS ? 15 : 0),
                },
              ]}
              pointerEvents="none"
              text={Strings.getLang('integer')}
            />
          </View>
          {scale >= 1 && (
            <View style={[styles.overview, { flex: 1 }]}>
              <Picker
                selectedValue={this.selectFloatOne}
                onValueChange={this.handleValueChangeFloatOne}
                itemAlign="flex-start"
                itemStyle={styles.itemText}
                textSize={16}
                style={
                  isIOS
                    ? {
                        width: window.width * (8 / 10) - marginLeft,
                        marginLeft: -(window.width * 2) / 10,
                        backgroundColor: 'transparent',
                        // flex: 1,
                        // height: 240,
                      }
                    : {
                        width: window.width * (7 / 10) - marginLeft,
                        marginLeft: 30,
                        backgroundColor: 'transparent',
                        // flex: 1,
                        // height: 240,
                      }
                }
              >
                {this.floatOnes.map(k => (
                  <Picker.Item
                    // textSize={40}
                    itemStyle={styles.itemText}
                    key={k}
                    label={CoreUtils.toFixed(k, 1)}
                    value={k}
                  />
                ))}
              </Picker>
              <TYText
                style={[
                  styles.label,
                  {
                    marginLeft: isIOS
                      ? -(window.width * (7 / 10 / 2)) + 15
                      : -(window.width * (6 / 10)) + 28,
                    // left: isIOS ? (-(window.width * (4 / 10 / 2)) + 10) : (-(window.width * (3 / 10)) + 20),
                  },
                ]}
                pointerEvents="none"
                text={Strings.getLang('tenUnit')}
              />
            </View>
          )}
          {scale >= 2 && (
            <View style={[styles.overview, { flex: 1 }]}>
              <Picker
                selectedValue={this.selectFloatTwo}
                onValueChange={this.handleValueChangeFloatTwo}
                itemAlign="flex-start"
                itemStyle={styles.itemText}
                textSize={16}
                style={
                  isIOS
                    ? {
                        width: window.width * (8 / 10) - marginLeft,
                        marginLeft: -(window.width * 2) / 10,
                        backgroundColor: 'transparent',
                        // flex: 1,
                        // height: 240,
                      }
                    : {
                        width: window.width * (7 / 10) - marginLeft,
                        marginLeft: 20,
                        backgroundColor: 'transparent',
                        // flex: 1,
                        // height: 240,
                      }
                }
              >
                {this.floatTwos.map(k => (
                  <Picker.Item
                    // textSize={40}
                    itemStyle={styles.itemText}
                    key={k}
                    label={CoreUtils.toFixed(k, 1)}
                    value={k}
                  />
                ))}
              </Picker>
              <TYText
                style={[
                  styles.label,
                  {
                    marginLeft: isIOS
                      ? -(window.width * (7 / 10 / 2)) + 15
                      : -(window.width * (6 / 10)) + 28,
                    // left: isIOS ? (-(window.width * (4 / 10 / 2)) + 10) : (-(window.width * (3 / 10)) + 20),
                  },
                ]}
                pointerEvents="none"
                text={Strings.getLang('hundredUnit')}
              />
            </View>
          )}
        </View>
        <View style={[styles.itemContainer, styles.completeContainer]}>
          <TouchableWithoutFeedback onPress={this.handleCancel}>
            <TYText style={styles.completeText}>{Strings.cancel}</TYText>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.handleComplete}>
            <TYText style={styles.completeText}>{Strings.confirm}</TYText>
          </TouchableWithoutFeedback>
        </View>
      </Animated.View>
    );
  };
  render() {
    return this._renderTwoPicker();
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  itemContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  completeContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginBottom: StyleSheet.hairlineWidth,
    borderTopWidth: convert(8),
    borderTopColor: '#DBDBDB',
  },
  label: {
    backgroundColor: 'transparent',
    color: '#22242C',
    fontSize: convert(15),
  },
  title: {
    color: '#9B9B9B',
    fontSize: convert(14),
  },
  completeText: {
    flex: 1,
    textAlign: 'center',
    color: '#303030',
    fontSize: 15,
  },
  overview: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 1,
  },
  itemText: {
    fontSize: convert(16),
    fontWeight: 'bold',
    color: '#22242C',
    // letterSpacing: 48
  },
});
