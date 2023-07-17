/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty */
/* eslint-disable no-return-await */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { observer, inject } from 'mobx-react';
import once from 'lodash/once';
import { reaction } from 'mobx';
import _ from 'lodash';
import Res from '@res';
import Strings from '@i18n';
import { IndoorMapUtils, IndoorMapWebApi as LaserUIApi } from '@tuya/rn-robot-map';
import { mapSplitStateEnum } from '@tuya/rn-robot-map/lib/indoor-map-webview/api';
import { DPCodes, getEnum } from '../../config';
import { IPanelConfig } from '../../config/interface';
import {
  getCommonData,
  encodeVRSuccess,
  encodeRoomClean,
  getRoomClean,
  getRoomSuccess,
} from '../../utils';
import { createDpValue$ } from '../../protocol/utils';
import Button from '../buttonComponent';
import Store from '../../store';
import {
  robotIsAreaing,
  robotIsPointing,
  robotIsAutoRunPause,
  robotIsParting,
  robotIsPointArrived,
  robotIsPointUnarrived,
  robotIsPointPause,
  robotIsPartPause,
  robotIsAreaPause,
  robotIsToCharingPause,
  robotIsToCharing,
  robotIsCharing,
  robotIsSelectRoomPaused,
  robotIsSelectRoom,
  isRobotChargeDirect,
  isRobotQuiet,
  mapStatusIsPoint,
  mapStatusIsArea,
} from '../../utils/robotStatus';

const { convertY: cy, convertX: cx, convert, viewWidth } = Utils.RatioUtils;
const { workModeEnum } = DPCodes;

function createTextByKey(key) {
  return Strings.getLang(key);
}
const {
  status: workStatusCode,
  cleanSwitch: cleanSwitchCode,
  pauseSwitch: pauseSwitchCode,
  workMode: workModeCode,
  robotStatus: robotStatusCode,
  chargeSwitch: chargeSwitchCode,
} = DPCodes;

interface IProps {
  cleanSwitch: boolean;
  pauseSwitch: boolean;
  mode: string;
  workMode: string;
  mapStatus: number;
  setMapStatus: (status: number, edit?: boolean) => Promise<void>;
  origin: { x: number; y: number };
  workStatus: string;
  robotStatus: string;
  roomSelectShow: boolean;
  mapId: string;
  panelConfig: IPanelConfig;
  selectRoomData: Array<string>;
  sweepCount: number;
}

interface IState {
  setVRPressed: boolean;
}
@inject((state: any) => {
  const {
  dpState: { getData: dpState },
  panelConfig: { store: panelConfig = {} },
  mapDataState: { getData: mapDataState = {} },
  } = state;
  const { [workStatusCode]: workStatus, [robotStatusCode]: robotStatus } = dpState;
  return {
  cleanSwitch: dpState[cleanSwitchCode],
  mode: dpState[DPCodes.mode],
  workMode: dpState[workModeCode],
  pauseSwitch: dpState[pauseSwitchCode],
  workStatus,
  robotStatus,
  panelConfig,
  sweepCount: mapDataState.sweepCount,
  mapId: mapDataState.mapId,
  selectRoomData: mapDataState.selectRoomData,
  origin: mapDataState.origin,
  };
  })
@observer
export default class ControllerBarView extends Component<IProps, IState> {
  mapScale: number;

  timer: number;

  msgSubscription: any;

  constructor(props: IProps) {
    super(props);
    this.mapScale = TYSdk.device.getFunConfig().panelFunMapScale || 1;
    this.state = {
      setVRPressed: false,
    };
  }

