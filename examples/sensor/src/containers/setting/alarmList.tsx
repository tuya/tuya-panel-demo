import React, { Component } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Utils, TYText, SwitchButton, Divider } from 'tuya-panel-kit';
import _ from 'lodash';
import TYSdk from '../../api';
import Strings from '../../i18n';

const { convertX: cx } = Utils.RatioUtils;

interface AlarmProps {
  themeColor: string;
  style?: any;
  devInfo: any;
}

interface AlarmItemProps {
  id: string;
  enabled: boolean;
  name: string;
  i18nData: any;
  auditStatus: 1;
}

interface AlarmState {
  alarmList: any[];
}

export default class AlarmList extends Component<AlarmProps, AlarmState> {
  constructor(props: AlarmProps) {
    super(props);
    this.state = {
      alarmList: [],
    };
  }
  componentDidMount() {
    this.getAlarmData();
  }
  getAlarmData = () => {
    const { devInfo } = this.props;
    TYSdk.getDevAlarmList(devInfo.devId).then(
      (d: any) => {
        const alarmList = d
          .filter((data: AlarmItemProps) => data.auditStatus === 1)
          .map((item: AlarmItemProps, i: number) => ({
            key: item.id,
            value: item.enabled,
            title: item.i18nData.name[Strings.language] || item.i18nData.name.en,
            // onTintColor: themeColor,
            size: { width: cx(40), height: cx(24), activeSize: cx(20) },
            onValueChange: (v: boolean) => this.changeSwitch(i, v),
            ...item,
          }));
        this.setState({
          alarmList,
        });
        TYSdk.native.hideLoading();
      },
      () => {
        TYSdk.native.hideLoading();
      }
    );
  };

  changeSwitch(index: number, enabled: boolean) {
    const { devInfo } = this.props;
    const alarmList = _.cloneDeep(this.state.alarmList);
    alarmList[index].enabled = enabled;
    // 拼接所有禁用的告警规则的id
    const disAlarmIds = alarmList
      .filter(({ enabled }) => !enabled)
      .map(({ id }) => id)
      .join(',');
    // 当全部开启时， id传空， disabled传false
    TYSdk.setAlarmSwitch(devInfo.devId, disAlarmIds, disAlarmIds.length > 0).then(
      () => this.getAlarmData(),
      () => TYSdk.native.simpleTipDialog(Strings.getLang('operationFailed'), () => {})
    );
  }

  _renderItem = ({ item, index }: any) => {
    return (
      <View style={[styles.item, styles.row]}>
        <TYText style={styles.title}>{item.title}</TYText>
        <SwitchButton
          value={item.enabled}
          onTintColor={this.props.themeColor}
          onValueChange={(enabled: boolean) => this.changeSwitch(index, enabled)}
        />
      </View>
    );
  };
  render() {
    const { alarmList } = this.state;
    if (!alarmList.length) return <View />;
    return (
      <View style={this.props.style}>
        <View style={styles.header}>
          <TYText style={styles.text}>{Strings.getLang('alarmSet')}</TYText>
          <Divider color="#979797" style={{ opacity: 0.2 }} />
        </View>
        <View>
          <FlatList data={alarmList} renderItem={this._renderItem} keyExtractor={d => d.key} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    height: cx(60),
  },
  title: {
    fontSize: 14,
    lineHeight: 24,
    color: '#3D3D3D',
    textAlign: 'center',
  },
  text: {
    paddingVertical: cx(12),
    fontSize: 12,
    color: '#505050',
  },
});
