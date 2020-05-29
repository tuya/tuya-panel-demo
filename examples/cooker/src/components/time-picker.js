/* eslint-disable indent */
/* eslint-disable max-len */
import PropTypes from 'prop-types';
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
import _ from 'lodash';

const { NumberUtils, CoreUtils, RatioUtils } = Utils;

const { convert } = RatioUtils;

const window = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export default class CountdownPickerView extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number, // 单位: 分钟
    onValueChange: PropTypes.func.isRequired, // 返回单位: 分钟
    max: PropTypes.number, // 单位: 分钟
    min: PropTypes.number, // 单位: 秒
    step: PropTypes.number, // 单位: 分钟
    onlyone: PropTypes.bool, // 只提供分钟显示
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    max: 360,
    min: 0,
    step: 1,
    value: 15,
    onlyone: false,
    onCancel: () => {},
  };

  constructor(props) {
    super(props);
    this.handleSwitchButton = this.handleSwitchButton.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
    this.handleValueChangeH = this.handleValueChangeH.bind(this);
    this.handleValueChangeM = this.handleValueChangeM.bind(this);

    const value = NumberUtils.inMaxMin(0, props.max, props.value);

    if (props.onlyone) {
      this.Hours = [];
      this.Minutes = NumberUtils.range(0, props.max, props.step);

      this.selectedH = 0;
      this.selectedM = parseInt(value, 10) / props.step;
    } else {
      this.selectedH = parseInt(value / 60, 10);
      this.selectedM = parseInt(value - this.selectedH * 60, 10);
      this.Hours = NumberUtils.range(0, parseInt(props.max / 60 + 1, 10));
      if (this.selectedH === _.last(this.Hours)) {
        if (this.props.max % 60 === 0) {
          this.Minutes = [0];
        } else {
          let init = 0;
          if (this.props.min < 60 && this.selectedH === 0) init = this.props.min;
          this.Minutes = NumberUtils.range(init, (this.props.max % 60) + 1, this.props.step);
        }
        if (this.selectedM > _.last(this.Minutes)) {
          this.selectedM = _.head(this.Minutes);
        }
        // this.Minutes = NumberUtils.range(0, 60, props.step);
      } else {
        let init = 0;
        if (this.props.max < 60 && this.selectedH === 0) init = this.props.min;
        this.Minutes = NumberUtils.range(init, 60, this.props.step);
      }
    }

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

  handleComplete() {
    if (this.props.onValueChange) {
      const value = this.state.disabled ? 0 : this.selectedH * 60 + this.selectedM;
      this.props.onValueChange(value);
    }
  }

  handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  handleValueChangeH(v) {
    this.selectedH = v;
    if (v === _.last(this.Hours)) {
      if (this.props.max % 60 === 0) {
        this.Minutes = [0];
      } else {
        let init = 0;
        if (this.props.min < 60 && this.selectedH === 0) init = this.props.min;
        this.Minutes = NumberUtils.range(init, (this.props.max % 60) + 1, this.props.step);
      }
      if (this.selectedM > _.last(this.Minutes)) {
        this.selectedM = _.head(this.Minutes);
      }
      // this.Minutes = NumberUtils.range(0, 60, props.step);
    } else {
      this.Minutes = NumberUtils.range(0, 60, this.props.step);
    }
    this.forceUpdate();
  }

  handleValueChangeM(v) {
    this.selectedM = v;
  }

  handleSwitchButton(v) {
    this.setState({ disabled: !v });
  }

  _renderTwoPicker = () => (
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
            selectedValue={this.selectedH}
            onValueChange={this.handleValueChangeH}
            itemStyle={styles.itemText}
            textSize={16}
            style={{
              width: window.width * (5 / 10),
              marginRight: isIOS ? 0 : 20,
              backgroundColor: 'transparent',
              // flex: 1,
              // height: 240,
            }}
          >
            {this.Hours.map(k => (
              <Picker.Item
                // textSize={40}
                key={k}
                label={CoreUtils.toFixed(k, 2)}
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
            text={Strings.t_hour}
          />
        </View>

        <View style={[styles.overview, { flex: 1 }]}>
          <Picker
            selectedValue={this.selectedM}
            onValueChange={this.handleValueChangeM}
            itemAlign="flex-start"
            itemStyle={styles.itemText}
            textSize={16}
            style={
              isIOS
                ? {
                    width: window.width * (8 / 10),
                    marginLeft: -(window.width * 2) / 10,
                    backgroundColor: 'transparent',
                  }
                : {
                    width: window.width * (7 / 10),
                    marginLeft: 20,
                    backgroundColor: 'transparent',
                  }
            }
          >
            {this.Minutes.map(k => (
              <Picker.Item
                // textSize={40}
                itemStyle={styles.itemText}
                key={k}
                label={CoreUtils.toFixed(k, 2)}
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
            text={Strings.t_minute}
          />
        </View>
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

  render() {
    return this._renderTwoPicker();
  }
}

const styles = StyleSheet.create({
  container: {
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
