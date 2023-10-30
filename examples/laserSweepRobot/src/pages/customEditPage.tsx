import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, TYText, TYSdk } from 'tuya-panel-kit';
import { observer, inject } from 'mobx-react';
import Strings from '@i18n';
import { Row } from '../components';
import { IPanelConfig } from '../config/interface';

interface IProps {
  fan: number | string;
  water_level: number | string;
  sweep_count: number | string;
  handleSubmit: (data) => void;
  panelConfig: IPanelConfig;
}

interface IState {
  fan: number | string;
  water_level: number | string;
  sweep_count: number | string;
  status: number;
}

const attributesEnum = {
  fan: 1,
  waterLevel: 2,
  sweepCount: 3,
};

@inject((state: any) => {
  const {
    panelConfig: { store: panelConfig },
  } = state;
  return {
    panelConfig,
  };
})
@observer
export default class CustomEdit extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    const params = props.route.params;
    this.state = {
      fan: params.fan || '0',
      water_level: params.water_level || '0',
      sweep_count: params.sweep_count || '1',
      status: 0, // status 表示当前选择的属性
    };
  }

  /**
   * 取消回调
   */
  handleCancle = () => {
    this.setState({
      status: 0,
    });
    TYSdk.Navigator.pop();
  };

  /**
   * 确认回调
   */
  handleConfirm = () => {
    this.setState({
      status: 0,
    });
    const params = this.props.route.params;
    const { handleSubmit } = params;
    const { fan, water_level, sweep_count } = this.state;
    handleSubmit &&
      handleSubmit({
        fan,
        water_level,
        sweep_count,
      });
    TYSdk.Navigator.pop();
  };

  render() {
    // 水量和吸力为后台配置参数
    const { panelConfig } = this.props;
    const { attributesConfig } = panelConfig;
    const { attributesFan, attributesTimes, attributesWater } = attributesConfig;
    const { attributesFanEnum = [], attributesFanSet } = attributesFan || {};
    const { attributesTimesMaxNum, attributesTimesSet } = attributesTimes || {};
    const { attributesWaterEnum = [], attributesWaterSet } = attributesWater || {};
    // 后台配置最大数N，生成1到N的数组
    const sweepCountEnum = Array.from(
      { length: attributesTimesMaxNum ? attributesTimesMaxNum + 1 : 4 },
      (item, index) => String(index)
    );
    const { fan, water_level, sweep_count, status } = this.state;
    const customArr = [
      {
        title: Strings.getLang('fan_title'),
        value: Strings.getDpLang(`fan_${fan}`),
        onPress: () => {
          this.setState({ status: 1 });
        },
        visible: attributesFanSet,
      },
      {
        title: Strings.getLang('water_level_title'),
        value: Strings.getDpLang(`water_level_${water_level}`),
        onPress: () => {
          this.setState({ status: 2 });
        },
        visible: attributesWaterSet,
      },
      {
        title: Strings.getLang('sweep_count_title'),
        value: Strings.getDpLang(`sweep_count_${sweep_count}`),
        onPress: () => {
          this.setState({ status: 3 });
        },
        visible: attributesTimesSet,
      },
    ].filter(i => i.visible);

    let dataSource: { key: string; value: string; title: string }[] = [];
    let title = '';
    let value: string | number = '';
    switch (status) {
      case attributesEnum.fan:
        dataSource = attributesFanEnum.map(itm => ({
          key: itm,
          value: itm,
          title: Strings.getDpLang(`fan_${itm}`),
        }));
        title = Strings.getLang('custom_fan');
        value = fan;
        break;
      case attributesEnum.waterLevel:
        dataSource = attributesWaterEnum.map(itm => ({
          key: itm,
          value: itm,
          title: Strings.getDpLang(`water_level_${itm}`),
        }));
        title = Strings.getLang('custom_water_level');
        value = water_level;
        break;
      case attributesEnum.sweepCount:
        dataSource = sweepCountEnum.map(itm => ({
          key: itm,
          value: itm,
          title: Strings.getDpLang(`sweep_count_${itm}`),
        }));
        title = Strings.getLang('custom_sweep_count');
        value = sweep_count;
        break;
      default:
        null;
    }
    return (
      <View style={styles.flex1}>
        {customArr.map(itm => (
          <Row
            key={itm.title}
            title={itm.title}
            value={itm.value}
            onPress={itm.onPress}
            arrowColor="#999"
          />
        ))}
        <View style={styles.button}>
          <TouchableOpacity style={styles.touch} activeOpacity={0.8} onPress={this.handleCancle}>
            <TYText style={[styles.text, { opacity: 0.5 }]}>{Strings.getLang('cancel')}</TYText>
          </TouchableOpacity>
          <View style={styles.divide} />
          <TouchableOpacity style={styles.touch} activeOpacity={0.8} onPress={this.handleConfirm}>
            <TYText style={styles.text}>{Strings.getLang('confirm')}</TYText>
          </TouchableOpacity>
        </View>
        <Modal.List
          type="radio"
          visible={status !== 0}
          title={title}
          cancelText={Strings.getLang('cancel')}
          confirmText={Strings.getLang('confirm')}
          dataSource={dataSource}
          value={value}
          onMaskPress={() => this.setState({ status: 0 })}
          onCancel={() => this.setState({ status: 0 })}
          onSelect={(v: string | number) => {
            if (status === 1) {
              this.setState({ fan: v });
            }
            if (status === 2) {
              this.setState({ water_level: v });
            }
            if (status === 3) {
              this.setState({ sweep_count: v });
            }
            this.setState({ status: 0 });
          }}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  button: {
    height: 46,
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  divide: {
    height: 40,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#DBDBDB',
  },
  touch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'rgb(73,80,84)',
  },
});
