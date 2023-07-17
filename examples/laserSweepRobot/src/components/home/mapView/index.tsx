import React, { Component } from 'react';
import { View, Image } from 'react-native';
import _ from 'lodash';
import { IndoorMap } from '@tuya/rn-robot-map';
import Manager, { Utils as ManagerUtils } from './resourceManager';
import { deepEqual } from '../../../utils';
import Store from '../../../store';

import {
  realTimeAutoTaskWithP2p,
  splitEditMapTaskWithP2p,
  historyTask,
  multiFloorTask,
  config,
} from './config';
import { IProps, IStore, mapDisplayModeEnum } from './config/interface';
import { DrawMap, EmptyMap } from './components/mapLoading';

const { mergeConifg } = ManagerUtils;

interface IMap {
  [index: string]: any;
}
interface IState {
  elementProps: IMap;
  eventProps: IMap;
}

export default class MapView extends Component<IProps, IState> {
  manager: Manager;

  uninstallTask: () => void; // 取消任务执行

  unsubscribeStore: () => void; // 取消订阅store

  unsubscribeProps: () => void; // 取消订阅props

  store: IStore;

  id = new Date().getTime();

  constructor(props: IProps) {
    super(props);
    this.state = {
      elementProps: {},
      eventProps: {},
    };
  }

  componentDidMount() {
    this.initManager();
  }

  shouldComponentUpdate(nextProps: IProps, nextState: IState) {
    const { elementProps } = this.state;
    if (!deepEqual(this.props, nextProps) || !deepEqual(elementProps, nextState.elementProps)) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps: IProps) {
    if (!deepEqual(this.props, prevProps)) {
      const nextConfig = this.getConfig();
      this.manager.updateElementConfigs(nextConfig);
    }
  }

  componentWillUnmount() {
    this.removeManger();
  }

  initManager = () => {
    const { mapDisplayMode } = this.props;
    // done： 需要深合并elementConfigs
    const nextConfig = this.getConfig();
    const autoTask = this.getTask();

    const newConfig = mergeConifg(_.cloneDeep(config), {
      elementConfigs: nextConfig,
      autoTask,
    });
    const manager = new Manager(newConfig);
    this.manager = manager;
    this.uninstallTask = manager.createRunTask();
    this.unsubscribeStore = manager.createStoreSubscription(value => {
      this.store = value;
      if (mapDisplayMode === mapDisplayModeEnum.immediateMap) {
        const cacheData = _.cloneDeep(value);
        Store.MapStoreState.setData(cacheData);
      }
    });
    this.unsubscribeProps = manager.createElementPropsSubscription(value => {
      this.setState({ elementProps: value });
    });

    const elementEvent = manager.getElementEvents();
    this.setState({ eventProps: elementEvent });

    const mapDataCache = Store.MapStoreState.getData;
    if (!_.isEmpty(mapDataCache?.mapData) && mapDisplayMode === mapDisplayModeEnum.splitMap) {
      manager.store.update(mapDataCache, manager.events);
    }
  };

  getManager = () => {
    return this.manager;
  };

  getConfig = () => {
    const {
      uiInterFace,
      history,
      config,
      mapDisplayMode,
      preCustomConfig,
      customConfig,
      selectRoomData,
      foldableRoomIds,
      mapLoadEnd,
      isFreezeMap,
      snapshotImage,
      pathVisible,
      onMapId,
      onLaserMapPoints,
      onClickSplitArea,
      onClickRoom,
      onLoggerInfo,
      onMapLoadEnd,
      onClickMapView,
      onGestureChange,
      onPosPoints,
      onSplitLine,
      onClickModel,
      onModelLoadingProgress,
      onClickRoomMoreProperties,
      onClickRoomProperties,
      onVirtualInfoRendered,
      onRobotPositionChange,
      onRenderContextLost,
      onRenderContextRestored,
      onScreenSnapshot,
    } = this.props;
    return {
      uiInterFace,
      history,
      laserMapPanelConfig: config,
      mapDisplayMode,
      preCustomConfig, // 修改成功前属性信息
      customConfig, // 修改成功后属性信息
      selectRoomData,
      foldableRoomIds,
      mapLoadEnd,
      isFreezeMap,
      snapshotImage,
      pathVisible,
      onMapId,
      onLongPressInAreaView: onLaserMapPoints,
      onLaserMapPoints,
      onClickSplitArea,
      onClickRoom,
      onLoggerInfo,
      onMapLoadEnd,
      onClickMapView,
      onGestureChange,
      onPosPoints,
      onSplitLine,
      onClickModel,
      onModelLoadingProgress,
      onClickRoomMoreProperties,
      onClickRoomProperties,
      onVirtualInfoRendered,
      onRobotPositionChange,
      onRenderContextLost,
      onRenderContextRestored,
      onScreenSnapshot,
    };
  };

  getTask = () => {
    const { mapDisplayMode } = this.props;

    // 根据参数配置,选择数据通道方式
    if (mapDisplayMode === mapDisplayModeEnum.immediateMap) return realTimeAutoTaskWithP2p;
    if (mapDisplayMode === mapDisplayModeEnum.splitMap) return splitEditMapTaskWithP2p;
    if (mapDisplayMode === mapDisplayModeEnum.history) return historyTask;
    if (mapDisplayMode === mapDisplayModeEnum.multiFloor) return multiFloorTask;
    return {};
  };

  removeManger = () => {
    this.uninstallTask && this.uninstallTask();
    this.unsubscribeStore && this.unsubscribeStore();
    this.unsubscribeProps && this.unsubscribeProps();
  };

  render() {
    const {
      fontColor,
      iconColor,
      mapLoadEnd,
      selectRoomData = [],
      snapshotImage,
      pathVisible,
    } = this.props;
    const { elementProps, eventProps } = this.state;
    const { mapData = {} } = this.store || {};
    const { width, height } = mapData || {};
    const isEmpty =
      !!mapData &&
      !_.isEmpty(mapData) &&
      width !== undefined &&
      height !== undefined &&
      (!width || !height);
    const isLoading = (!mapData || _.isEmpty(mapData)) && !mapLoadEnd;
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {isLoading && <DrawMap fontStyle={{ color: fontColor }} iconColor={iconColor} />}
        {isLoading && isEmpty && (
          <EmptyMap fontStyle={{ color: fontColor }} iconColor={iconColor} />
        )}
        {!isLoading && !snapshotImage && (
          <IndoorMap
            mapId={this.id}
            {...elementProps}
            {...eventProps}
            isFreezeMap={false}
            selectRoomData={selectRoomData}
            asynchronousLoadMap={false}
            pathVisible={pathVisible}
          />
        )}
        {snapshotImage && (
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Image
              source={{ uri: snapshotImage.image }}
              style={{ width: snapshotImage.width, height: snapshotImage.height }}
            />
          </View>
        )}
      </View>
    );
  }
}
