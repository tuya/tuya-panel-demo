import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Image, Text, TouchableOpacity, StyleSheet, View, ViewPropTypes } from 'react-native';

const Res = {
  decrease: require('../res/tuya_decrease.png'),
  increase: require('../res/tuya_increase.png'),
};

export default class ValueView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    value: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    step: PropTypes.number,
    readonly: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    style: null,
    onChange: null,
    readonly: false,
    max: 100,
    min: 0,
    step: 1,
    value: 100,
  };

  constructor(props) {
    super(props);

    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
  }

  increment() {
    if (this.props.readonly) return;
    const { value, max, min, step } = this.props;
    const v = Math.min(max, Math.max(min, value + step));
    if (this.props.onChange) {
      this.props.onChange(v);
    }
  }

  decrement() {
    if (this.props.readonly) return;
    const { value, max, min, step } = this.props;
    const v = Math.min(max, Math.max(min, value - step));
    if (this.props.onChange) {
      this.props.onChange(v);
    }
  }

  render() {
    const { style, value, readonly } = this.props;
    return (
      <View style={[styles.container, style, readonly ? { opacity: 0.5 } : null]}>
        <TouchableOpacity
          onPress={this.decrement}
          activeOpacity={0.8}
          style={[styles.iconStyle, { paddingRight: 20 }]}
        >
          <Image source={Res.decrease} />
        </TouchableOpacity>
        <View style={styles.line} />
        <Text style={styles.valueStyle}>{value}</Text>
        <View style={styles.line} />
        <TouchableOpacity
          onPress={this.increment}
          activeOpacity={0.8}
          style={[styles.iconStyle, { paddingLeft: 20 }]}
        >
          <Image source={Res.increase} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },

  line: {
    backgroundColor: '#DDDDDD',
    width: 1,
    height: 36,
  },

  iconStyle: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  valueStyle: {
    flex: 1,
    color: '#303030',
    fontSize: 18,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
});
