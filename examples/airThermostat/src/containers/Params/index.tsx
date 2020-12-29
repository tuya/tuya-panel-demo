import { Utils, TYSdk, TopBar } from 'tuya-panel-kit';
import React, { Component } from 'react';
import { View } from 'react-native';
import ScrollView from 'components/ScrollView';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import { isSupportDp } from 'utils/index';
import Strings from 'i18n/index';
import gateway from '../../gateway';
import Item from './Item';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  dpState: any;
  theme?: any;
  style?: any;
}

const {
  pm25SetCode,
  eco2SetCode,
  temSetCode,
  humSetCode,
  tvocSetCode,
  pm10SetCode,
  hochSetCode,
} = dpCodes;

const paramsCodes = [
  pm25SetCode,
  eco2SetCode,
  temSetCode,
  humSetCode,
  tvocSetCode,
  pm10SetCode,
  hochSetCode,
];

class Params extends Component<Props> {
  handleChangeDp = (code: string) => (v: number) => {
    gateway.putDpData({ [code]: v });
  };

  render() {
    const { theme, dpState } = this.props;
    const { global } = theme;
    return (
      <View style={{ flex: 1 }}>
        <TopBar
          title={Strings.getLang('paramSetting')}
          actions={[]}
          onBack={() => {
            TYSdk.Navigator.pop();
          }}
        />
        <ScrollView>
          <View style={{ padding: cx(24) }}>
            {paramsCodes.map(code => {
              const isSupport = isSupportDp(code);
              if (isSupport) {
                const schema = TYSdk.device.getDpSchema(code);
                return (
                  <Item
                    style={{ marginBottom: 12 }}
                    key={code}
                    label={Strings.getDpLang(code)}
                    min={schema?.min || 0}
                    max={schema?.max || 10000}
                    step={schema.step || 1}
                    value={dpState[code]}
                    unit={schema?.unit}
                    onChange={this.handleChangeDp(code)}
                  />
                );
              }
              return null;
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default connect(({ dpState }: any) => ({ dpState }))(withTheme(Params));
