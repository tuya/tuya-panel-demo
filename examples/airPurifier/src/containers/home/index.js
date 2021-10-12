import React, { PureComponent } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import HomeTopView from './home-top-view';
import HomeMainView from './home-main-view';
import HomeTipView from './home-tip-view';
import HomeStatView from './home-stat-view';
import HomeBottomView from './home-bottom-view';
import { store } from '../../redux/configureStore';
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
      originDps.forEach(item => {
        if (devInfo.schema[item] !== undefined) {
          dps.push(devInfo.schema[item]);
        }
      });
      originBottom.forEach(item => {
        if (devInfo.schema[item] !== undefined) {
          bottomDps.push(devInfo.schema[item]);
        }
      });
    }
    return (
      <View style={styles.container}>
        <ScrollView
          accessibilityLabel="HomeScene_ScrollView"
          contentContainerStyle={styles.scrollView}
        >
          <HomeTopView />
          <HomeMainView />
          <HomeTipView />
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
