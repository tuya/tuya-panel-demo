/* eslint-disable max-len */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { RatioUtils } = Utils;
export default class SegmentView extends Component {
  static propTypes = {
    onSwitchContent: PropTypes.func,
    style: PropTypes.any.isRequired,
    data: PropTypes.array,
  };

  static defaultProps = {
    onSwitchContent: () => {},
    data: [],
  };

  _renderButton = (data, index, isLast) => {
    const btnTitle = data.menuTitle;
    const { isSelected } = data;
    let fontColorStyle = { color: 'rgba(255,255,255,.8)' };
    if (isSelected) {
      fontColorStyle = { color: 'rgba(255,255,255,.8)' };
    }
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.props.onSwitchContent(data, index)}
        style={[styles.touchStyle]}
      >
        <Text style={fontColorStyle}>{btnTitle} </Text>
        {!isLast ? <View style={styles.sideLine} /> : null}
      </TouchableOpacity>
    );
  };

  render() {
    const { style, data } = this.props;

    return (
      <View style={[style, styles.container]}>
        {data.map((item, index) => this._renderButton(item, index, index === data.length - 1))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: RatioUtils.width,
    height: RatioUtils.convertY(22),
    marginBottom: RatioUtils.convertY(8),
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'row',
  },

  touchStyle: {
    flex: 1,
    position: 'relative',
    // backgroundColor: 'rgba(48,51,66,1)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sideLine: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'rgba(255,255,255, .3)',
    width: 1,
    height: 13,
  },
});
