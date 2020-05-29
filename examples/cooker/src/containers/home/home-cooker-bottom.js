/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { wrapSettingHoc } from '../../components/recipe';
import HomeCookerSetting from './home-cooker-setting';
import Config from '../../config';
import Strings from '../../i18n';
import TYSdk from '../../api';

const Setting = wrapSettingHoc(HomeCookerSetting);
const { convertX: cx, width } = Utils.RatioUtils;
class HomeCookerBottom extends Component {
  static propTypes = {
    status: PropTypes.string,
  };

  static defaultProps = {
    status: 'standby',
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  get codes() {
    const {
      start: startCode,
      status: statusCode,
      cookTime: cTimeCode,
      appointmentTime: aTimeCode,
      remainTime: rTimeCode,
    } = Config.codes;
    return { startCode, statusCode, cTimeCode, aTimeCode, rTimeCode };
  }

  endWorkStatus = () => {
    if (!this.codes.startCode) return;
    TYSdk.device.putDeviceData({ [this.codes.startCode]: false });
  };

  renderStartView = () => {
    if (!this.codes.startCode) return;
    const { status } = this.props;
    return (
      <TouchableOpacity onPress={this.endWorkStatus}>
        <View style={styles.startContainer}>
          <TYText style={styles.startText}>{Strings.getLang(`end_${status}`)}</TYText>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { cookerBottomDps } = Config.dpFun;
    return (
      <View style={styles.container}>
        <Setting iconHasWrap={false} dpCodes={cookerBottomDps} />
        {this.renderStartView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width,
    height: cx(250),
    padding: cx(16),
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  startContainer: {
    width: cx(343),
    height: cx(48),
    borderRadius: cx(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  startText: {
    fontSize: cx(16),
    color: '#333',
    backgroundColor: 'transparent',
  },
});

export default connect(({ dpState }) => ({
  status: dpState[Config.codes.statusCode],
  rTime: dpState[Config.codes.rTimeCode],
  aTime: dpState[Config.codes.aTimeCode],
  cTime: dpState[Config.codes.cTimeCode],
  start: dpState[Config.codes.startCode],
}))(HomeCookerBottom);
