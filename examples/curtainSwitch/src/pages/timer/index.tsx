import _ from 'lodash';
import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { TYFlatList, TYSdk } from 'tuya-panel-kit';
import Strings from '../../i18n';

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

interface TimerProps {
  switchCodes: any[];
  switchNames: any;
}

class Timer extends Component<TimerProps> {
  getData() {
    const { switchCodes, switchNames } = this.props;
    return switchCodes.map((code: string) => ({
      key: code,
      title: switchNames[code] || Strings.getDpLang(code),
      arrow: true,
      onPress: () => this.handlerToSetTimer(code),
    }));
  }

  handlerToSetTimer = (code: string) => {
    const data = {
      category: `category_${code}`,
      repeat: 0,
      data: [
        {
          dpId: TYDevice.getDpIdByCode(code),
          dpName: Strings.getDpLang(code),
          selected: 0,
          rangeKeys: ['open', 'close'],
          rangeValues: ['open', 'close'].map(v => Strings.getDpLang(code, v)),
        },
      ],
    };
    TYNative.gotoDpAlarm(data);
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <TYFlatList style={{ alignSelf: 'stretch' }} data={this.getData()} />
      </View>
    );
  }
}

export default connect(({ switchCodes, socketState }: any) => ({
  switchCodes: Object.keys(switchCodes),
  switchNames: socketState.socketNames,
}))(Timer);
