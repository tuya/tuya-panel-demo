import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ViewPropTypes, View, Text, StyleSheet } from 'react-native';

import StringView from './stringView';

const Strings = require('../i18n');

export default class BitView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    value: PropTypes.number.isRequired,
    values: PropTypes.object.isRequired,
    label: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    readonly: PropTypes.bool,
  };

  static defaultProps = {
    style: null,
    onChange: null,
    readonly: true,
  };

  constructor(props) {
    super(props);
    this.onChangeHandle = this.onChangeHandle.bind(this);

    this.strValues = this.parseStrValues(props.values);

    const value = this.parseLable(props.value, props.label);
    this.state = {
      text: value,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.strValues = this.parseStrValues(nextProps.values);
    const value = this.parseLable(nextProps.value, nextProps.label);
    this.setState({ text: value });
  }

  onChangeHandle(value) {
    if (this.props.onChange) {
      this.props.onChange(parseInt(value, 10));
    }
  }

  parseStrValues(values) {
    const strValues = {};
    Object.keys(values).forEach(k => {
      strValues[k] = Strings[values[k]] ? Strings[values[k]] : values[k];
    });
    return strValues;
  }

  parseLable(v, l) {
    const strs = [];
    for (let i = 0; i < l.length; i++) {
      // eslint-disable-next-line
      const vv = 1 << i;
      // eslint-disable-next-line
      if ((vv & v) !== 0) {
        strs.push(`${i + 1}> ${l[i]} : ${this.strValues[l[i]]}`);
      }
    }
    return strs.join('\n');
  }

  render() {
    const strText = this.props.value > 0 ? this.state.text : 'No error!';
    const height = this.props.value > 0 || !this.props.readonly ? null : 35;
    return (
      <View style={[styles.container, this.props.style, { flexDirection: 'column', height }]}>
        <Text style={[styles.textInput]}>{strText}</Text>
        {!this.props.readonly && (
          <StringView
            readonly={false}
            value={`${this.props.value}`}
            onChange={this.onChangeHandle}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 150,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 4,
    opacity: 0.5,
  },

  textInput: {
    flex: 1,
    margin: 1,
    fontSize: 10,
    lineHeight: 16,
    color: '#303030',
  },
});