  componentDidMount() {
    reaction(
      () => [this.props.workMode, this.props.robotStatus, this.props.cleanSwitch, this.props.mapId],
      async ([workMode, robotStatus, cleanSwitch]) => {
        if (
          workMode === 'smart' &&
          (mapStatusIsPoint(this.props.mapStatus) || mapStatusIsArea(this.props.mapStatus))
        ) {
          this.props.setMapStatus(DPCodes.nativeMapStatus.normal, false);
          await LaserUIApi.refreshLaserMapStateView({ mapId: this.props.mapId }).then(async () => {
            await this.props.setMapStatus(DPCodes.nativeMapStatus.normal);
            Store.mapDataState.setData({ tempAreaList: [] });
          });
        }
        if (!cleanSwitch || !this.props.mapId) return;
        if (
          [robotIsPointPause, robotIsPointArrived, robotIsPointUnarrived, robotIsPartPause].some(
            fn => fn(workMode, robotStatus)
          )
        ) {
          this.props.setMapStatus(DPCodes.nativeMapStatus.pressToRun);
        }
        if ([robotIsAreaPause].some(fn => fn(workMode, robotStatus))) {
          this.props.setMapStatus(DPCodes.nativeMapStatus.areaSet, true);
        }
        if ([robotIsSelectRoomPaused, robotIsSelectRoom].some(fn => fn(workMode, robotStatus))) {
          await this.props.setMapStatus(DPCodes.nativeMapStatus.mapClick, true);
          await LaserUIApi.setLaserMapSplitType(IndoorMapUtils.getMapInstance(this.props.mapId), {
            mapId: this.props.mapId,
            state: mapSplitStateEnum.click,
          });
          TYSdk.device.putDeviceData({
            [DPCodes.commText]: getRoomClean(),
          });
        }
      },
      { equals: _.isEqual }
    );

    this.msgSubscription = createDpValue$(DPCodes.commText, false).subscribe((v: string) => {
      if (v) {
        const { setVRPressed } = this.state;
        if (getRoomSuccess(v)) {
          const { count, roomIds } = getRoomSuccess(v) || { count: 1, roomIds: [] };
          Store.mapDataState.setData({ selectRoomData: roomIds, sweepCount: count });
        }
        if (encodeVRSuccess(v) && this.setVirtualStatus() && setVRPressed) {
          setTimeout(() => {
            const { setMapStatus } = this.props;
            setMapStatus && setMapStatus(DPCodes.nativeMapStatus.virtualArea);
            LaserUIApi.refreshLaserMapStateView({ mapId: this.props.mapId }).then(() => {
              setMapStatus && setMapStatus(DPCodes.nativeMapStatus.normal);
              Store.mapDataState.setData({ tempAreaList: [] });
            });
            TYSdk.mobile.hideLoading();
            this.setState({
              setVRPressed: false,
            });
            this.timer && clearTimeout(this.timer);
          }, 500);
        }
      }
    });
  }

  componentWillReceiveProps(nextProps: any) {
    const { robotStatus, mode } = this.props;
    if (mode !== nextProps.mode || robotStatus !== nextProps.robotStatus) {
      this.listenRobotStatus(nextProps.mode, nextProps.robotStatus);
    }
  }

  componentWillUnmount() {
    this.msgSubscription && this.msgSubscription.unsubscribe();
  }

  // eslint-disable-next-line react/sort-comp
  listenRobotStatus = (mode, robotStatus) => {
    const { setMapStatus } = this.props;
    const { normal } = DPCodes.nativeMapStatus;
    if ([robotIsPointing, robotIsAreaing, robotIsParting].some(fn => fn(mode, robotStatus))) {
      setMapStatus(normal);
    }
  };

  onCancelPress = async () => {
    const { mapId, setMapStatus } = this.props;
    await LaserUIApi.refreshLaserMapStateView({ mapId }).then(async () => {
      await setMapStatus(DPCodes.nativeMapStatus.normal);
      Store.mapDataState.setData({ tempAreaList: [] });
    });
  };

  handleResumeStart = () => {
    TYSdk.device.putDeviceData({ [pauseSwitchCode]: false });
  };

  handlePause = (mapStatus: number) => {
    const { setMapStatus } = this.props;
    TYSdk.device.putDeviceData({ [pauseSwitchCode]: true });
    setMapStatus(mapStatus, true);
  };

