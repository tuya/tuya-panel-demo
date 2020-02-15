import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { updateSwitchNameAsync } from '../redux/modules/switchState';
import Strings from '../i18n';

const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

const { convertX: cx } = Utils.RatioUtils;

class SwitchItem extends Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    name: PropTypes.string,
    value: PropTypes.bool,
    textStyle: TYText.propTypes.style,
    source: PropTypes.number,
    updateSwitchNameAsync: PropTypes.func.isRequired,
  };

  static defaultProps = {
    value: false,
    name: '',
    textStyle: null,
    source: null,
  };

  _handlePress = () => {
    const { code, value } = this.props;
    TYDevice.putDeviceData({ [code]: !value });
  };

  _handleLongPress = () => {
    const { code, name } = this.props;
    TYNative.showEditDialog(
      Strings.getLang('edit'),
      name,
      value => {
        const newName = value.trim().substr(0, 10);
        if (newName) {
          this.props.updateSwitchNameAsync(code, newName);
          return;
        }
        TYNative.simpleTipDialog(Strings.getLang('emptyTip'), () => {});
      },
      () => {}
    );
  };

  render() {
    const { textStyle, name, source } = this.props;
    return (
      <TouchableOpacity
        style={styles.switch}
        activeOpacity={0.8}
        onPress={this._handlePress}
        onLongPress={this._handleLongPress}
      >
        <Image source={source} />
        <TYText style={[styles.text, textStyle]}>{name}</TYText>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  switch: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    backgroundColor: 'transparent',
    fontSize: cx(12),
    textAlign: 'center',
    color: '#333',
  },
});

const Res = {
  switchOn: require('../res/switch_on.png'),
  switchOff: require('../res/switch_off.png'),
};

export default connect(
  ({ dpState, switchState }, { code }) => {
    const value = dpState[code];
    return {
      name: _.get(switchState, `switches[${code}].name`) || Strings.getDpLang(code),
      value,
      source: value ? Res.switchOn : Res.switchOff,
      textStyle: { color: value ? '#333' : 'rgba(51, 51, 51, 0.5)' },
    };
  },
  dispatch =>
    bindActionCreators(
      {
        updateSwitchNameAsync,
      },
      dispatch
    )
)(SwitchItem);
