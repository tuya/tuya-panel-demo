/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component, Ref } from 'react';
import { StyleSheet, View, AppState, AppStateStatus } from 'react-native';
import { observer, inject } from 'mobx-react';
import { Utils, TYSdk } from 'tuya-panel-kit';
import Strings from '@i18n';
import { sweeperP2pInstance } from '@api';
import { protocolUtil } from '@protocol';
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
const { logger } = protocolUtil;
const {
  robotStatus: robotStatusCode,
  workMode: workModeCode,
  customizeModeSwitch: customizeModeSwitchCode,
} = DPCodes;
interface IProps {
  mapId: string;
  mapStatus: number;
  robotStatus: string;
  workMode: string;
  customizeModeSwitch: boolean;
  panelConfig: IPanelConfig;
  curPos: { x: number; y: number };
  origin: { x: number; y: number };
  pilePosition: { x: number; y: number };
  selectRoomData: Array<string>;
  foldableRoomIds: Array<string>;
  fontColor: string;
  iconColor: string;
}

interface IState {
  mapLoadEnd: boolean;
}

@inject((state: any) => {
  const {
  panelConfig: { store: panelConfig = {} },
  customConfig: { store: customConfig = {} },
  dpState: { getData: dpState },
  mapDataState: { getData: mapDataState = {} },
  theme: { getData: theme = {} },
  } = state;
  const {
  [robotStatusCode]: robotStatus,
  [workModeCode]: workMode,
  [customizeModeSwitchCode]: customizeModeSwitch,
  } = dpState;
  const { mapId, curPos, origin, pilePosition, selectRoomData, foldableRoomIds } = mapDataState;

  return {
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
export default class HomeMapView extends Component<IProps, IState> {
  mapRef: Ref<MapView>;

  isInit: boolean;

  isAppEnterBackground: boolean;

  appState: AppStateStatus;

  previousAppState: AppStateStatus;

  timer: any;

  constructor(props) {
    super(props);
    this.state = {
      mapLoadEnd: false,
    };
  }

  eventChange = async (newAppState: AppStateStatus) => {
    if (newAppState === 'background') {
      logger.info('【HomeMapView】 => onAppHide');
      this.isAppEnterBackground = true;
      if (this.isInit) {
        this.timer = setTimeout(() => {
          logger.info('【HomeMapView】 => Timer has been exe');
          if (this.isAppEnterBackground) {
            this.unmount();
          }
          clearTimeout(this.timer);
          this.timer = null;
        }, 20 * 1000);
      }
    } else if (newAppState === 'active') {
      logger.info('【HomeMapView】 => onAppShow');
      this.isAppEnterBackground = false;
      if (!this.isInit) {
        this.isInitP2p();
      }
    }
  };

  registerVisibilityEvent = () => {
    AppState.addEventListener('change', this.eventChange);
  };

  removeVisibilityEvent = () => {
    AppState.removeEventListener('change', this.eventChange);
  };

  isInitP2p = async () => {
    this.isInit = await sweeperP2pInstance.initP2pSdk();
    // 采用p2p 传输协议进行数据传输
    if (this.isInit) {
      logger.info('【HomeMapView】 => P2p start connecting');
      sweeperP2pInstance.connectDevice(
        () => {
          sweeperP2pInstance.startObserverSweeperDataByP2P(1);
          sweeperP2pInstance.onSessionStatusChange(sweeperP2pInstance.sessionStatusCallback);
        },
        () => {
          sweeperP2pInstance.reconnectP2p(() => {
            sweeperP2pInstance.startObserverSweeperDataByP2P(1);
            // 这里失败重连需要注册断开重连的事件
            sweeperP2pInstance.onSessionStatusChange(sweeperP2pInstance.sessionStatusCallback);
          });
        }
      );
    }
  };

  /**
   * 销毁P2p
   */
  unmount = async () => {
    logger.info('【HomeMapView】 => Component has been started unmount');
    this.isInit = false;
    await sweeperP2pInstance.stopObserverSweeperDataByP2P();
    await sweeperP2pInstance.deInitP2PSDK();
  };

  async componentDidMount() {
    logger.info('【HomeMapView】 => Component has been started initP2p');
    this.registerVisibilityEvent();
    await this.isInitP2p();

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

  /**
   * 组件销毁时注销P2p
   */
  async componentWillUnmount() {
    this.removeVisibilityEvent();
    await this.unmount();
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
  onMapId = (data: { mapId: string; dataMapId: number }) => {
    Store.mapDataState.setData({ mapId: data.mapId, dataMapId: data.dataMapId });
  };

  onMapLoadEnd = (success: boolean) => {
    logger.info('【HomeMapView】 ==> onMapLoadEnd');
    this.setState({ mapLoadEnd: success });
  };

  /**
   * 获取禁区等信息并更新
   * @param data
   */
  onAreaInfoList = (data: any) => {
    Store.mapDataState.setData({ RCTAreaList: data });
  };

  onClickSplitArea = (data: any) => {
    const { selectRoomData, robotStatus } = this.props;
    if (!isRobotQuiet(robotStatus)) return;
    if (!data || !data.length || !Array.isArray(data)) return;
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

  onLoggerInfo = (data: { info: string; theme: string; args: any }) => {
    if (data) {
      console.log(data.info || '', data.theme || '', ...Object.values(data.args || {}));
    }
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
    const { mapLoadEnd } = this.state;

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
      isCustomizeMode: true,
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
          onMapLoadEnd={this.onMapLoadEnd}
          onLaserMapPoints={this.onLaserMapPoints}
          onClickSplitArea={this.onClickSplitArea}
          onClickRoom={this.onClickRoom}
          onLoggerInfo={this.onLoggerInfo}
          mapLoadEnd={mapLoadEnd}
          pathVisible={true}
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
