/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Utils as NativeUtils, TYText, TYSdk } from 'tuya-panel-kit';
import { observer, inject } from 'mobx-react';
import { IndoorMapUtils, IndoorMapWebApi as LaserUIApi } from '@tuya/rn-robot-map';
import Res from '@res';
import Strings from '@i18n';
import { DPCodes } from '../../config';
import { IPanelConfig } from '../../config/interface';
import Store from '../../store';
import utils from '../../utils/mapStateUtils';
import {
  mapStatusIsVirtualArea,
  mapStatusIsVirtualWall,
  mapStatusIsArea,
  mapStatusIsSelectroom,
} from '../../utils/robotStatus';

const {
  RatioUtils: { convertY: cy, convertX: cx, width },
} = NativeUtils;
const { status: workStatusCode, workMode: workModeCode, nativeMapStatus } = DPCodes;

interface IProps {
  mapStatus: number;
  setMapStatus: (status: number, edit?: boolean) => void;
  taskSW: boolean;
  workStatus: string;
  workMode: string;
  mapId: string;
  RCTAreaList: Array<any>;
  tempAreaList: Array<any>;
  sweepRegionData: Array<any>;
  sweepCount: number;
  mapSize: {
    width: number;
    height: number;
  };
  curPos: { x: number; y: number };
  origin: { x: number; y: number };
  panelConfig: IPanelConfig;
  tipColor: string;
}

interface IState {
  mapStatus: number;
  sweepCount: number;
  addMopVisibleState: boolean;
  addVirtualFunVisibleState: boolean;
  addWallFunVisibleState: boolean;
  addAreaFunVisibleState: boolean;
  showSweepCountBtnState: boolean;
  addAreaIconVisibleState: boolean;
}

