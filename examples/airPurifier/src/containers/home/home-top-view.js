import _get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { TYSdk, Utils, IconFont } from 'tuya-panel-kit';
import Strings from '../../i18n';
import dpCodes from '../../config/dpCodes';
import { updateOutdoorState } from '../../redux/actions';
import { getFaultString } from '../../utils';
import icons from '../../res/iconfont.json';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const { power: powerCode, mode: modeCode, fault: faultCode } = dpCodes;

class HomeTopView extends Component {
  static propTypes = {
    power: PropTypes.bool,
    mode: PropTypes.string,
    fault: PropTypes.number,
    outdoorState: PropTypes.object.isRequired,
  };

  static defaultProps = {
    power: false,
    mode: '1',
    fault: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      showFaultTip: true,
    };
  }

  async componentDidMount() {
    try {
      const data = await TYSdk.getWeatherQuality();
      if (Object.keys(data).length > 0) {
        const outdoorState = {
          temp: data['weather.now.temperature'] || '--',
          cityName: data['city.name'] || '--',
          condTxt: data['weather.now.condTxt'] || '--',
          pm25: data['weather.air.pm25'] || '--',
          quality: data['weather.air.quality'] || '--',
        };
        updateOutdoorState({ outdoorState });
      }
    } catch (err) {
      console.warn(err);
    }
  }

  _handleCloseFaultTip = () => {
    this.setState({ showFaultTip: false });
  };

  render() {
    const { power, mode, fault, outdoorState } = this.props;
    const isShowQuality = outdoorState.quality !== '--';
    return (
      <View style={styles.container}>
        {modeCode && (
          <View
            style={[
              styles.section__mode,
              {
                opacity: power ? 1 : 0,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
          >
            <Text accessibilityLabel="HomeScene_TopView_Mode" style={styles.text}>
              {Strings.getDpLang('mode', mode)}
            </Text>
          </View>
        )}

        <View style={styles.section__quality}>
          <View style={styles.quality__left}>
            <Text
              accessibilityLabel="HomeScene_TopView_Temp"
              style={[styles.text, styles.text__big]}
            >
              {`${outdoorState.temp}℃`}
            </Text>
            <Text accessibilityLabel="HomeScene_TopView_CityCondition" style={styles.text}>
              {`${outdoorState.cityName} / ${outdoorState.condTxt}`}
            </Text>
          </View>
          {isShowQuality && (
            <View style={[styles.quality__right, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Text accessibilityLabel="HomeScene_TopView_Quality" style={styles.text}>
                {`${outdoorState.quality}`}
              </Text>
            </View>
          )}
        </View>
        {faultCode && fault && this.state.showFaultTip ? (
          <View style={styles.section__fault}>
            <IconFont d={icons.alarm} size={cx(28)} fill="#fff" stroke="#fff" />
            <Text style={[styles.text, { flex: 1, marginLeft: 6 }]} numberOfLines={1}>
              {getFaultString(faultCode, fault)}
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={this._handleCloseFaultTip}>
              <IconFont d={icons.close} size={cx(28)} fill="#fff" stroke="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: cy(8),
  },

  section__mode: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: cx(16),
    paddingVertical: cy(6),
    borderRadius: cy(15),
  },

  section__quality: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: cy(11),
  },

  section__fault: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: cy(36),
    paddingHorizontal: cx(18),
    backgroundColor: '#FF813E',
  },

  quality__left: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  quality__right: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: cx(6),
    paddingHorizontal: cx(6),
  },
  text: {
    fontSize: cx(14),
    color: '#fff',
  },

  text__big: {
    fontSize: cx(18),
    marginRight: cx(6),
  },
});

export default connect(({ dpState, outState }) => {
  const { outdoorState } = outState;
  return {
    power: dpState[powerCode],
    mode: dpState[modeCode],
    fault: dpState[faultCode],
    outdoorState,
  };
})(HomeTopView);
