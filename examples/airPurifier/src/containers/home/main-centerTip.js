import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Utils } from 'tuya-panel-kit';
import Strings from '../../i18n';
import dpCodes from '../../config/dpCodes';
import { store } from '../../redux/configureStore';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const { scaleNumber } = Utils.NumberUtils;

const {
  power: powerCode,
  pm25: pm25Code,
  airQuality: airQualityCode,
  filter: filterCode,
} = dpCodes;

class MainCenterTip extends Component {
  static propTypes = {
    power: PropTypes.bool,
    pm25: PropTypes.number,
    airQuality: PropTypes.string,
    filter: PropTypes.number,
  };

  static defaultProps = {
    power: false,
    pm25: 0,
    airQuality: '1',
    filter: 0,
  };

  getPM25Value() {
    const { pm25 } = this.props;
    const { devInfo = {} } = store.getState();
    const { scale = 0 } = devInfo.schema[pm25Code];
    return scaleNumber(scale, pm25);
  }

  calFontSize(str) {
    const len = typeof str === 'number' ? `${str}`.length : str.length;
    return len > 4 ? cx(Math.max(32, 64 - (len - 4) * 7)) : cx(64);
  }

  render() {
    const { power, airQuality, filter } = this.props;
    if (!power) {
      return (
        <View style={styles.container}>
          <Text style={[styles.text, styles.text__title, { fontSize: cx(32) }]}>
            {Strings.getLang('powerOffTip')}
          </Text>
        </View>
      );
    }
    const centerText = pm25Code
      ? this.getPM25Value()
      : Strings.getDpLang(airQualityCode, airQuality);
    return (
      <View style={styles.container}>
        {(pm25Code || airQualityCode) && (
          <Text style={styles.text}>{Strings.getLang(pm25Code ? 'pm25' : 'airQuality')}</Text>
        )}

        {(pm25Code || airQualityCode) && (
          <Text
            accessibilityLabel="HomeScene_MainView_Value"
            numberOfLines={1}
            style={[
              styles.text,
              styles.text__title,
              {
                fontSize: this.calFontSize(centerText),
              },
            ]}
          >
            {centerText}
          </Text>
        )}

        {pm25Code && airQualityCode && (
          <Text style={styles.text}>
            {Strings.formatValue(
              'indoorAirQualityTip',
              Strings.getDpLang('air_quality', airQuality)
            )}
          </Text>
        )}

        {filterCode && (
          <Text style={[styles.text, styles.text__dimmed, { color: 'rgba(255,255,255,0.6)' }]}>
            {Strings.formatValue('filterTip', filter)}
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(280),
    height: cx(280),
    backgroundColor: 'transparent',
    paddingVertical: cy(56),
  },

  text: {
    fontSize: Math.max(12, cx(12)),
    color: '#fff',
  },

  text__title: {
    width: cx(180),
    fontSize: cx(64),
    fontWeight: '600',
    textAlign: 'center',
  },

  text__dimmed: {
    fontSize: Math.round(Math.max(10, cx(10))),
    lineHeight: Math.round(Math.max(18, cx(18))),
  },
});

export default connect(({ dpState }) => ({
  power: dpState[powerCode],
  pm25: dpState[pm25Code],
  airQuality: dpState[airQualityCode],
  filter: dpState[filterCode],
}))(MainCenterTip);
