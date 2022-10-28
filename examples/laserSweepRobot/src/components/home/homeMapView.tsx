/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component, Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { observer, inject } from 'mobx-react';
import { Utils, TYSdk } from 'tuya-panel-kit';
import Strings from '@i18n';
import { P2pAPI } from '@api';
import { DPCodes } from '../../config';
import { IPanelConfig } from '../../config/interface';
import Store from '../../store';
import {
  isForbiddenZonePointsInCurPos,
  isForbiddenZonePointsInPile,
  parseRoomId,
} from '../../utils';
import { isRobotQuiet, robotIsSelectRoomPaused, robotIsSelectRoom } from '../../utils/robotStatus';
import MapView from './mapView';
import Toast from '../toastModal';

const { convertY: cy, width, height, iPhoneX } = Utils.RatioUtils;
const {
  status: workStatusCode,
  robotStatus: robotStatusCode,
  workMode: workModeCode,
  customizeModeSwitch: customizeModeSwitchCode,
} = DPCodes;
interface IProps {
  devInfo: any;
  mapStatus: number;
  onMapId: () => void;
  workStatus: string;
  robotStatus: string;
  workMode: string;
  customizeModeSwitch: boolean;
  panelConfig: IPanelConfig;
  onVituralAreaAdded: () => void;
  customConfig: () => void;
  mapId: string;
  curPos: { x: number; y: number };
  origin: { x: number; y: number };
  pilePosition: { x: number; y: number };
  selectRoomData: Array<string>;
  foldableRoomIds: Array<string>;
  fontColor: string;
  iconColor: string;
}

@inject((state: any) => {
  const {
    devInfo,
    panelConfig: { store: panelConfig = {} },
    customConfig: { store: customConfig = {} },
    dpState: { getData: dpState },
    mapDataState: { getData: mapDataState = {} },
    theme: { getData: theme = {} },
  } = state;
  const {
    [workStatusCode]: workStatus,
    [robotStatusCode]: robotStatus,
    [workModeCode]: workMode,
    [customizeModeSwitchCode]: customizeModeSwitch,
  } = dpState;
  const { mapId, curPos, origin, pilePosition, selectRoomData, foldableRoomIds } = mapDataState;

  return {
    devInfo: devInfo.data,
    workStatus,
    robotStatus,
    workMode,
    customizeModeSwitch,
    panelConfig,
    customConfig,
    fontColor: theme.fontColor,
    iconColor: theme.iconColor,

    mapId,
    curPos,
    origin,
    pilePosition,
    selectRoomData,
    foldableRoomIds,
  };
})
@observer
export default class HomeMapView extends Component<IProps> {
  mapRef: Ref<MapView>;

  componentDidMount() {
    // 采用p2p 传输协议进行数据传输
    P2pAPI.initRobotP2pSDK();
    P2pAPI.connectDeviceByP2P()
      .then(() => {
        P2pAPI.startObserverSweeperDataByP2P(1);
      })
      .catch((e: any) => {
        console.warn('connectDeviceByP2P error ===>', e);
        P2pAPI.startObserverSweeperDataByP2P(1);
      });

    if (!this.mapRef) return;
    const manager = this.mapRef.getManager();
    manager.createStoreSubscription((value: any) => {
      value.mapHeader &&
        Store.mapDataState.setData({
          ...value.mapHeader,
          ...value.mapData,
          pilePosition: value.pilePosition,
          pathData: value.pathData,
          mapSize: {
            width: value.mapHeader.bgWidth,
            height: value.mapHeader.bgHeight,
          },
          curPos: value.pathData ? value.pathData[value.pathData.length - 1] : { x: 0, y: 0 },
          isEmptyMap: !value.mapHeader.bgWidth || !value.mapHeader.bgHeight,
        });
    });
  }

  async componentWillUnmount() {
    // 退出面板，销毁p2p通道
    P2pAPI.deInitP2pSDK();
  }

  /**
   * 添加虚拟信息
   * @param data
   */
  onLaserMapPoints = (data: any) => {
    const { mapId, panelConfig, curPos, origin, pilePosition } = this.props;
    const {
      forbiddenAreaConfig: {
        pileConfig: { pileRingAvailable },
      },
    } = panelConfig;

    isForbiddenZonePointsInCurPos(data, {
      resolution: 0.05,
      curPos,
      origin,
      mapId,
    }).then(rez => {
      if (rez) return Toast.debounceInfo(Strings.getLang('curPosInForbiddenSimple'));
    });
    pileRingAvailable &&
      isForbiddenZonePointsInPile(data, {
        resolution: 0.05,
        pilePosition,
        origin,
        mapId,
      }).then(rez => {
        if (rez) return Toast.debounceInfo(Strings.getLang('pileInForbiddenSimple'));
      });
  };