@inject(
  ({
    dpState: {
      data: { [workStatusCode]: workStatus, [workModeCode]: workMode },
    },
    panelConfig: { store: panelConfig = {} },
    mapDataState: {
      getData: mapDataState = {
        RCTAreaList: [],
        tempAreaList: [],
        sweepRegionData: [],
        sweepCount: 1,
        mapId: '',
        mapSize: {
          width: 0,
          height: 0,
        },
        curPos: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
      },
    },
    theme: { getData: theme = { tipColor: '#fff' } },
  }) => {
    return {
      workStatus,
      workMode,
      panelConfig,
      RCTAreaList: mapDataState.RCTAreaList,
      tempAreaList: mapDataState.tempAreaList,
      sweepRegionData: mapDataState.sweepRegionData,
      sweepCount: mapDataState.sweepCount,
      mapId: mapDataState.mapId,
      mapSize: mapDataState.mapSize,
      origin: mapDataState.origin,
      curPos: mapDataState.curPos,
      tipColor: theme.tipColor,
    };
  }
)
@observer
export default class HomeMapContral extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      mapStatus: props.mapStatus,
      sweepCount: props.sweepCount,
      addMopVisibleState: this.addMopVisible(props),
      addVirtualFunVisibleState: this.addVirtualFunVisible(props),
      addWallFunVisibleState: this.addWallFunVisible(props),
      addAreaFunVisibleState: this.addAreaFunVisible(props),
      showSweepCountBtnState: this.showSweepCountBtn(props),
      addAreaIconVisibleState: this.addAreaIconVisible(props),
    };
  }

  componentWillReceiveProps = (nextProps: IProps) => {
    const { mapStatus } = this.props;
    if (nextProps.mapStatus !== mapStatus) {
      this.setState({
        mapStatus: nextProps.mapStatus,
        addMopVisibleState: this.addMopVisible(nextProps),
        addVirtualFunVisibleState: this.addVirtualFunVisible(nextProps),
        addWallFunVisibleState: this.addWallFunVisible(nextProps),
        addAreaFunVisibleState: this.addAreaFunVisible(nextProps),
        showSweepCountBtnState: this.showSweepCountBtn(nextProps),
        addAreaIconVisibleState: this.addAreaIconVisible(nextProps),
      });
    }
  };

  getData = () => {
    const { panelConfig } = this.props;
    const { mapStatus } = this.state;
    const {
      forbiddenAreaConfig: {
        virtualWall: { virtualWallAvailable },
      },
    } = panelConfig;
    const data = [
      {
        key: 'virtualArea',
        title: Strings.getLang('virtualArea'),
        value: nativeMapStatus.virtualArea,
        onPress: this.handleClickMap(nativeMapStatus.virtualArea),
        active: mapStatus === nativeMapStatus.virtualArea,
        hidden: false,
      },
      {
        key: 'virtualWall',
        title: Strings.getLang('virtualWall'),
        onPress: this.handleClickMap(nativeMapStatus.virtualWall),
        active: mapStatus === nativeMapStatus.virtualWall,
        hidden: !virtualWallAvailable,
      },
    ];
    return data;
  };

  handleClickMap = (status: number) => () => {
    const { mapId, setMapStatus } = this.props;
    setMapStatus && setMapStatus(DPCodes.nativeMapStatus.virtualArea);
    LaserUIApi.refreshLaserMapStateView({ mapId }).then(() => {
      setMapStatus && setMapStatus(status, true);
      Store.mapDataState.setData({ tempAreaList: [] });
    });
  };

  createLimitByNum = async (type: number, num = 8, tip: string) => {
    try {
      const { RCTAreaList, tempAreaList } = this.props;
      const RCTArr = RCTAreaList.filter((item: { type: number }) => item.type === type);
      const tempArr = tempAreaList.filter((item: { type: number }) => item.type === type);
      const finalArr = RCTArr.concat(tempArr);

      if (finalArr.length >= num) {
        TYSdk.mobile.simpleTipDialog(Strings.formatValue(tip, num), () => { });
        return false;
      }
      return true;
    } catch (error) { }
  };

  /**
   * APP317新增禁区，禁区墙
   * @param opts
   */
  addVirtualArea = async opts => {
    const {
      mapId,
      RCTAreaList,
      tempAreaList,
      sweepRegionData,
      curPos,
      mapSize,
      origin,
      panelConfig,
    } = this.props;

    const {
      forbiddenAreaConfig: {
        sweepForbiddenArea: { sweepForbiddenMinWidth },
      },
    } = panelConfig;

    const {
      mode,
      bgColor,
      borderColor,
      textColor,
      forbiddenMode = nativeMapStatus.virtualArea,
      lineWidth,
    } = opts;

    const areaId = utils.getNewAreaId({
      RCTAreaList,
      tempAreaList,
      type: nativeMapStatus.virtualArea,
    });
    let setForbid;
    const forbidConf: any = {
      mapId,
      areaId,
      curPos,
      origin,
      mapHeight: mapSize.height,
      mapWidth: mapSize.width,
      extendAreaNum: sweepRegionData.length,
      tempAreaList,
      mode,
      bgColor,
      borderColor,
      textColor,
      lineWidth,
      areaWidth: sweepForbiddenMinWidth / 0.1,
    };
    switch (forbiddenMode) {
      case nativeMapStatus.virtualArea:
        setForbid = utils.setMapForbiddenZone(forbidConf);
        break;
      case nativeMapStatus.virtualWall:
        setForbid = utils.setMapVirtualWall(forbidConf);
        break;
      case nativeMapStatus.areaSet:
        setForbid = utils.setMapCleanZone(forbidConf);
        break;
      default:
        null;
    }
    if (setForbid) {
      setForbid.then(({ area }) => {
        if (mapId) {
          Store.mapDataState.setData({ tempAreaList: [...tempAreaList, area] });
        }
      });
    }
  };

  /**
   * 是否显示增加区域icon
   * 条件：1. 模式 === 划区清扫 && taskSw === false
   */
  addAreaIconVisible = props => {
    const { mapStatus } = props;
    const visible = [mapStatusIsVirtualArea, mapStatusIsVirtualWall, mapStatusIsArea].some(fn =>
      fn(mapStatus)
    );
    return visible;
  };

  /**
   * 是否显示禁拖按钮
   */
  addMopVisible = props => {
    const {
      mapStatus,
      panelConfig: {
        forbiddenAreaConfig: {
          mopForbiddenArea: { mopForbiddenAvailable },
          forbiddenAreaProtocolVersion,
        },
      },
    } = props;
    const isVirtual = [mapStatusIsVirtualArea].some(fn => fn(mapStatus));
    return isVirtual && mopForbiddenAvailable && forbiddenAreaProtocolVersion === 'V1.1.0';
  };

  /**
   * 当前状态为添加虚拟墙
   */
  addVirtualFunVisible = props => {
    const { mapStatus } = props;
    const visible = [mapStatusIsVirtualArea].some(fn => fn(mapStatus));
    return visible;
  };

  /**
   * 当前状态为添加虚拟墙
   */
  addWallFunVisible = props => {
    const { mapStatus } = props;
    const visible = [mapStatusIsVirtualWall].some(fn => fn(mapStatus));
    return visible;
  };

  /**
   * 当前状态为添加清扫区域
   */
  addAreaFunVisible = props => {
    const { mapStatus } = props;
    const visible = [mapStatusIsArea].some(fn => fn(mapStatus));
    return visible;
  };

  /**
   * V1.1.0协议划区清扫 || 选区
   */
  showSweepCountBtn = props => {
    const {
      mapStatus,
      panelConfig: {
        selectAreaConfig: { selectAreaProtocolVersion, selectAreaCountAvailable },
        selectRoomConfig: { selectRoomCountAvailable },
      },
    } = props;

    const isArea = [mapStatusIsArea].some(fn => fn(mapStatus));
    const isSelectRoom = [mapStatusIsSelectroom].some(fn => fn(mapStatus));
    const isMapClick = mapStatus === DPCodes.nativeMapStatus.mapClick;
    return (
      (isArea && selectAreaProtocolVersion === 'V1.1.0' && selectAreaCountAvailable) ||
      ((isSelectRoom || isMapClick) && selectRoomCountAvailable)
    );
  };

  handleSweepCountPress = () => {
    const {
      mapStatus,
      panelConfig: {
        selectAreaConfig: { selectAreaTimesMaxNum },
        selectRoomConfig: { selectRoomTimesMaxNum },
      },
    } = this.props;
    const { sweepCount } = this.state;
    let countConfig = 3;
    const isArea = [mapStatusIsArea].some(fn => fn(mapStatus));

    const isSelectRoom = [mapStatusIsSelectroom].some(fn => fn(mapStatus));
    const isMapClick = mapStatus === DPCodes.nativeMapStatus.mapClick;

    if (isArea && selectAreaTimesMaxNum) {
      countConfig = +selectAreaTimesMaxNum;
    }
    if ((isSelectRoom || isMapClick) && selectRoomTimesMaxNum) {
      countConfig = +selectRoomTimesMaxNum;
    }
    this.setState(
      {
        sweepCount: sweepCount === countConfig ? 1 : sweepCount + 1,
      },
      () => Store.mapDataState.setData({ sweepCount })
    );
  };

  renderAreaSet = () => {
    return <View style={styles.row}>{this.getData().map(d => this.renderAreaSetItem(d))}</View>;
  };

  renderAreaSetItem = d => {
    if (d.hidden) return;
    return (
      <TouchableOpacity key={d.key} style={styles.item} onPress={d.onPress}>
        <TYText style={styles.textLarge}>{d.title}</TYText>
        {d.active && <View style={styles.dividerView} />}
      </TouchableOpacity>
    );
  };

  render = () => {
    const {
      mapStatus,
      tipColor,
      panelConfig: {
        forbiddenAreaConfig: { mopForbiddenArea, sweepForbiddenArea, virtualWall },
        selectAreaConfig: { selectAreaBgColor, selectAreaLineColor },
      },
    } = this.props;
    const {
      sweepCount,
      addMopVisibleState,
      addVirtualFunVisibleState,
      addWallFunVisibleState,
      addAreaFunVisibleState,
      showSweepCountBtnState,
      addAreaIconVisibleState,
    } = this.state;

    const statusIsWall =
      mapStatus === nativeMapStatus.virtualArea || mapStatus === nativeMapStatus.virtualWall;
    const statusIsNormal = mapStatus === nativeMapStatus.normal;
    return (
      <View style={styles.mainContainer} pointerEvents="box-none">
        {statusIsWall && this.renderAreaSet()}
        {!statusIsNormal && (
          <TYText style={[styles.textTip, { color: tipColor }]}>
            {Strings.getLang(`mapTip${mapStatus}`)}
          </TYText>
        )}
        {showSweepCountBtnState && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.btnMopAdd}
            onPress={this.handleSweepCountPress}
          >
            <ImageBackground source={Res.addAreaNew} style={styles.imageBg}>
              <TYText style={styles.sweepCountText}>{`× ${sweepCount}`}</TYText>
            </ImageBackground>
            <TYText style={styles.text}>{Strings.getLang('sweepCount')}</TYText>
          </TouchableOpacity>
        )}

        {addMopVisibleState && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.btnMopAdd}
            onPress={() => {
              this.addVirtualArea({
                mode: 'mop',
                bgColor: mopForbiddenArea.mopForbiddenBgColor,
                borderColor: mopForbiddenArea.mopForbiddenLineColor,
              });
            }}
          >
            <ImageBackground source={Res.addAreaNew} style={styles.image}>
              <Image
                source={Res.addIcon}
                style={[styles.image, { tintColor: mopForbiddenArea.mopForbiddenBgColor }]}
              />
            </ImageBackground>
            <TYText style={styles.text}>{Strings.getLang('addMopArea')}</TYText>
          </TouchableOpacity>
        )}
        {addAreaIconVisibleState && (
          <TouchableOpacity
            style={styles.btnAdd}
            activeOpacity={0.8}
            onPress={() => {
              let params = {};
              if (addVirtualFunVisibleState) {
                params = {
                  mode: 'sweep',
                  bgColor: sweepForbiddenArea.sweepForbiddenBgColor,
                  borderColor: sweepForbiddenArea.sweepForbiddenLineColor,
                  forbiddenMode: nativeMapStatus.virtualArea,
                };
              }
              // 虚拟墙
              if (addWallFunVisibleState) {
                params = {
                  mode: 'sweep',
                  bgColor: virtualWall.virtualWallLineColor,
                  forbiddenMode: nativeMapStatus.virtualWall,
                  lineWidth: virtualWall.virtualWallLineWidth,
                };
              }
              // 划区清扫
              if (addAreaFunVisibleState) {
                params = {
                  mode: 'sweep',
                  bgColor: selectAreaBgColor,
                  borderColor: selectAreaLineColor,
                  forbiddenMode: nativeMapStatus.areaSet,
                };
              }
              this.addVirtualArea(params);
            }}
          >
            <ImageBackground source={Res.addAreaNew} style={styles.image}>
              <Image
                source={Res.addIcon}
                style={[
                  styles.image,
                  {
                    tintColor: addAreaFunVisibleState
                      ? selectAreaBgColor
                      : virtualWall.virtualWallLineColor,
                  },
                ]}
              />
            </ImageBackground>
            <TYText style={styles.text}>{Strings.getLang(`addArea${mapStatus}`)}</TYText>
          </TouchableOpacity>
        )}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: cy(60),
    marginTop: cy(20),
  },

  btnMopAdd: {
    position: 'absolute',
    right: cx(30),
    bottom: cy(80),
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnAdd: {
    position: 'absolute',
    right: cx(30),
    bottom: cy(30),
    justifyContent: 'center',
    alignItems: 'center',
  },

  item: {
    alignItems: 'center',
    marginHorizontal: cx(10),
    height: cy(50),
  },

  image: {
    width: cx(40),
    height: cx(40),
    resizeMode: 'contain',
  },

  imageBg: {
    width: cx(40),
    height: cx(40),
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
  },

  text: {
    fontSize: cx(10),
    marginTop: cy(5),
  },

  textLarge: {
    fontSize: cx(17),
  },

  textTip: {
    fontSize: cx(14),
    position: 'absolute',
    bottom: cy(30),
  },

  dividerView: {
    backgroundColor: '#717BFF',
    width: cx(10),
    height: cy(3),
    marginTop: cy(5),
  },
  sweepCountText: {
    fontSize: cx(16),
    color: 'rgb(70,133,255)',
  },
});
