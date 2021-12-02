import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Strings from '@i18n';
import { Row } from '../components';
import Utils from '../protocol/utils';

const { strBytes2Name } = Utils.RobotUtils;
interface IProps {
  deviceInfo: string;
}

export default class DeviceInfo extends Component<IProps> {
  /**
   * 数据
   */
  getData = () => {
    const { deviceInfo } = this.props;
    const infoJson = this.renderJson(deviceInfo);
    const {
      Device_SN,
      Firmware_Version,
      IP,
      MCU_Version,
      Mac,
      Module_UUID,
      RSSI,
      WiFi_Name,
    } = infoJson;

    const data = [
      {
        title: Strings.getLang('wifiName'),
        value: WiFi_Name,
        visible: !!WiFi_Name,
      },
      {
        title: Strings.getLang('RSSI'),
        value: RSSI,
        visible: !!RSSI,
      },
      {
        title: Strings.getLang('iPAddr'),
        value: IP,
        visible: !!IP,
      },
      {
        title: Strings.getLang('macAddr'),
        value: Mac,
        visible: !!Mac,
      },
      {
        title: Strings.getLang('mcuVersion'),
        value: MCU_Version,
        visible: !!MCU_Version,
      },
      {
        title: Strings.getLang('firmwareVersion'),
        value: Firmware_Version,
        visible: !!Firmware_Version,
      },
      {
        title: Strings.getLang('deviceSN'),
        value: Device_SN,
        visible: !!Device_SN,
      },
      {
        title: Strings.getLang('moduleUUid'),
        value: Module_UUID,
        visible: !!Module_UUID,
      },
    ];
    return data.filter(item => item.visible);
  };

  /**
   * 兼容android虚拟设备模拟上报raw类型不解密的问题
   * @param str
   */
  isJSON = (str: string | null) => {
    if (typeof str === 'string') {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
    return false;
  };

  renderJson = (str: string) => {
    if (this.isJSON(str)) {
      return JSON.parse(str);
    }

    const str2 = strBytes2Name(str);
    if (this.isJSON(str2)) {
      return JSON.parse(str2 as string);
    }
    return {};
  };

  render() {
    const data = this.getData();
    return (
      <View style={styles.flex1}>
        {data.map(itm => (
          <Row
            key={itm.title}
            title={itm.title}
            value={itm.value}
            showArrow={false}
            activeOpacity={1}
          />
        ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
