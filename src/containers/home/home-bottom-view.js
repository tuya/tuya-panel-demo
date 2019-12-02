import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, ControllerBar } from 'tuya-panel-kit';
import Strings from '../../i18n';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const Res = {
  schedule: require('../../res/schedule.png'),
  setting: require('../../res/setting.png'),
};

export default class HomeBottomView extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  };

  get datas() {
    const commonProps = {
      activeOpacity: 0.8,
      textStyle: styles.text,
    };
    return [
      {
        key: 'schedule',
        text: Strings.getLang('schedule'),
        image: Res.schedule,
        onPress: this._handleSchedulePress,
      },
      {
        key: 'setting',
        text: Strings.getLang('setting'),
        image: Res.setting,
        onPress: this._handleSettingPress,
      },
    ].map(data => ({
      ...commonProps,
      ...data,
    }));
  }

  _handleSchedulePress = () => {
    this.props.navigator.push({
      id: 'schedule',
      title: Strings.getLang('schedule'),
    });
  };

  _handleSettingPress = () => {
    this.props.navigator.push({
      id: 'setting',
      title: Strings.getLang('setting'),
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <ControllerBar
          style={styles.controllerBar}
          size={cx(40)}
          button={this.datas}
          backgroundColor="transparent"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  text: {
    marginTop: cy(6),
    color: '#333',
  },
});
