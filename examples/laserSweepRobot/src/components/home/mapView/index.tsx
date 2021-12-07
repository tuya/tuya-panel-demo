import React, { Component } from 'react';
import _ from 'lodash';
import Manager, { Utils as ManagerUtils } from './resourceManager';
import { deepEqual } from '../../../utils';

import { realTimeAutoTask, splitEditMapTask, historyTask, multiFloorTask, config } from './config';
import { IProps, IStore, mapDisplayModeEnum } from './config/interface';
import { DrawMap, EmptyMap } from './components/mapLoading';
import RCTLaserMap from '../../rctLaserMap';

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
    });
    this.unsubscribeProps = manager.createElementPropsSubscription(value => {
      this.setState({ elementProps: value });
    });

    const elementEvent = manager.getElementEvents();
    this.setState({ eventProps: elementEvent });
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
      onMapId,
      onLaserMapPoints,
      onClickSplitArea,
      onClickRoom,
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
      onMapId,
      onLongPressInAreaView: onLaserMapPoints,
      onLaserMapPoints,
      onClickSplitArea,
      onClickRoom,
    };
  };

  getTask = () => {
    const { mapDisplayMode } = this.props;
    if (mapDisplayMode === mapDisplayModeEnum.immediateMap) return realTimeAutoTask;
    if (mapDisplayMode === mapDisplayModeEnum.splitMap) return splitEditMapTask;
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
    const { fontColor, iconColor } = this.props;
    const { elementProps, eventProps } = this.state;
    const { mapData = {} } = this.store || {};
    const { width, height } = mapData || {};
    const showLoading = !mapData;
    const isEmpty = !width || !height;
    if (showLoading) {
      return <DrawMap fontStyle={{ color: fontColor }} iconColor={iconColor} />;
    }
    if (isEmpty) {
      return <EmptyMap fontStyle={{ color: fontColor }} iconColor={iconColor} />;
    }
    return <RCTLaserMap key={this.id} {...elementProps} {...eventProps} />;
  }
}
