import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import icons from 'icons/index';
import Strings from 'i18n/index';
import ScrollView from 'components/ScrollView';
import Statistics from './Statistics';
import Block from './Block';

const { convertX: cx } = Utils.RatioUtils;

const {
  pm25Code,
  tempIndoorCode,
  tempOutdoorCode,
  humidityOutdoorCode,
  humidityIndoorCode,
  tvocCode,
  hchoCode,
} = dpCodes;

interface IProp {
  pm25: number;
  mode: string;
  tempIndoor: number;
  tempOutdoor: number;
  humidityIndoor: number;
  humidityOutdoor: number;
  tvoc: number;
  hcho: number;
  dpState: any;
}

const willShowCodes = [
  {
    code: tempIndoorCode,
    icon: icons.temp,
    label: Strings.getDpLang(tempIndoorCode),
    unit: Strings.getLang('celsius'),
  },
  {
    code: tempOutdoorCode,
    icon: icons.temp,
    label: Strings.getDpLang(tempOutdoorCode),
    unit: Strings.getLang('celsius'),
  },
  {
    code: humidityIndoorCode,
    icon: icons.humidity,
    label: Strings.getDpLang(humidityIndoorCode),
    unit: Strings.getLang('percent'),
  },
  {
    code: humidityOutdoorCode,
    icon: icons.humidity,
    label: Strings.getDpLang(humidityOutdoorCode),
    unit: Strings.getLang('percent'),
  },
  {
    code: tvocCode,
    icon: icons.pm,
    label: Strings.getDpLang(tvocCode),
    unit: Strings.getLang('tvco_unit'),
  },
  {
    code: hchoCode,
    icon: icons.pm,
    label: Strings.getDpLang(hchoCode),
    unit: Strings.getLang('hcho_unit'),
  },
];

class DataPage extends PureComponent<IProp> {
  render() {
    const { dpState } = this.props;
    return (
      <ScrollView style={styles.box}>
        <View style={styles.content}>
          <TYText style={styles.title}>{Strings.getLang('data_now')}</TYText>
          <Statistics />
        </View>
        <View style={styles.number}>
          {willShowCodes.map(({ code, label, unit, icon }) => {
            return <Block key={code} value={dpState[code]} label={label} icon={icon} unit={unit} />;
          })}
        </View>
      </ScrollView>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  dpState,
  pm25: dpState[pm25Code],
  tempIndoor: dpState[tempIndoorCode],
  tempOutdoor: dpState[tempOutdoorCode],
  humidityIndoor: dpState[humidityIndoorCode],
  humidityOutdoor: dpState[humidityOutdoorCode],
}))(DataPage);

const styles = StyleSheet.create({
  box: { flex: 1 },
  content: {
    marginHorizontal: cx(24),
  },
  title: { marginTop: 32, fontSize: cx(28) },
  number: {
    marginHorizontal: cx(24),
    marginBottom: 24,
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
