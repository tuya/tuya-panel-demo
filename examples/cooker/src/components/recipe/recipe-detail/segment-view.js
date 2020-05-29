/* eslint-disable max-len */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { RatioUtils } = Utils;
const { convertX: cx, convertY: cy } = RatioUtils;

export default class SegmentView extends Component {
  static propTypes = {
    onSwitchContent: PropTypes.func,
    style: PropTypes.any,
    data: PropTypes.array,
  };

  static defaultProps = {
    onSwitchContent: () => {},
    style: null,
    data: [],
  };

  constructor(props) {
    super(props);
    this._renderButton = this._renderButton.bind(this);
  }

  _renderButton(data, index, isLast) {
    const btnTitle = data.menuTitle;
    const { isSelected } = data;
    let fontColorStyle = { color: '#4A4A4A' };
    if (isSelected) {
      fontColorStyle = { color: '#4A4A4A' };
    }
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.props.onSwitchContent(data, index)}
        style={[styles.touchStyle]}
      >
        <Text style={fontColorStyle}>{btnTitle} </Text>
        {!isLast ? <View style={styles.sideLine} /> : null}
        {isSelected && <View style={styles.underLine} />}
      </TouchableOpacity>
    );
  }

  render() {
    const { style, data } = this.props;
    return (
      <View style={[style, styles.container]}>
        <ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}>
          {data.map((item, index) => this._renderButton(item, index, index === data.length - 1))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: RatioUtils.width,
    height: cy(40),
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  touchStyle: {
    marginHorizontal: cx(16),
    position: 'relative',
    height: cy(28),
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

  underLine: {
    position: 'absolute',
    bottom: 0,
    height: cy(2),
    alignSelf: 'center',
    width: '80%',
    backgroundColor: '#FFA933',
  },
});
