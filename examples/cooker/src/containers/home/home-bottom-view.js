/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line max-len
import { View, StyleSheet, ImageBackground, TouchableOpacity, Image, Animated } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Config from '../../config';
import Strings from '../../i18n';

const { convertX: cx, width } = Utils.RatioUtils;
const Res = {
  startBtn: require('../../res/startBtn.png'),
  bottom: require('../../res/bottom.png'),
  powerIcon: require('../../res/powerIcon.png'),
  powerWrap: require('../../res/powerWrap.png'),
  startWrap: require('../../res/startWrap.png'),
  appointmentIcon: require('../../res/appointment.png'),
  appointmentWrap: require('../../res/shadow_circle.png'),
};

export default class HomeBottomView extends Component {
  static propTypes = {
    power: PropTypes.bool,
    setPowerState: PropTypes.func,
    setStartState: PropTypes.func,
    handleAppointmentPress: PropTypes.func,
    isHidden: PropTypes.bool,
  };

  static defaultProps = {
    power: false,
    setPowerState: () => {},
    setStartState: () => {},
    handleAppointmentPress: () => {},
    isHidden: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      animatedValue: new Animated.Value(props.isHidden ? 0 : 1),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isHidden !== nextProps.isHidden) {
      Animated.spring(this.state.animatedValue, {
        toValue: nextProps.isHidden ? 0 : 1,
        duration: 300,
      }).start();
    }
  }

  get codes() {
    const {
      start: startCode,
      appointmentTime: aTimeCode,
      power: oldPowerCode,
      switch: newPowerCode,
    } = Config.codes;
    const powerCode = oldPowerCode || newPowerCode;
    return { startCode, aTimeCode, powerCode };
  }

  renderPowerView = () => {
    if (!this.codes.powerCode) return;
    const { setPowerState } = this.props;
    const { powerColor, themeColor } = Config.themeData;
    return (
      <TouchableOpacity onPress={setPowerState}>
        <ImageBackground
          source={Res.powerWrap}
          imageStyle={{ tintColor: powerColor }}
          style={styles.powerWrap}
          resizeMode="contain"
        >
          <Image source={Res.powerIcon} style={{ tintColor: themeColor }} />
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  renderStartView = () => {
    if (!this.codes.startCode) return;
    const { power, setStartState } = this.props;
    const { themeColor } = Config.themeData;
    return (
      <TouchableOpacity onPress={setStartState} activeOpacity={power ? 0.6 : 1}>
        <View
          style={[
            styles.startWrap,
            { opacity: power ? 1 : 0.3, backgroundColor: themeColor },
            this.codes.aTimeCode && { width: cx(144) },
          ]}
        >
          <Image
            source={Res.startBtn}
            style={{
              marginRight: this.codes.aTimeCode ? cx(17) : cx(30),
            }}
          />
          <TYText style={styles.textStyle} text={Strings.getDpLang(this.codes.startCode)} />
        </View>
      </TouchableOpacity>
    );
  };

  renderAppointmentView = () => {
    if (!this.codes.aTimeCode) return;
    const { power, handleAppointmentPress } = this.props;
    const { themeColor } = Config.themeData;
    return (
      <TouchableOpacity onPress={handleAppointmentPress} activeOpacity={power ? 0.6 : 1}>
        <View style={[{ opacity: power ? 1 : 0.3 }, styles.appointmentContainer]}>
          <ImageBackground
            source={Res.appointmentWrap}
            imageStyle={{ tintColor: themeColor }}
            style={styles.appointmentWrap}
            resizeMode="contain"
          >
            <Image source={Res.appointmentIcon} style={styles.appointmentIcon} />
          </ImageBackground>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: this.state.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ImageBackground
          source={Res.bottom}
          style={[styles.controllerBar, this.codes.aTimeCode && { paddingRight: cx(0) }]}
        >
          {this.renderPowerView()}
          {this.renderStartView()}
          {this.renderAppointmentView()}
        </ImageBackground>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width,
    height: cx(80),
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
  },

  controllerBar: {
    width,
    height: cx(80),
    justifyContent: 'space-between',
    paddingLeft: cx(23),
    paddingRight: cx(32),
    paddingTop: cx(8),
    alignItems: 'center',
    flexDirection: 'row',
  },

  powerWrap: {
    width: cx(96),
    height: cx(48),
    alignItems: 'center',
    justifyContent: 'center',
  },

  startWrap: {
    width: cx(191),
    height: cx(48),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: cx(25),
    paddingRight: cx(36),
    borderRadius: cx(24),
  },

  textStyle: {
    color: '#fff',
    fontSize: cx(16),
    backgroundColor: 'transparent',
  },

  appointmentWrap: {
    width: cx(84),
    height: cx(84),
    alignItems: 'center',
    justifyContent: 'center',
  },

  appointmentContainer: {
    width: cx(84),
    height: cx(84),
    marginRight: cx(10),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  appointmentIcon: {
    width: cx(19.43),
    height: cx(19.43),
    resizeMode: 'contain',
  },
});