  /**
   * 选区清扫暂停
   * @param mapStatus
   */
  handleSelectRoomPause = (mapStatus: number) => {
    const { setMapStatus } = this.props;
    TYSdk.device.putDeviceData({ [pauseSwitchCode]: true });
    setMapStatus(mapStatus, true);
  };

  onFinishPress = async () => {
    const { setMapStatus, mapId, robotStatus } = this.props;
    const fun = async () => {
      TYSdk.device.putDeviceData({
        [cleanSwitchCode]: false,
      });
      await LaserUIApi.refreshLaserMapStateView({ mapId }).then(async () => {
        await setMapStatus(DPCodes.nativeMapStatus.normal, false);
      });
      setTimeout(() => {
        Store.mapDataState.setData({
          tempAreaList: [],
          selectRoomData: [],
        });
      }, 1000);
    };
    if (isRobotQuiet(robotStatus)) {
      await fun();
    } else {
      TYSdk.mobile.simpleConfirmDialog(
        Strings.getLang('shouldOff'),
        Strings.getLang('offTip'),
        async () => await fun(),
        () => {}
      );
    }
  };

  onModePress = (mode: string) => {
    const data = { [DPCodes.mode]: mode };
    TYSdk.device.putDeviceData(data);
  };

  /**
   * 开启loading，并设置超时20s
   */
  startLoading = () => {
    TYSdk.mobile.showLoading();
    this.timer = setTimeout(() => {
      const { setMapStatus, mapId } = this.props;
      setMapStatus && setMapStatus(DPCodes.nativeMapStatus.virtualArea);
      LaserUIApi.refreshLaserMapStateView({ mapId }).then(() => {
        setMapStatus && setMapStatus(DPCodes.nativeMapStatus.normal);
        Store.mapDataState.setData({ tempAreaList: [] });
      });
      TYSdk.mobile.hideLoading();
    }, 20000);
  };

