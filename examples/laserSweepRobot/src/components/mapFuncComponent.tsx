/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYSdk } from 'tuya-panel-kit';
import { inject, observer } from 'mobx-react';
import Strings from '@i18n';
import Button from './buttonComponent';
import res from '../res';
import { DPCodes } from '../config';
import { IPanelConfig } from '../config/interface';
import { isRobotQuiet, isRobotSlience, isRobotStand, robotIsAutoRun } from '../utils/robotStatus';

const {
  RatioUtils: { convert },
} = Utils;
const { robotStatus: robotStatusCode, workMode: workModeCode } = DPCodes;

interface IProps {
  mapStatus: number;
  mapId: string;
  robotStatus: string;
  cleanSwitch?: boolean;
  workMode: string;
  setMapStatus?: (status: number, edit: boolean) => void;
  isEmptyMap: boolean;
  panelConfig?: IPanelConfig;
  roomEditable: boolean;
  fontColor: string;
  navigation: {
    navigate: (route: string, params) => void;
  };
}
@inject((state: any) => {
  const {
    dpState,
    mapDataState: { getData: mapDataState = {} },
    theme: { getData: theme = {} },
    panelConfig: { store: panelConfig = {} },
  } = state;
  return {
    robotStatus: dpState.data[robotStatusCode],
    cleanSwitch: dpState.data[DPCodes.cleanSwitch],
    workMode: dpState.data[workModeCode],
    panelConfig,
    mapId: mapDataState.mapId,
    roomEditable: mapDataState.roomEditable,
    isEmptyMap: mapDataState.isEmptyMap,
    fontColor: theme.fontColor,
  };
})
@observer
export class MapFunc extends Component<IProps> {
  jumpToSetting = () => {
    const { navigation } = this.props;
    navigation.navigate('settings', {
      title: Strings.getLang('settings'),
      navigation,
    });
  };

  jumpToMapEdit = () => {
    const { robotStatus, navigation } = this.props;
    if (!isRobotQuiet(robotStatus)) {
      return;
    }
    const { roomEditable, isEmptyMap } = this.props;
    if (!roomEditable || isEmptyMap) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('home_roomEdit_disabled'), () => { });
      return;
    }
    navigation.navigate('roomEdit', {
      title: Strings.getLang('roomEdit'),
      navigation,
    });
  };

  handleForbiden = () => {
    const { isEmptyMap, setMapStatus } = this.props;
    if (isEmptyMap) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('home_forbidden_disabled'), () => { });
      return;
    }
    setMapStatus && setMapStatus(DPCodes.nativeMapStatus.virtualArea, true);
  };

  /**
   * 是否展示禁区编辑按钮
   * 【禁区编辑按钮】
   * 1、无地图时，不显示该功能；
   * 2、支持后台配置是否支持显示禁区编辑的功能；
   * 3、自动模式当前状态为工作中或者暂停状态下，是否允许设置禁区；
   */
  showSetWall = () => {
    const { mapStatus, mapId, panelConfig, robotStatus, workMode } = this.props;
    const { forbiddenAreaConfig } = panelConfig || {};
    // mapForbiddenAvailable后台配置地图编辑功能是否生效
    const { mapForbiddenAvailable, mapForbiddenSmartAvailable } = forbiddenAreaConfig || {};
    const statusIsWall =
      mapStatus === DPCodes.nativeMapStatus.virtualArea ||
      mapStatus === DPCodes.nativeMapStatus.virtualWall;
    if (statusIsWall) {
      return false;
    }

    const isShow =
      isRobotSlience(robotStatus) ||
      (mapStatus === 0 && robotStatus === 'paused') ||
      (mapForbiddenSmartAvailable && robotIsAutoRun(workMode, robotStatus));
    // if (cleanSwitch) {
    //   return !cleanSwitch;
    // }
    return !!mapId && mapForbiddenAvailable && isShow;
  };

  /**
   * 【地图编缉按钮】
   * 1、无地图时，不显示该功能；
   * 2、支持后台配置是否支持显示地图编辑的功能；
   * 3、当有地图时，当地图数据标志位为不可编辑时，点击该功能，会弹窗提示地图不可编辑；
   */
  showRoomEdit = () => {
    const { panelConfig, mapId, robotStatus } = this.props;
    const { mapPartitionConfig } = panelConfig || {};
    // mapPartitionAvailable后台配置地图编辑功能是否生效
    const { partitionAvailable } = mapPartitionConfig || {};
    // if (isEmptyMap && !isEmptyMap()) {
    //   return false;
    // }
    return !!mapId && partitionAvailable && isRobotStand(robotStatus);
  };

  renderGroup = () => {
    const { fontColor } = this.props;
    const data = [
      {
        image: res.setWall,
        text: Strings.getLang('home_forbiddenEdit'),
        onPress: this.handleForbiden,
        visible: this.showSetWall(),
      },
      {
        image: res.roomEdit,
        text: Strings.getLang('roomEdit'),
        onPress: this.jumpToMapEdit,
        visible: this.showRoomEdit(),
      },
      {
        image: res.more,
        text: Strings.getLang('home_settings'),
        onPress: this.jumpToSetting,
        visible: true,
      },
    ];
    return data.map(item => {
      if (!item.visible) {
        return null;
      }
      return (
        <Button
          key={item.image}
          imageStyle={styles.btnImg}
          textStyle={[styles.btnText, { color: fontColor }]}
          {...item}
        />
      );
    });
  };

  render() {
    return <View style={styles.root}>{this.renderGroup()}</View>;
  }
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: convert(13),
    bottom: convert(14 + 56),
  },
  btnImg: {
    width: convert(52),
    height: convert(52),
    borderRadius: convert(26),
  },
  btnText: {
    fontSize: convert(10),
  },
});
