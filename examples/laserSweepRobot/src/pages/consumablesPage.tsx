/* eslint-disable @typescript-eslint/no-empty-function */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { inject, observer } from 'mobx-react';
import { TYSdk, Utils } from 'tuya-panel-kit';
import _floor from 'lodash/floor';
import _isUndefined from 'lodash/isUndefined';
import _debounce from 'lodash/debounce';
import Strings from '@i18n';
import { DPCodes } from '../config';
import Res from '../res';
import { SettingsSectionList } from '../components';

const {
  RatioUtils: { convert },
} = Utils;

interface IProps {
  dpState: any;
}

@inject(({ dpState }) => {
  const { data } = dpState;
  return {
    dpState: data,
  };
})
@observer
export default class Consumables extends PureComponent<IProps> {
  /**
   * 弹框
   * @param code
   */
  onConfirmDialogPress = (code: string) => {
    return new Promise<void>((resolve, reject) => {
      this.simpleConfirmDialog(
        Strings.getDpLang(code),
        Strings.getDpLang(code),
        () => {
          TYSdk.device.putDeviceData({
            [code]: true,
          });
          resolve();
        },
        () => {
          reject();
        }
      );
    });
  };

  getLifeTime = (code: string) => {
    const { dpState } = this.props;
    const value = dpState[code];
    if (_isUndefined(value)) return '';
    const { max = 2147483647 } = TYSdk.device.getDpSchema(code) || {};
    return `${value} ${Strings.getLang('minute')}`;
  };

  getLifePercentage = (code: string) => {
    const { dpState } = this.props;
    const value = dpState[code];
    if (_isUndefined(value)) return '';
    const { max = 2147483647 } = TYSdk.device.getDpSchema(code) || {};
    return `${_floor((value / max) * 100)}%`;
  };

  get sections() {
    const {
      resetFilterTm,
      filterTm,
      sideBshTm,
      resetSideBshTm,
      mainBshTm,
      resetMainBshTm,
      dusterCloth,
      resetDusterCloth,
    } = DPCodes;
    const data = [
      {
        data: [
          {
            key: resetFilterTm,
            dpCode: resetFilterTm,
            Icon: Res.resetFilter,
            imageFollowIconColor: false,
            iconSize: convert(58),
            title: `${Strings.getDpLang(filterTm)} ${this.getLifePercentage(filterTm)}`,
            subTitle: `${Strings.getLang('remaining_life')} ${this.getLifeTime(filterTm)}`,
            onPress: () => {
              this.onConfirmDialogPress(resetFilterTm).then(() => { });
            },
            visible: TYSdk.device.checkDpExist(resetFilterTm),
          },
          {
            key: resetSideBshTm,
            dpCode: resetSideBshTm,
            Icon: Res.edgeBrush,
            imageFollowIconColor: false,
            iconSize: convert(58),
            title: `${Strings.getDpLang(sideBshTm)} ${this.getLifePercentage(sideBshTm)}`,
            subTitle: `${Strings.getLang('remaining_life')} ${this.getLifeTime(sideBshTm)}`,
            onPress: () => {
              this.onConfirmDialogPress(resetSideBshTm).then(() => { });
            },
            visible: TYSdk.device.checkDpExist(resetSideBshTm),
          },
          {
            key: resetMainBshTm,
            dpCode: resetMainBshTm,
            Icon: Res.rollBrush,
            imageFollowIconColor: false,
            iconSize: convert(58),
            title: `${Strings.getDpLang(mainBshTm)} ${this.getLifePercentage(mainBshTm)}`,
            subTitle: `${Strings.getLang('remaining_life')} ${this.getLifeTime(mainBshTm)}`,
            onPress: () => {
              this.onConfirmDialogPress(resetMainBshTm).then(() => { });
            },
            visible: TYSdk.device.checkDpExist(resetMainBshTm),
          },
          {
            key: resetDusterCloth,
            dpCode: resetDusterCloth,
            Icon: Res.dusterCloth,
            imageFollowIconColor: false,
            iconSize: convert(58),
            title: `${Strings.getDpLang(dusterCloth)} ${this.getLifePercentage(dusterCloth)}`,
            subTitle: `${Strings.getLang('remaining_life')} ${this.getLifeTime(dusterCloth)}`,
            onPress: () => {
              this.onConfirmDialogPress(resetDusterCloth).then(() => { });
            },
            visible: TYSdk.device.checkDpExist(resetDusterCloth),
          },
        ],
      },
    ];
    return data;
  }

  simpleConfirmDialog = _debounce(
    (
      title: string,
      context: string,
      confirm: () => void = () => { },
      cancel: () => void = () => { }
    ) => {
      TYSdk.mobile.simpleConfirmDialog(title, context, confirm, cancel);
    }
  );

  render() {
    return (
      <View style={styles.container}>
        <SettingsSectionList sections={this.sections} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
});
