import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native';
import { Utils, ControllerBar } from 'tuya-panel-kit';
import { getEleIcon } from '../../utils';
import Strings from '../../i18n';
import Res from '../../res';

const { width, convertX: cx } = Utils.RatioUtils;

class HomeTopView extends Component {
  static propTypes = {
    childLock: PropTypes.bool,
    reverseLock: PropTypes.bool,
    saveTime: PropTypes.number,
    batteryState: PropTypes.string,
  };

  static defaultProps = {
    childLock: true,
    reverseLock: false,
    saveTime: 0,
    batteryState: 'high',
  };

  constructor(props) {
    super(props);
  }

  getData() {
    const { childLock, reverseLock, batteryState } = this.props;
    const commonProps = {
      textStyle: { fontSize: 12 },
      size: cx(32),
    };
    return [
      {
        key: 'reverseLock',
        text: Strings.getDpLang('reverse_lock', reverseLock),
        image: reverseLock ? Res.locked : Res.lockActive,
        imageColor: '#333',
      },
      {
        key: 'childLock',
        text: Strings.getDpLang('child_lock', childLock),
        image: childLock ? Res.childLock : Res.childActive,
        imageColor: '#333',
      },
      {
        key: 'bat',
        text: Strings.getDpLang('battery_state', batteryState),
        image: getEleIcon(batteryState),
      },
    ].map(data => ({
      ...commonProps,
      ...data,
    }));
  }

  renderCenter = () => {
    const bgImg = Res.iconBg;
    const lockImg = Res.lock;
    return (
      <View style={styles.center}>
        <View style={styles.centerImage}>
          <ImageBackground source={bgImg} style={styles.bg}>
            <Image style={{ width: 160, height: 160 }} source={lockImg} />
          </ImageBackground>
        </View>
      </View>
    );
  };

  render() {
    const { saveTime } = this.props;
    const data = this.getData().filter(({ key }) => !!key);
    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.saveTime}>
            <Image source={Res.save} style={{ tintColor: '#70CF98' }} />
            <Text style={{ color: '#333', fontSize: 12, marginLeft: 3 }}>
              {Strings.formatValue('saveTime', saveTime)}
            </Text>
          </View>
        </View>
        {this.renderCenter()}
        {/* 状态显示栏 */}
        <ControllerBar style={styles.controllerBar} button={data} backgroundColor="transparent" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  saveTime: {
    height: 28,
    width,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerImage: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  controllerBar: {
    // height: 72,
    width,
    backgroundColor: 'transparent',
  },
  bg: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(({ dpState, saveTime }) => ({
  closed_opened: dpState.closed_opened,
  childLock: dpState.child_lock,
  reverseLock: dpState.reverse_lock,
  batteryState: dpState.battery_state,
  remoteUnlockReqTime: dpState.unlock_request,
  saveTime,
}))(HomeTopView);
