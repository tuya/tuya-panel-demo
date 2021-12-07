import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { TYSdk, Utils } from 'tuya-panel-kit';
import Strings from '@i18n';
import BottomItemView from './bottomItemView';
import { DPCodes } from '../../config';

const { NumberUtils } = Utils;

function getDpSchema(code: string) {
  const res = TYSdk.device.getDpSchema(code) || {};
  return res;
}

interface IProps {
  style?: StyleProp<ViewStyle>;
  status?: string;
  CleanArea?: number;
  ResidualElectricity?: number;
  CleanTime?: number;
  color?: string;
}
export default class HomeBottomView extends Component<IProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: {},
    status: '1',
    CleanArea: 0,
    ResidualElectricity: 0,
    CleanTime: 0,
    color: '#5D6681',
  };

  getDatas = () => {
    const { CleanArea, ResidualElectricity, CleanTime } = this.props;
    return [
      {
        key: 'CleanTime',
        code: DPCodes.cleanTime,
        values: `${NumberUtils.scaleNumber(
          getDpSchema(DPCodes.cleanTime).scale,
          parseInt(CleanTime, 10)
        )}`,
      },
      {
        key: 'ClearArea',
        code: DPCodes.cleanArea,
        values: `${NumberUtils.scaleNumber(getDpSchema(DPCodes.cleanArea).scale, CleanArea)}`,
      },
      {
        key: 'ResidualElectricity',
        code: DPCodes.energy,
        values: `${NumberUtils.scaleNumber(
          getDpSchema(DPCodes.energy).scale,
          ResidualElectricity
        )}`,
      },
    ].map((item, idx) => {
      const { code } = item;
      const isExist = TYSdk.device.checkDpExist(code);
      const title = Strings.getDpLang(code);
      const { unit } = getDpSchema(code);
      return {
        ...item,
        visible: isExist,
        title,
        unit,
      };
    });
  };

  render = () => {
    const datas = this.getDatas();
    const { color, style } = this.props;
    return (
      <View style={[styles.mainContainer, style]} pointerEvents="box-none">
        {datas.map(data => {
          if (!data.visible) return null;
          return (
            <BottomItemView
              key={data.key}
              title={data.title}
              values={data.values}
              unit={data.unit}
              color={color}
            />
          );
        })}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
