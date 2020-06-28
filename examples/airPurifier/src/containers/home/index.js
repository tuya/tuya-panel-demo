import _get from 'lodash/get';
import React, { PureComponent } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import HomeTopView from './home-top-view';
import HomeMainView from './home-main-view';
import HomeTipView from './home-tip-view';
import HomeCurveView from './home-curve-view';
import HomeStatView from './home-stat-view';
import HomeBottomView from './home-bottom-view';
import TYSdk from '../../api';
import { store } from '../../main';
import dpCodes from '../../config/dpCodes';

const {
  tempIndoor: tempIndoorCode,
  humidity: humidityCode,
  tvoc: tvocCode,
  eco2: eco2Code,
  filterDays: filterDaysCode,
  totalRuntime: totalRuntimeCode,
  totalPm: totalPmCode,
  mode: modeCode,
  speed: speedCode,
} = dpCodes;

class HomeScene extends PureComponent {
  render() {
    const countryCode = _get(TYSdk, 'mobileInfo.countryCode', 'CN');
    const hideOutdoorPM25 = countryCode !== 'CN';
    const { devInfo = {} } = store.getState();
    const bottomDps = [];
    const dps = [];
    if (JSON.stringify(devInfo) !== '{}') {
      const originDps = [
        tempIndoorCode,
        humidityCode,
        tvocCode,
        eco2Code,
        filterDaysCode,
        totalRuntimeCode,
        totalPmCode,
      ];
      const originBottom = [modeCode, speedCode];
      originDps.map(item => {
        if (devInfo.schema[item] !== undefined) {
          dps.push(devInfo.schema[item]);
        }
      });
      originBottom.map(item => {
        if (devInfo.schema[item] !== undefined) {
          bottomDps.push(devInfo.schema[item]);
        }
      });
    }
    const CurveView = <HomeCurveView hideOutdoorPM25={hideOutdoorPM25} />;
    return (
      <View style={styles.container}>
        <ScrollView
          accessibilityLabel="HomeScene_ScrollView"
          contentContainerStyle={styles.scrollView}
        >
          <HomeTopView />
          <HomeMainView />
          <HomeTipView />
          {/* {CurveView} */}
          {dps !== undefined && <HomeStatView dps={dps} />}
        </ScrollView>
        {bottomDps !== undefined && <HomeBottomView dps={bottomDps} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {},
});

export default connect(({ dpState }) => ({
  tempIndoor: dpState[tempIndoorCode],
  humidity: dpState[humidityCode],
  tvoc: dpState[tvocCode],
  eco2: dpState[eco2Code],
  filterDays: dpState[filterDaysCode],
  totalRuntime: dpState[totalRuntimeCode],
  totalPm: dpState[totalPmCode],
  mode: dpState[modeCode],
  speed: dpState[speedCode],
}))(HomeScene);
