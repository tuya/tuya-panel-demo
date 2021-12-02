import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TYSdk, Button, Utils } from 'tuya-panel-kit';
import { observer, inject } from 'mobx-react';
import Strings from '@i18n';
import { Row } from '../components';
import { DPCodes } from '../config';

const { convertX: cx } = Utils.RatioUtils;
interface IProps {
  dustCollectionNum: number;
}

interface ICollection {
  title: string;
  subTitle: string;
  value: string | boolean;
  onPress: () => void;
  arrowColor: string;
  arrowName: string;
  showArrow: boolean;
}

@inject((state: any) => {
  const {
    dpState: { getData: dpState },
  } = state;
  return {
    dustCollectionNum: dpState[DPCodes.dustCollectionNum],
  };
})
@observer
export default class DustCollection extends Component<IProps> {
  onSwitch = () => {
    TYSdk.device.putDeviceData({ [DPCodes.dustCollectionSwitch]: true });
  };

  handleDustCollection = (num: number) => {
    TYSdk.device.putDeviceData({ [DPCodes.dustCollectionNum]: num });
  };

  render() {
    const { dustCollectionNum } = this.props;
    const { max = 0 } = TYSdk.device.getDpSchema(DPCodes.dustCollectionNum) || {};
    const curArr = new Array(max).fill(1);
    const data: Array<ICollection> = [
      {
        title: Strings.getLang('noDustTitle'),
        subTitle: Strings.getLang('noDustSubtitle'),
        value: dustCollectionNum === 0,
        onPress: () => this.handleDustCollection(0),
      },
      ...curArr.map((_, idx) => ({
        title: Strings.formatValue('dustTitle', Strings.getLang(`time${idx + 1}`)),
        subTitle: Strings.formatValue('dustSubtitle', Strings.getLang(`time${idx + 1}`)),
        value: dustCollectionNum === idx + 1,
        onPress: () => this.handleDustCollection(idx + 1),
      })),
    ].map(itm => ({
      arrowColor: '#44DB5E',
      arrowName: 'tick',
      showArrow: false,
      ...itm,
    }));
    return (
      <View style={styles.flex1}>
        <ScrollView>
          {TYSdk.device.checkDpExist(DPCodes.dustCollectionNum) &&
            data.map((itm: ICollection) => <Row key={itm.title} {...itm} />)}
          {TYSdk.device.checkDpExist(DPCodes.dustCollectionSwitch) ? (
            <Button
              wrapperStyle={styles.wrapperStyle}
              style={styles.btn}
              text={Strings.getLang('dustSwitch')}
              textStyle={[styles.text, { color: '#fff' }]}
              onPress={this.onSwitch}
            />
          ) : null}
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  wrapperStyle: {
    flex: 1,
  },
  btn: {
    width: cx(240),
    height: cx(46),
    marginVertical: cx(46),
    borderRadius: cx(23),
    backgroundColor: 'rgb(42,174,255)', // 42,174
  },
  text: {
    color: '#ffffff',
    fontSize: cx(18),
  },
});