  /**
   * 地图唯一标识
   * @param data
   */
  onMapId = (data: { mapId: string }) => {
    Store.mapDataState.setData({ mapId: data.mapId });
  };

  /**
   * 获取禁区等信息并更新
   * @param data
   */
  onAreaInfoList = (data: any) => {
    Store.mapDataState.setData({ RCTAreaList: data });
  };

  onClickSplitArea = ({ data }) => {
    const { selectRoomData, robotStatus } = this.props;
    if (!isRobotQuiet(robotStatus)) return;
    const room = data[0];
    const { pixel } = room;
    const roomId = parseRoomId(pixel);
    if (roomId >= 31) {
      return TYSdk.mobile.simpleTipDialog(Strings.getLang('home_selectRoom_unknown'), () => {});
    }
    let curData: Array<string> = [];
    if (!selectRoomData.includes(pixel)) {
      curData = selectRoomData.concat([pixel]);
    } else {
      curData = selectRoomData.filter(i => i !== pixel);
    }
    Store.mapDataState.setData({ selectRoomData: curData });
  };

  /**
   * 点击房间
   * @param param0
   */
  onClickRoom = data => {
    const { foldableRoomIds, mapStatus } = this.props;
    const edit = mapStatus !== DPCodes.nativeMapStatus.normal;
    if (edit) return;

    const { roomId, isFoldable } = data;
    let curData: Array<string> = [];
    if (!isFoldable && !foldableRoomIds.includes(roomId)) {
      curData = foldableRoomIds.concat([roomId]);
    } else {
      curData = foldableRoomIds.filter((i: string) => i !== roomId);
    }
    Store.mapDataState.setData({ foldableRoomIds: curData });
  };

  /**
   * 当前处于选区状态
   */
  isSelectingRoom = () => {
    const { mapStatus, workMode, robotStatus } = this.props;
    const isMapClick = mapStatus === DPCodes.nativeMapStatus.mapClick;
    const isSelectRoom = [robotIsSelectRoomPaused, robotIsSelectRoom].some(fn =>
      fn(workMode, robotStatus)
    );
    return isMapClick || isSelectRoom;
  };

  render = () => {
    const {
      panelConfig,
      workMode,
      robotStatus,
      mapStatus,
      customizeModeSwitch,
      selectRoomData,
      fontColor,
      iconColor,
      foldableRoomIds,
    } = this.props;

    const edit = mapStatus !== DPCodes.nativeMapStatus.normal;
    const isShowCurPosRing = isRobotQuiet(robotStatus);
    const isShowPileRing =
      mapStatus === DPCodes.nativeMapStatus.virtualArea ||
      mapStatus === DPCodes.nativeMapStatus.virtualWall;
    const isShowAppoint = workMode === 'pose' || mapStatus === 1;
    const isShowAreaset = workMode === 'zone' || mapStatus === 2;

    const uiInterFace = {
      isEdit: edit, // 当前地图是否可修改
      isShowPileRing, // 是否显示禁区ring
      isShowCurPosRing, // 当前点ring
      isShowAppoint, // 是否显示指哪扫哪点
      isShowAreaset, // 是否显示清扫区域
      isCustomizeMode: customizeModeSwitch,
      isSelectRoom: this.isSelectingRoom(), // 当前状态是否为选择
    };

    return (
      <View style={styles.container}>
        <MapView
          ref={ref => {
            this.mapRef = ref;
          }}
          mapDisplayMode="immediateMap"
          fontColor={fontColor}
          iconColor={iconColor}
          uiInterFace={uiInterFace}
          config={panelConfig}
          selectRoomData={selectRoomData}
          foldableRoomIds={foldableRoomIds}
          onMapId={this.onMapId}
          onLaserMapPoints={this.onLaserMapPoints}
          onClickSplitArea={this.onClickSplitArea}
          onClickRoom={this.onClickRoom}
        />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'transparent',
    width,
    height: height - (iPhoneX ? cy(145) : cy(115)),
  },
});
