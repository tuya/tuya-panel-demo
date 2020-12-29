import React, { PureComponent } from 'react';
import moment from 'moment';
import { StyleSheet } from 'react-native';
import { Utils, TYSdk, Tabs } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import Strings from 'i18n/index';
import { isSupportDp } from 'utils/index';
import Chart from 'components/Chart';

const { convertX: cx } = Utils.RatioUtils;

const {
  powerCode,
  pm25Code,
  tempIndoorCode,
  eCO2Code,
  hchoCode,
  humidityIndoorCode,
  tempOutdoorCode,
  humidityOutdoorCode,
} = dpCodes;

enum TabType {
  Temperature = 'temperature',
  CO2 = 'CO2',
  PM25 = 'PM25',
  Humidity = 'Humidity',
}

interface IProp {
  power: boolean;
  pm25: number;
  co2: number;
  tempIndoor: number;
  tempOutdoor: number;
  humidityIndoor: number;
  humidityOutdoor: number;
  hcho: number;
  devId: string;
}

interface State {
  tab: TabType;
}

class Statistics extends PureComponent<IProp, State> {
  tabs = this.getTabs();

  constructor(props: IProp) {
    super(props);
    this.state = { tab: TabType.Temperature };
  }

  getTabs() {
    const result: { value: TabType; label: string }[] = [];
    if (isSupportDp(tempIndoorCode)) {
      result.push({ value: TabType.Temperature, label: Strings.getLang('temperature_label') });
    }
    if (isSupportDp(eCO2Code)) {
      result.push({ value: TabType.CO2, label: Strings.getLang('co2') });
    }
    if (isSupportDp(pm25Code)) {
      result.push({ value: TabType.PM25, label: Strings.getLang('pm25') });
    }
    if (isSupportDp(humidityIndoorCode)) {
      result.push({ value: TabType.Humidity, label: Strings.getLang('humidity') });
    }
    return result;
  }

  handleChangeTab = (item: any) => {
    this.setState({ tab: item.value });
  };

  render() {
    const { power, devId } = this.props;
    const { tab } = this.state;
    const { min: minTemp, max: maxTemp } = TYSdk.device.getDpSchema(tempIndoorCode) || {
      min: 0,
      max: 50,
    };
    const { min: minCO2, max: maxCO2 } = TYSdk.device.getDpSchema(eCO2Code) || {
      min: 0,
      max: 1000,
    };
    const { min: minPM25, max: maxPM25 } = TYSdk.device.getDpSchema(pm25Code) || {
      min: 0,
      max: 999,
    };
    const { min: minHumdity, max: maxHumdity } = TYSdk.device.getDpSchema(humidityIndoorCode) || {
      min: 0,
      max: 100,
    };
    return (
      <Tabs
        style={styles.tabs}
        tabStyle={{ height: 70 }}
        activeKey={tab}
        dataSource={this.tabs}
        swipeable={false}
        onChange={this.handleChangeTab}
      >
        {isSupportDp(tempIndoorCode) && (
          <Tabs.TabPanel style={styles.panel}>
            <Chart
              devId={devId}
              min={minTemp}
              max={maxTemp}
              dpCode={tempIndoorCode}
              params={{ date: moment().format('YYYYMMDD'), type: 'avg' }}
              formatValue={`function(v){return v + ' ${Strings.getLang('celsius')}';}`}
            />
          </Tabs.TabPanel>
        )}
        {isSupportDp(eCO2Code) && (
          <Tabs.TabPanel style={styles.panel}>
            <Chart
              devId={devId}
              min={minCO2}
              max={maxCO2}
              dpCode={eCO2Code}
              params={{ date: moment().format('YYYYMMDD'), type: 'avg' }}
              formatValue={`function(v){return v + ' ${Strings.getLang('tvco_unit')}';}`}
            />
          </Tabs.TabPanel>
        )}
        {isSupportDp(pm25Code) && (
          <Tabs.TabPanel style={styles.panel}>
            <Chart
              devId={devId}
              min={minPM25}
              max={maxPM25}
              dpCode={pm25Code}
              params={{ date: moment().format('YYYYMMDD'), type: 'avg' }}
              formatValue={`function(v){return v + ' ${Strings.getLang('hcho_unit')}';}`}
            />
          </Tabs.TabPanel>
        )}
        {isSupportDp(humidityIndoorCode) && (
          <Tabs.TabPanel style={styles.panel}>
            <Chart
              devId={devId}
              min={minHumdity}
              max={maxHumdity}
              dpCode={humidityIndoorCode}
              params={{ date: moment().format('YYYYMMDD'), type: 'avg' }}
              formatValue={`function(v){return v + ' ${Strings.getLang('percent')}';}`}
            />
          </Tabs.TabPanel>
        )}
      </Tabs>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  power: dpState[powerCode],
  pm25: dpState[pm25Code],
  co2: dpState[eCO2Code],
  tempIndoor: dpState[tempIndoorCode],
  tempOutdoor: dpState[tempOutdoorCode],
  humidityIndoor: dpState[humidityIndoorCode],
  humidityOutdoor: dpState[humidityOutdoorCode],
  hcho: dpState[hchoCode],
  devId: devInfo.devId,
}))(Statistics);

const styles = StyleSheet.create({
  tabs: {
    marginTop: 24,
    width: cx(327),
    borderRadius: 16,
  },
  panel: {
    width: cx(327),
  },
});
