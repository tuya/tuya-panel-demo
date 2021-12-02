/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-restricted-syntax */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { observer, inject } from 'mobx-react';
import { Modal, Utils as TYUtils, TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import Strings from '@i18n';
import { SettingsSectionList } from '../components';
import ManualView from '../components/manualModal';
import { DPCodes } from '../config';
import timerFunConfig from '../config/default/timerFunConfig';
import { IPanelConfig } from '../config/interface';

const { convertX: cx } = TYUtils.RatioUtils;

interface IProps {
  dpState: any;
  panelConfig: IPanelConfig;
  navigation: {
    navigate: (route: string, params) => void;
  };
}
@inject((state: any) => {
  const {
    dpState,
    panelConfig: { store: panelConfig = {} },
  } = state;
  return {
    dpState: dpState.data,
    panelConfig,
  };
})
@observer
export default class SettingsLayout extends Component<IProps> {
  constructor(props: any) {
    super(props);
    this.customCodes = this.getCustomCode();
  }

  customCodes: any;

  createResetMaterial = (code: string) => () => {
    const resetCode = `reset_${code}`;
    TYSdk.mobile.simpleConfirmDialog(
      Strings.getDpLang(resetCode),
      '',
      () => {
        TYSdk.device.putDeviceData({
          [resetCode]: true,
        });
      },
      () => { }
    );
  };

  onTimerPress = () => {
    const { panelFunTimerConfig } = TYSdk.device.getFunConfig();
    const timerConfigObj: any = panelFunTimerConfig
      ? TYUtils.JsonUtils.parseJSON(panelFunTimerConfig)
      : [{ code: DPCodes.taskSW, rangeKeys: [true, false] }];
    const data = timerConfigObj.map(({ code, rangeKeys }) => {
      let range = rangeKeys;
      if (rangeKeys[0] === 'true' && rangeKeys[1] === 'false' && rangeKeys.length === 2) {
        range = [true, false];
      }
      if (rangeKeys[0] === 'false' && rangeKeys[1] === 'true' && rangeKeys.length === 2) {
        range = [false, true];
      }
      return {
        dpId: TYSdk.device.getDpIdByCode(code),
        dpName: Strings.getDpLang(code),
        selected: 0,
        rangeKeys: range,
        rangeValues: range.map((key: boolean) => Strings.getDpLang(code, key)),
      };
    });

    const { dpState, panelConfig, navigation } = this.props;

    const id = 'scheduleCustomTimer';
    const { scheduleConfig } = panelConfig;
    const { scheduleLocal } = scheduleConfig;

    const {
      scheduleLocalFan: { scheduleLocalFanAvailable, scheduleLocalFanEnum },
      scheduleLocalWater: { scheduleLocalWaterAvailable, scheduleLocalWaterEnum },
      scheduleLocalMode: { scheduleLocalModeAvailable, scheduleLocalModeEnum },
      scheduleLocalCount: { scheduleLocalCountAvailable, scheduleLocalCountEnum },
      scheduleLocalLocationSet,
    } = scheduleLocal || {};

    if (
      panelConfig.scheduleConfig.scheduleType === 'local' &&
      TYSdk.device.checkDpExist(DPCodes.deviceTimer)
    ) {
      navigation.navigate(id, {
        laserMapConfig: {
          timer: {
            fan: {
              isShow: scheduleLocalFanAvailable,
              enumValues: scheduleLocalFanEnum,
            },
            cleanMode: {
              isShow: scheduleLocalModeAvailable,
              enumValues: scheduleLocalModeEnum,
            },
            water: {
              isShow: scheduleLocalWaterAvailable,
              enumValues: scheduleLocalWaterEnum,
            },
            sweepCount: {
              isShow: scheduleLocalCountAvailable,
              enumValues: scheduleLocalCountEnum,
            },
            location: {
              isShow: scheduleLocalLocationSet,
            },
          },
        },
        ...timerFunConfig(),
        initSchedule: dpState[DPCodes.deviceTimer],
        deviceTimerCode: DPCodes.deviceTimer,
      });
    } else {
      TYSdk.native.gotoDpAlarm({
        category: 'category__switch',
        repeat: 0,
        data,
      });
    }
  };

  getCustomCode() {
    const schema = TYSdk.device.getDpSchema() || {};
    const localCodes = Object.values(DPCodes).filter(d => _.isString(d));
    const localMap = _.keyBy(localCodes);

    const codesAll: Array<string> = [];
    const customCodes: string[] = [];
    for (const [code, { type }] of Object.entries(schema)) {
      if (['fault', 'raw'].includes(type)) {
        continue;
      }
      if (/_unseen/.test(code)) {
        continue;
      }
      // customCodes
      codesAll.push(code);
      if (!localMap[code]) {
        customCodes.push(code);
      }
    }
    return customCodes.length ? customCodes : undefined;
  }

  onDataPress = (code, data) => {
    TYSdk.device.putDeviceData({
      [code]: data,
    });
  };

  onRecordPress = () => {
    const { dpState, panelConfig, navigation } = this.props;
    const { timeFormatConfig } = panelConfig || {};
    const { recordTimeIs24 } = timeFormatConfig || {};
    navigation.navigate('records', {
      title: Strings.getLang('records'),

      allAreaCode: DPCodes.totalArea,
      allArea: dpState[DPCodes.totalArea],
      allAreaUnit: Strings.getDpLang(DPCodes.totalArea, 'unit'),
      allAreaTitle: Strings.getDpLang(DPCodes.totalArea),

      allCountCode: DPCodes.totalCount,
      allCount: dpState[DPCodes.totalCount],
      allCountUnit: Strings.getDpLang(DPCodes.totalCount, 'unit'),
      allCountTitle: Strings.getDpLang(DPCodes.totalCount),

      allTimeCode: DPCodes.totalMinutes,
      allTime: dpState[DPCodes.totalMinutes],
      allTimeUnit: Strings.getDpLang(DPCodes.totalMinutes, 'unit'),
      allTimeTitle: Strings.getDpLang(DPCodes.totalMinutes),
      is24Hour: recordTimeIs24, // 新增时间制配置
      navigation,
    });
  };

  /**
   * 耗材管理回调，点击跳转
   */
  onConsumablesPress = () => {
    const { navigation } = this.props;
    navigation.navigate('consumablesManagement', {
      title: Strings.getLang('consumables_management'),
    });
  };

  onDustCollectionPress = () => {
    const { navigation } = this.props;
    navigation.navigate('dustCollectionSwitch', {
      title: Strings.getLang('dustCollectionSwitch'),
    });
  };

  /**
   * 设备信息点击回调
   */
  onDeviceInfoPress = () => {
    const { dpState, navigation } = this.props;
    navigation.navigate('deviceInfo', {
      title: Strings.getLang('deviceInfo'),
      deviceInfo: dpState[DPCodes.deviceInfo],
    });
  };

  onConfirmDialogPress = (code: string, data: boolean) => {
    TYSdk.mobile.simpleConfirmDialog(
      Strings.getDpLang(code),
      // Strings.getDpLang(code, data),
      '',
      () => {
        TYSdk.device.putDeviceData({
          [code]: data,
        });
      },
      () => { }
    );
  };

  /**
   * 语音功能点击
   */
  onVolumePress = () => {
    const { navigation } = this.props;
    navigation.navigate('volume', {
      title: Strings.getLang(DPCodes.volume),
    });
  };

  onManualPress = () => {
    Modal.render(<ManualView />, { alignContainer: 'center' });
  };

  jumpToMapManage = () => {
    const { navigation } = this.props;
    navigation.navigate('mapManage', {
      title: Strings.getLang('mapManage'),
    });
  };

  jumpTomaterialManage = () => {
    const { navigation } = this.props;
    navigation.navigate('materialManage', {
      title: Strings.getLang('materialManage'),
    });
  };

  materialVisible = () => {
    const ready = [
      DPCodes.sideBshTm,
      DPCodes.mainBshTm,
      DPCodes.filterTm,
      DPCodes.dusterCloth,
    ].find(code => TYSdk.device.checkDpExist(code));
    return !!ready;
  };

  /**
   * 自定义链接
   */
  showCustomUrl = (code: string) => {
    const { type } = TYSdk.device.getDpSchema(code);
    return /_url/.test(code) && (type === 'string' || type === 'raw');
  };

  get sections() {
    const { dpState, panelConfig } = this.props;
    const {
      multiMapConfig: { multiMapAvailable },
      recordConfig: { recordAvailable },
    } = panelConfig || {};

    const data = [
      {
        title: Strings.getLang('settings_baseFunc'),
        data: [
          {
            key: 'Manual',
            dpCode: DPCodes.moveCtrl,
            title: Strings.getLang('manual'),
            onPress: this.onManualPress,
          },
          {
            key: 'mapManage',
            title: Strings.getLang('mapManage'),
            onPress: this.jumpToMapManage,
            visible: multiMapAvailable,
          },
          {
            key: 'Location',
            dpCode: DPCodes.location,
            title: Strings.getDpLang(DPCodes.location),
            onPress: () => {
              this.onConfirmDialogPress(DPCodes.location, true);
            },
          },
          {
            key: 'timer',
            title: Strings.getLang('timer'),
            onPress: this.onTimerPress,
          },
          {
            key: 'ResetMap',
            dpCode: DPCodes.ResetMap,
            title: Strings.getDpLang(DPCodes.ResetMap),
            onPress: this.onConfirmDialogPress.bind(this, DPCodes.ResetMap, true),
            visible: !multiMapAvailable && TYSdk.device.checkDpExist(DPCodes.ResetMap),
          },
          {
            key: 'suckMode',
            title: Strings.getDpLang(DPCodes.suckMode),
            dpCode: DPCodes.suckMode,
            value: dpState[DPCodes.suckMode],
          },
          {
            key: 'mopMode',
            dpCode: DPCodes.mopMode,
            title: Strings.getDpLang(DPCodes.mopMode),
            value: dpState[DPCodes.mopMode],
          },
          {
            key: 'breakClean',
            title: Strings.getDpLang(DPCodes.breakClean),
            dpCode: DPCodes.breakClean,
            value: dpState[DPCodes.breakClean],
          },
          {
            key: 'customizeModeSwitch',
            title: Strings.getDpLang(DPCodes.customizeModeSwitch),
            dpCode: DPCodes.customizeModeSwitch,
            value: dpState[DPCodes.customizeModeSwitch],
          },
          {
            key: DPCodes.volume,
            title: Strings.getLang(DPCodes.volume),
            onPress: this.onVolumePress.bind(this),
            visible:
              TYSdk.device.checkDpExist(DPCodes.volume) ||
              TYSdk.device.checkDpExist(DPCodes.voiceData) ||
              TYSdk.device.checkDpExist(DPCodes.language),
          },
          {
            key: 'record',
            title: Strings.getLang('record'),
            onPress: this.onRecordPress.bind(this),
            visible: recordAvailable,
          },
          // 耗材管理
          {
            key: 'consumables_management',
            title: Strings.getLang('consumables_management'),
            onPress: this.onConsumablesPress.bind(this),
            visible:
              TYSdk.device.checkDpExist(DPCodes.sideBshTm) ||
              TYSdk.device.checkDpExist(DPCodes.mainBshTm) ||
              TYSdk.device.checkDpExist(DPCodes.filterTm) ||
              TYSdk.device.checkDpExist(DPCodes.dusterCloth),
          },

          {
            key: 'dustCollectionSwitch',
            title: Strings.getLang('dustCollectionSwitch'),
            onPress: this.onDustCollectionPress.bind(this),
            visible:
              TYSdk.device.checkDpExist(DPCodes.dustCollectionSwitch) ||
              TYSdk.device.checkDpExist(DPCodes.dustCollectionNum),
          },
          {
            key: 'deviceInfo',
            dpCode: DPCodes.deviceInfo,
            title: Strings.getLang('deviceInfo'),
            onPress: this.onDeviceInfoPress.bind(this),
          },
        ].filter(item => item.visible !== false),
      },
    ];

    if (this.customCodes) {
      data.push({
        title: Strings.getLang('customFunc'),
        data: this.customCodes.map(code => {
          // dp点以_url结尾的，需要跳转到链接
          if (this.showCustomUrl(code)) {
            return {
              dpCode: code,
              key: code,
              title: Strings.getDpLang(code),
              onPress: () => {
                const url = Strings.getDpLang(code, 'unit');
                url && TYSdk.mobile.jumpTo(url);
              },
            };
          }
          if (code === 'language' || code === 'dust_collection_num') {
            return {
              visible: false,
            };
          }
          return {
            dpCode: code,
            key: code,
            title: Strings.getDpLang(code),
            value: dpState[code],
          };
        }),
      });
    }
    return data;
  }

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
    paddingTop: cx(4),
    backgroundColor: 'rgb(248,248,248)',
  },
});