  createLimitByNum = async (data: Array<any>, num = 8, tip: string) => {
    try {
      if (data.length > num) {
        TYSdk.mobile.simpleTipDialog(Strings.formatValue(tip, num), () => {});
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  /**
   * @param minCount 最低多少个点
   */
  putPointData = async (minCount: number) => {
    try {
      const { sweepCount, origin, mapStatus, panelConfig, mapId } = this.props;
      const {
        forbiddenAreaConfig: {
          sweepForbiddenArea: { sweepForbiddenMaxNum },
          virtualWall: { virtualWallMaxNum },
        },
        selectAreaConfig: { selectAreaMaxNum },
      } = panelConfig;
      const { data } = await LaserUIApi.getLaserMapPointsInfo(
        IndoorMapUtils.getMapInstance(mapId),
        { mapId }
      );
      let countLimit = false;
      switch (mapStatus) {
        case DPCodes.nativeMapStatus.virtualArea:
          countLimit = await this.createLimitByNum(
            data,
            sweepForbiddenMaxNum,
            'maxForbiddenZoneNumber'
          );
          break;
        case DPCodes.nativeMapStatus.virtualWall:
          countLimit = await this.createLimitByNum(data, virtualWallMaxNum, 'maxVirtualWallNumber');
          break;
        case DPCodes.nativeMapStatus.areaSet:
          countLimit = await this.createLimitByNum(data, selectAreaMaxNum, 'maxSweepAreaNumber');
          break;
        default:
          countLimit = false;
      }
      if (countLimit) return;
      if (this.setVirtualStatus()) {
        this.startLoading();
        this.setState({
          setVRPressed: true,
        });
      }
      let dataArr: any = [];
      if (this.isNewProto() && mapStatus === DPCodes.nativeMapStatus.virtualArea) {
        dataArr = data;
      } else {
        data.forEach(i => dataArr.push(i.points));
      }
      const putFn = once(() => {
        const params = {
          status: mapStatus,
          data: dataArr,
          origin,
          mapScale: this.mapScale,
          newVersion: this.isNewProto(),
          count: sweepCount,
        };
        TYSdk.device.putDeviceData({
          [DPCodes.commText]: getCommonData(params),
        });
      });

      if (minCount && dataArr.length < minCount) {
        throw new Error('----dataArr.length');
      }
      putFn();
    } catch (error) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('pleaseSetPoint'), () => {});
      throw error;
    }
  };

  /**
   * 判断是否使用新协议
   */
  isNewProto() {
    const {
      mapStatus,
      panelConfig: {
        forbiddenAreaConfig: { forbiddenAreaProtocolVersion },
        selectAreaConfig: { selectAreaProtocolVersion },
      },
    } = this.props;
    if (mapStatus === DPCodes.nativeMapStatus.virtualArea) {
      return forbiddenAreaProtocolVersion === 'V1.1.0';
    }
    if (mapStatus === DPCodes.nativeMapStatus.areaSet) {
      return selectAreaProtocolVersion === 'V1.1.0';
    }
    return false;
  }

  /**
   * 处于设置虚拟墙和虚拟区域状态
   */
  setVirtualStatus = () => {
    const { mapStatus } = this.props;
    const statusIsWall =
      mapStatus === DPCodes.nativeMapStatus.virtualArea ||
      mapStatus === DPCodes.nativeMapStatus.virtualWall;
    return statusIsWall;
  };

  handlePointPartClean() {
    TYSdk.device.putDeviceData({ [workModeCode]: getEnum(workModeCode, 'part') });
  }

  handlePointStart = async () => {
    await this.putPointData(1);
  };

  handleAreaStart = async () => {
    await this.putPointData(1);
  };

  renderItem = d => {
    return (
      <TouchableOpacity style={styles.item} key={d.key} onPress={d.onPress}>
        <TYText style={[styles.text, { color: d.color }]}>{d.title}</TYText>
      </TouchableOpacity>
    );
  };

  renderStatusWall = () => {
    const dataSource = [
      {
        key: 'cancel',
        image: Res.finish,
        onPress: this.onCancelPress,
      },
      { key: 'save', image: Res.save, onPress: this.putPointData },
    ].map((item, idx, arr) => {
      const { key } = item;
      const { length } = arr;
      const style = [
        styles.statusBtn,
        {
          width: viewWidth / length,
        },
      ];
      const text = Strings.getLang(key);
      return { ...item, style, text, textStyle: styles.btnTextStyle };
    });
    return <View style={styles.statusWallBox}>{this.renderButtonGroup(dataSource)}</View>;
  };

  renderPointClean = () => {
    const { workMode, robotStatus } = this.props;
    const judgeStartOrPause = () => {
      // const isPause = robotIsPointPause(workMode, robotStatus);
      const idDoing = robotIsPointing(workMode, robotStatus);
      // isPause; unDoing
      const willStart = {
        key: 'goHere',
        image: Res.go,
        onPress: this.handlePointStart,
        disabledFn: () => robotIsParting(workMode, robotStatus),
      };

      const willPause = {
        key: 'pause',
        image: Res.pauseIcon,
        onPress: () => this.handlePause(DPCodes.nativeMapStatus.pressToRun),
      };
      return idDoing ? willPause : willStart;
    };

    const bars = [
      {
        key: 'back',
        image: Res.finish,
        onPress: this.onFinishPress,
      },
      judgeStartOrPause(),
    ].map((item: any) => {
      let disabled = false;
      if (item.disabledFn) {
        disabled = item.disabledFn();
      }
      const config = {
        style: [styles.statusBtn, { flex: 1 }],
        text: createTextByKey(item.key),
        textStyle: styles.btnTextStyle,
        disabled,
      };
      return {
        ...config,
        ...item,
      };
    });
    return this.renderButtonGroup(bars);
  };

  renderAreaClean = () => {
    const { workMode, robotStatus } = this.props;
    const judgeStartOrPause = () => {
      // const isPause = robotIsAreaPause(workMode, robotStatus);
      const idDoing = robotIsAreaing(workMode, robotStatus);

      // isPause; unDoing
      const willStart = {
        key: 'goHere',
        image: Res.go,
        // onPress: isPause ? this.handleResumeStart : this.handleAreaStart,
        onPress: this.handleAreaStart,
      };

      const willPause = {
        key: 'pause',
        image: Res.pauseIcon,
        onPress: () => this.handlePause(DPCodes.nativeMapStatus.areaSet),
      };
      return idDoing ? willPause : willStart;
    };

    const bars = [
      {
        key: 'back',
        image: Res.finish,
        onPress: this.onFinishPress,
      },
      judgeStartOrPause(),
    ].map(item => {
      const config = {
        style: [styles.statusBtn, { flex: 1 }],
        text: createTextByKey(item.key),
        textStyle: styles.btnTextStyle,
      };
      return {
        ...config,
        ...item,
      };
    });
    return this.renderButtonGroup(bars);
  };

  handleSelectRoomStart = async () => {
    const { selectRoomData, sweepCount } = this.props;
    try {
      if (selectRoomData.length >= 32) return; // 不能超过32个房间
      if (selectRoomData.length === 0) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('pleaseSelectRoom'), () => {});
      }
      const data = encodeRoomClean(selectRoomData, sweepCount);
      TYSdk.device.putDeviceData({ [DPCodes.commText]: data });
    } catch (error) {
      console.warn(error);
    }
  };

  renderSelectRoom = () => {
    const { workMode, robotStatus } = this.props;
    const judgeStartOrPause = () => {
      const isDoing = robotIsSelectRoom(workMode, robotStatus);
      // const isPause = robotIsSelectRoomPaused(workMode, robotStatus);

      const willStart = {
        key: 'home_selectRoomClen_btn',
        image: Res.go,
        onPress: this.handleSelectRoomStart,
      };

      const willPause = {
        key: 'pause',
        image: Res.pauseIcon,
        onPress: () => this.handleSelectRoomPause(DPCodes.nativeMapStatus.selectRoom),
      };
      return isDoing ? willPause : willStart;
    };
    // const isCurMode = () => workModeEnum.selectRoom === workMode;

    const bars = [
      {
        key: 'back',
        image: Res.finish,
        onPress: this.onFinishPress,
      },
      judgeStartOrPause(),
    ].map(item => {
      const config = {
        style: [styles.statusBtn, { flex: 1 }],
        text: createTextByKey(item.key),
        textStyle: styles.btnTextStyle,
      };
      return {
        ...config,
        ...item,
      };
    });
    return this.renderButtonGroup(bars);
  };

  handleAutoRun = (mode, isStart) => {
    // 1. 下发 {pauseswitch: true, cleanswitch: true}
    // 2. 上报 {cleanswitch: true, pauseswitch: true, cleanmode: "smart", robotStatus: "totaling",}
    const { workMode, robotStatus } = this.props;
    if (!isStart) {
      // 开启
      if (robotIsAutoRunPause(workMode, robotStatus)) {
        TYSdk.device.putDeviceData({ [pauseSwitchCode]: false });
      } else {
        TYSdk.device.putDeviceData({
          [workModeCode]: getEnum(workModeCode, 'smart'),
          [cleanSwitchCode]: true,
        });
      }
    } else {
      // 暂停
      TYSdk.device.putDeviceData({ [cleanSwitchCode]: false });
    }
  };

  handleBackCharge = (mode: string, isStart: boolean) => {
    const { workMode, robotStatus } = this.props;

    if (TYSdk.device.getDpIdByCode(chargeSwitchCode)) {
      // 如果有chargeSwitchCode dp，走新回充逻辑
      // 1. 开启回充-回充电桩 charge_switch = true
      // 2. 暂停回充-未到充电桩 pause_switch = true
      // 3. 恢复回充-未到充电桩 pause_switch = false
      // 4. 取消回充 charge_switch = false
      if (robotIsToCharingPause(workMode, robotStatus)) {
        // 条件3
        TYSdk.device.putDeviceData({ [pauseSwitchCode]: false });
        return;
      }
      if (robotIsToCharing(workMode, robotStatus)) {
        // 条件2
        TYSdk.device.putDeviceData({ [pauseSwitchCode]: true });
        return;
      }
      if (robotIsCharing(workMode, robotStatus)) {
        // 条件4
        TYSdk.device.putDeviceData({ [chargeSwitchCode]: false });
        return;
      }
      // 条件1

      if (isRobotChargeDirect(robotStatus)) {
        TYSdk.device.putDeviceData({ [chargeSwitchCode]: true });
      } else {
        TYSdk.mobile.simpleConfirmDialog(
          Strings.getLang('backChargeTitleTip'),
          Strings.getLang('backChargeTip'),
          () => {
            TYSdk.device.putDeviceData({ [chargeSwitchCode]: true });
          },
          () => {}
        );
      }
      // TYSdk.device.putDeviceData({ [chargeSwitchCode]: true });
    } else if (isStart) {
      TYSdk.device.putDeviceData({
        [cleanSwitchCode]: false,
      });
    } else {
      const chargeModeEnum = getEnum(workModeCode, 'backCharge');
      const cmd = {
        [workModeCode]: chargeModeEnum,
        [cleanSwitchCode]: true,
      };
      if (isRobotChargeDirect(robotStatus)) {
        TYSdk.device.putDeviceData(cmd);
      } else {
        TYSdk.mobile.simpleConfirmDialog(
          Strings.getLang('backChargeTitleTip'),
          Strings.getLang('backChargeTip'),
          () => {
            TYSdk.device.putDeviceData(cmd);
          },
          () => {}
        );
      }
    }
  };

  handleMapStatus = (mapStatus: number) => async () => {
    const { mapId, setMapStatus } = this.props;
    const isSelectroom = mapStatus === DPCodes.nativeMapStatus.mapClick;
    await setMapStatus(mapStatus, true);
    isSelectroom &&
      (await LaserUIApi.setLaserMapSplitType(IndoorMapUtils.getMapInstance(mapId), {
        mapId,
        state: mapSplitStateEnum.click,
      }));
  };

  renderButtonGroup = (dataSource: Array<any>) => {
    return dataSource.map(({ key, ...rest }) => <Button key={key} {...rest} />);
  };

  renderModeBtns = () => {
    const {
      workModeEnum: { smart, pose, zone, backCharge },
      robotStatusEnum: { totaling, totalingStandard, toCharge, charging, fullCharge, pause },
    } = DPCodes;

    const { pressToRun, areaSet, selectRoom, mapClick } = DPCodes.nativeMapStatus;
    const { robotStatus, workMode, mapId, panelConfig } = this.props;
    const {
      selectRoomConfig: { selectRoomAvailable },
      selectPointConfig: { selectPointAvailable },
      selectAreaConfig: { selectAreaAvailable },
    } = panelConfig || {};

    function loop() {}

    function autorunIsStart(status: string) {
      return status !== pause && (status === totaling || status === totalingStandard);
    }

    function backChargeIsStart(status: string) {
      return robotIsToCharing(workMode, status);
    }

    function pointOrPartIsDisabledFn(status: string) {
      return !mapId || autorunIsStart(status) || robotIsToCharing(workMode, status);
    }

    function autoRunDisabledFn(status: string) {
      return robotIsToCharing(workMode, status);
    }

    function backChargeDisabledFn(status: string) {
      return [charging, fullCharge].includes(status);
    }

    const btns = [
      {
        mode: smart,
        image: Res.autoIcon,
        onPress: this.handleAutoRun,
        isStartFn: autorunIsStart,
        hidden: false,
        disabledFn: autoRunDisabledFn,
      },
      {
        mode: pose,
        image: Res.pointIcon,
        disabledFn: pointOrPartIsDisabledFn,
        hidden: !selectPointAvailable,
        onPress: this.handleMapStatus(pressToRun),
      },
      {
        mode: String(selectRoom),
        image: Res.selectRoom,
        disabledFn: pointOrPartIsDisabledFn,
        hidden: !selectRoomAvailable,
        onPress: this.handleMapStatus(mapClick),
      },
      {
        mode: zone,
        image: Res.partIcon,
        disabledFn: pointOrPartIsDisabledFn,
        hidden: !selectAreaAvailable,
        onPress: this.handleMapStatus(areaSet),
      },
      {
        mode: workModeEnum.backCharge,
        image: Res.chargeIcon,
        isStartFn: backChargeIsStart,
        onPress: this.handleBackCharge,
        hidden: false,
        disabledFn: backChargeDisabledFn,
      },
    ];
    const nodes = btns.map(
      ({ mode, image, hidden, onPress = loop, isStartFn = loop, disabledFn = loop, ...rest }) => {
        const text = Strings.getDpLang(DPCodes.mode, mode);
        const isStart = !!isStartFn(robotStatus);
        const startOrPauseImg = isStart ? Res.pauseIcon : image;
        const len = btns.filter(i => !i.hidden).length;
        const disabled = !!disabledFn(robotStatus);
        if (hidden) return;
        return (
          <Button
            key={mode}
            style={{ width: viewWidth / len }}
            image={startOrPauseImg}
            imageStyle={styles.btnImageStyle}
            text={text}
            textStyle={styles.btnTextStyle}
            onPress={() => onPress(mode, isStart)}
            disabled={disabled}
            {...rest}
          />
        );
      }
    );
    return nodes;
  };

  renderContentByMapStatus = (mapStatus: number) => {
    const { workMode, robotStatus, cleanSwitch } = this.props;
    const { virtualArea, virtualWall, normal, pressToRun, areaSet, selectRoom, mapClick } =
      DPCodes.nativeMapStatus;
    if (
      cleanSwitch &&
      [
        robotIsPointing,
        robotIsPointArrived,
        robotIsPointUnarrived,
        robotIsParting,
        robotIsPointPause,
        robotIsPartPause,
      ].some(fn => fn(workMode, robotStatus))
    ) {
      return this.renderPointClean();
    }
    if (cleanSwitch && [robotIsAreaPause, robotIsAreaing].some(fn => fn(workMode, robotStatus))) {
      return this.renderAreaClean();
    }
    if (
      cleanSwitch &&
      [robotIsSelectRoomPaused, robotIsSelectRoom].some(fn => fn(workMode, robotStatus))
    ) {
      return this.renderSelectRoom();
    }
    const options = {
      [virtualArea]: this.renderStatusWall,
      [virtualWall]: this.renderStatusWall,
      [normal]: this.renderModeBtns,
      [pressToRun]: this.renderPointClean,
      [areaSet]: this.renderAreaClean,
      [selectRoom]: this.renderSelectRoom,
      [mapClick]: this.renderSelectRoom,
      default: this.renderModeBtns,
    };
    const genView = options[mapStatus] || options.default;

    return genView();
  };

  render() {
    const { mapStatus } = this.props;
    return <View style={styles.container}>{this.renderContentByMapStatus(mapStatus)}</View>;
  }
}
const styles = StyleSheet.create({
  container: {
    height: cy(80),
    justifyContent: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  btnImageStyle: {
    width: convert(48),
    height: convert(48),
  },
  btnTextStyle: {
    fontSize: cx(12),
    color: '#5D6681',
    backgroundColor: 'transparent',
    marginTop: convert(10),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: cx(25),
  },

  text: {
    fontSize: cx(12),
    color: '#5D6681',
    backgroundColor: 'transparent',
  },

  statusBtn: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  statusWallBox: {
    flex: 1,
    flexDirection: 'row',
  },
});
