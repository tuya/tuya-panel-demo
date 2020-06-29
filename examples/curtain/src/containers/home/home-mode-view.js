import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Utils, Popup } from 'tuya-panel-kit';
import ArrowText from '../../components/arrow-text';
import Strings from '../../i18n';
import TYNative from '../../api';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

class HomeModeView extends Component {
  static propTypes = {
    dpCodes: PropTypes.object.isRequired,
    mode: PropTypes.string,
    schema: PropTypes.object.isRequired,
  };

  static defaultProps = {
    mode: '',
  };

  get dpCodes() {
    const { mode: modeCode, control: controlCode } = this.props.dpCodes;
    return {
      modeCode,
      controlCode,
    };
  }

  handleModePress = () => {
    const { mode, schema } = this.props;
    const modeSchema = schema[this.dpCodes.modeCode];
    if (!modeSchema) return;
    const { range } = modeSchema;
    Popup.list({
      dataSource: range.map(r => ({
        key: r,
        value: r,
        title: Strings.getDpLang(this.dpCodes.modeCode, r),
      })),
      title: Strings.getDpLang(this.dpCodes.modeCode),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      value: mode,
      onConfirm: value => {
        TYNative.putDeviceData({
          [this.dpCodes.modeCode]: value,
        });
        Popup.close();
      },
    });
  };

  _renderModeView = () => {
    const { mode } = this.props;

    return (
      <TouchableOpacity
        onPress={this.handleModePress}
        accessibilityLabel={`HomeModeScene_Mode_${mode}`}
        style={[styles.defaultContainer, styles.container]}
      >
        <ArrowText
          containerStyle={[styles.background]}
          text={Strings.getDpLang(this.dpCodes.modeCode, mode)}
        />
      </TouchableOpacity>
    );
  };

  render() {
    return this.dpCodes.modeCode ? this._renderModeView() : <View />;
  }
}

const styles = StyleSheet.create({
  container: {
    height: cx(38),
    marginVertical: cy(30),
    backgroundColor: 'transparent',
    borderRadius: cx(7),
    alignItems: 'center',
    justifyContent: 'center',
  },

  background: {
    height: cx(38),
    borderRadius: cy(100),
    paddingHorizontal: cx(16),
  },

  defaultContainer: {
    height: cx(38),
    marginVertical: cy(30),
    backgroundColor: 'transparent',
    borderRadius: cx(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(({ dpState, dpCodes, devInfo }) => ({
  mode: dpState[dpCodes.mode],
  schema: devInfo.schema || {},
  dpCodes,
}))(HomeModeView);
