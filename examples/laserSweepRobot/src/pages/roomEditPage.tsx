/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYSdk, TYText } from 'tuya-panel-kit';
import { IndoorMapUtils, IndoorMapWebApi as LaserUIApi } from '@tuya/rn-robot-map';
import { mapSplitStateEnum } from '@tuya/rn-robot-map/lib/indoor-map-webview/api';
import { observer, inject } from 'mobx-react';
import Strings from '@i18n';
import { createDpValue$ } from '../protocol/utils';
import { Button, Rename, Toast } from '../components';
import store from '../store';
import {
  encodeRoomSplit,
  encodeRoomMerge,
  encodeRoomReset,
  encodeRoomName,
  encodeRoomCustom,
  encodeRoomOrder,
  renameSuccess,
  customSuccess,
  orderSuccess,
  roomToastInfo,
  stringToByte,
  isBorder,
  parseRoomId,
} from '../utils';
import { DPCodes } from '../config';
import MapView from '../components/home/mapView';

function notifyRobotEditRoom() {
  TYSdk.device.putDeviceData({ [smartRoomsCode]: smartRoomEnum.edit_rooms });
}

const {
  RatioUtils: { isIphoneX, convert, height },
} = Utils;
const Res = {
  merge: require('../res/roomMerge.png'),
  split: require('../res/roomSplit.png'),
  reset: require('../res/roomReset.png'),
  name_edit: require('../res/roomRename.png'),
  custom_edit: require('../res/roomCustom.png'),
  custom_order: require('../res/roomOrder.png'),
};

const smartRoomsCode = 'smart_rooms';
const smartRoomEnum = {
  cur_rooms: 'cur_rooms',
  edit_rooms: 'edit_rooms',
  segment: 'segment',
  clear_rooms: 'clear_rooms',
  save_rooms: 'save_rooms',
};
const smartRoomsMsgCode = 'rooms_msg';

/**
 * 状态status控制按钮的状态
 * exemple: status = 0表示正常状态
 * exemple: status = 4当前地图处于可修改名称
 * */
const roomEditStatusEnum = {
  common: 0,
  split: 1,
  merge: 2,
  reName: 4,
  custom: 5,
  reOrder: 6,
};

@inject((state: any) => {
  const {
  dpState,
  customConfig: { store: customConfig = {} },
  panelConfig: { store: panelConfig = {} },
  mapDataState: { getData: mapDataState = {} },
  theme: { getData: theme = {} },
  } = state;
  return {
  smartRoomsMsg: Strings.getDpLang(smartRoomsMsgCode, dpState.data[smartRoomsMsgCode]),
  dpState: dpState.data,
  customConfig,
  panelConfig,
  roomInfo: mapDataState.roomInfo,
  origin: mapDataState.origin,
  fontColor: theme.fontColor,
  iconColor: theme.iconColor,
  };
  })
@observer
// eslint-disable-next-line import/prefer-default-export
export default class RoomEdit extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      status: 0,
      tip: '',
      showRenameModal: false,
      roomIdHexState: '',
      previewCustom: [],
      bottomBtnLen: 6,
      mapLoadEnd: false,
    };
  }

  appMapId: string;

  timer: number;

  msgSubscription: any;

  componentDidMount() {
    notifyRobotEditRoom();
    this.msgSubscription = createDpValue$(DPCodes.commText, false).subscribe((v: string) => {
      if (v) {
        if (renameSuccess(v) || customSuccess(v)) {
          const { customConfig } = this.props;
          const { previewCustom } = this.state;
          const curData = Object.assign(customConfig, previewCustom);
          store.customConfig.setCustomConfig(curData);
          this.setState({
            previewCustom: [],
          });
          TYSdk.mobile.hideLoading();
          this.timer && clearTimeout(this.timer);
        }
        if (orderSuccess(v)) {
          const idArr = orderSuccess(v);
          const { customConfig } = this.props;
          const temp = {};
          idArr &&
            idArr.map((id, idx) => {
              const room = customConfig[id];
              temp[id] = {
                ...room,
                order: idx + 1,
              };
            });
          const curData = Object.assign(customConfig, temp);
          store.customConfig.setCustomConfig(curData);
          TYSdk.mobile.hideLoading();
          this.timer && clearTimeout(this.timer);
        }
        if (roomToastInfo(v)) {
          setTimeout(() => {
            TYSdk.mobile.hideLoading();
            store.customConfig.clearCustomConfig();
            Toast.debounceInfo(Strings.getLang(roomToastInfo(v)));
            this.timer && clearTimeout(this.timer);
          }, 2000);
        }
      }
    });
    this.calculeCount();
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
    this.msgSubscription && this.msgSubscription.unsubscribe();
  }

  /**
   * 开启loading，并设置超时20s
   */
  startLoading = () => {
    TYSdk.mobile.showLoading();
    this.timer = setTimeout(() => {
      TYSdk.mobile.hideLoading();
      store.customConfig.clearCustomConfig();
      this.setState({
        previewCustom: [],
      });
    }, 20000);
  };

  /**
   * 配置可改变地图按钮个数，
   * UI需要相应变化
   */
  calculeCount() {
    const { panelConfig } = this.props;
    const { partitionMergeAvailable, partitionSplitFunc, partitionResetAvailable } =
      panelConfig.mapPartitionConfig;
    const { partitionRename } = panelConfig.nameConfig;
    const { attributesFan, attributesOrder, attributesTimes, attributesWater } =
      panelConfig.attributesConfig;
    const arr = [
      partitionMergeAvailable,
      partitionSplitFunc.partitionSplitAvaiable,
      partitionResetAvailable,
      partitionRename,
      attributesOrder.attributesOrderSet,
      attributesFan.attributesFanSet ||
        attributesWater.attributesWaterSet ||
        attributesTimes.attributesTimesSet,
    ];
    this.setState({
      bottomBtnLen: arr.filter(i => i).length,
    });
  }

  handleMapId = (data: { mapId: string }) => {
    this.appMapId = data.mapId;
  };

  onMapLoadEnd = (success: boolean) => {
    this.setState({ mapLoadEnd: success });
  };

  onLoggerInfo = (data: { info: string; theme: string; args: any }) => {
    if (data) {
      console.log(data.info || '', data.theme || '', ...Object.values(data.args || {}));
    }
  };

  handleSplit = async () => {
    try {
      await LaserUIApi.setLaserMapSplitType(IndoorMapUtils.getMapInstance(this.appMapId), {
        mapId: this.appMapId,
        state: mapSplitStateEnum.split,
      });
      await LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(this.appMapId), {
        state: 5,
        mapId: this.appMapId,
        edit: true,
      });
    } catch (error) {
      console.warn(error);
    }
  };

  handleMerge = async () => {
    await LaserUIApi.setLaserMapSplitType(IndoorMapUtils.getMapInstance(this.appMapId), {
      state: mapSplitStateEnum.merge,
      mapId: this.appMapId,
    });
    await LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(this.appMapId), {
      state: 5,
      mapId: this.appMapId,
      edit: true,
    });
  };

  handleRename = async () => {
    await LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(this.appMapId), {
      mapId: this.appMapId,
      state: 5,
      edit: false, // 这里需要设置edit 为false
    });
    await LaserUIApi.setLaserMapSplitType(IndoorMapUtils.getMapInstance(this.appMapId), {
      mapId: this.appMapId,
      state: mapSplitStateEnum.click,
    });
  };

  /**
   * 使地图处于可编辑状态
   */
  handleReorder = async () => {
    await LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(this.appMapId), {
      state: 6,
      mapId: this.appMapId,
      edit: true,
    });
  };

  handleResetRoom = () => {
    const data = encodeRoomReset();
    TYSdk.device.putDeviceData({ [DPCodes.commText]: data });
    this.startLoading();
  };

  /**
   * 定制模式
   */
  handleCustomRoom = (firstRoom: { pixel: string; extend: string }) => {
    const { navigation } = this.props;
    const { pixel, extend } = firstRoom;
    const { y_mode = '0', fan = '1', water_level = '1', sweep_count = '1' } = extend;
    const { previewCustom } = this.state;
    const room = previewCustom[pixel] || {};
    const curRoom = {
      [pixel]: {
        ...room,
        y_mode,
      },
    };
    const curData = { ...previewCustom, ...curRoom };
    this.setState({
      previewCustom: curData,
    });
    this.setState({
      roomIdHexState: pixel,
    });
    navigation.navigate('customEdit', {
      title: Strings.getLang('customEdit'),
      fan,
      water_level,
      sweep_count,
      handleSubmit: this.handleCustomRoomSelect,
    });
  };

  /**
   * 选择定制信息回到地图页面
   * @param data
   */
  handleCustomRoomSelect = (data: any) => {
    const { roomIdHexState, previewCustom } = this.state;
    const room = previewCustom[roomIdHexState] || {};
    const curRoom = {
      [roomIdHexState]: {
        ...room,
        fan: data.fan,
        water_level: data.water_level,
        sweep_count: data.sweep_count,
      },
    };
    const curData = { ...previewCustom, ...curRoom };
    this.setState({
      previewCustom: curData,
    });
  };

  // handleRoomClean = async () => {
  //   await LaserUIApi.setLaserMapStateAndEdit({
  //     state: 6,
  //     mapId: this.appMapId,
  //     edit: true,
  //   });
  // };

  handleReset = async () => {
    await LaserUIApi.setLaserMapSplitType(IndoorMapUtils.getMapInstance(this.appMapId), {
      mapId: this.appMapId,
      state: mapSplitStateEnum.normal,
    });
  };

  handleSplitOk = async () => {
    const { origin } = this.props;
    try {
      const res: any = await LaserUIApi.getLaserMapSplitPoint(
        IndoorMapUtils.getMapInstance(this.appMapId),
        {
          mapId: this.appMapId,
        }
      );
      const {
        type,
        data: [{ points, pixel }],
      } = res;
      const roomId = parseRoomId(pixel);
      if (!roomId) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('pleaseSelectRoom'), () => {});
      }
      if (type === mapSplitStateEnum.split) {
        const data = encodeRoomSplit(roomId, points, origin);
        TYSdk.device.putDeviceData({ [DPCodes.commText]: data });
        this.startLoading();
      }
    } catch (error) {
      console.warn(error);
    }
    this.handleResetStep();
  };

  handleMergeOk = async () => {
    const { roomInfo } = this.props;
    try {
      const res: any = await LaserUIApi.getLaserMapSplitPoint(
        IndoorMapUtils.getMapInstance(this.appMapId),
        {
          mapId: this.appMapId,
        }
      );
      const { type, data } = res;
      const roomIds = data.map((room: { pixel: string }) => parseRoomId(room.pixel));
      if (roomIds.length !== 2) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('home_merge_count_error'), () => {});
      }
      if (roomIds.some((roomId: number) => roomId > 31)) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('home_selectRoom_unknown'), () => {});
      }
      const vertexDataArr = data.map((room: { pixel: string }) => {
        if (roomInfo && roomInfo[room.pixel] && roomInfo[room.pixel].vertexData) {
          return roomInfo[room.pixel].vertexData;
        }
      });

      if (!isBorder(vertexDataArr[0], vertexDataArr[1])) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('home_merge_board_error'), () => {});
      }
      if (type === mapSplitStateEnum.merge) {
        const encodedData = encodeRoomMerge(roomIds);
        TYSdk.device.putDeviceData({ [DPCodes.commText]: encodedData });
        this.startLoading();
      }
    } catch (error) {
      console.warn(error);
    }
    this.handleResetStep();
  };

  /**
   * 命名确定
   */
  handleRoomNameOk = async () => {
    try {
      const { previewCustom } = this.state;
      const customKeys = Object.keys(previewCustom);

      if (customKeys.some(key => parseRoomId(key) > 31)) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('home_selectRoom_unknown'), () => {});
      }
      if (customKeys.some(key => stringToByte(previewCustom[key]).length > 18)) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('name_too_long'), () => {});
      }
      this.startLoading();
      const data = encodeRoomName(previewCustom);
      TYSdk.device.putDeviceData({ [DPCodes.commText]: data });
    } catch (error) {
      console.warn(error);
    }
    this.handleResetStep();
  };

  handleRoomCustomOk = async () => {
    try {
      const { previewCustom } = this.state;
      const customKeys = Object.keys(previewCustom);
      if (customKeys.some(key => parseRoomId(key) > 31)) {
        return TYSdk.mobile.simpleTipDialog(Strings.getLang('home_selectRoom_unknown'), () => {});
      }
      this.startLoading();
      const data = encodeRoomCustom(previewCustom);
      TYSdk.device.putDeviceData({ [DPCodes.commText]: data });
    } catch (error) {
      console.warn(error);
    }
    this.handleResetStep();
  };

  /**
   * 定制房间清扫顺序
   */
  handleRoomOrderOk = async () => {
    try {
      const points = await LaserUIApi.getLaserMapPointsInfo(
        IndoorMapUtils.getMapInstance(this.appMapId),
        {
          mapId: this.appMapId,
        }
      );

      console.log('handleRoomOrderOk', points);
      const orderArr =
        Array.isArray(points.data) &&
        points.data.sort((a: { order }, b: { order }) => a.order - b.order).map(itm => itm.pixel);
      const data = encodeRoomOrder(orderArr);
      this.startLoading();
      TYSdk.device.putDeviceData({ [DPCodes.commText]: data });
    } catch (error) {
      console.warn(error);
    }
    this.handleResetOrder();
  };

  handleCancelStep = () => {
    this.handleResetStep();
    this.setState({ previewCustom: [] });
  };

  handleResetStep = () => {
    this.handleReset();
    this.setState({ status: 0, tip: '' });
  };

  handleResetOrder = async () => {
    await LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(this.appMapId), {
      state: 0,
      mapId: this.appMapId,
      edit: false,
    });
    this.setState({ status: 0, tip: '' });
  };

  renderButtonGroup = (data: any, isMain?: boolean) => {
    const { bottomBtnLen, status } = this.state;
    return (
      <View
        style={[
          styles.group,
          (bottomBtnLen <= 3 || status) && {
            height: convert(40 + (isIphoneX ? 15 : 0) + 46),
          },
        ]}
      >
        {data.map(d => {
          return d.hidden ? null : (
            <View
              style={[
                styles.btnContent,
                status && {
                  width: '50%',
                },
              ]}
            >
              <Button
                style={styles.btn}
                key={d.text}
                textStyle={isMain ? styles.btnText : styles.btnActionText}
                {...d}
                imageStyle={styles.btnImg}
              />
            </View>
          );
        })}
      </View>
    );
  };

  renderAction = () => {
    const { status } = this.state;
    switch (status) {
      case roomEditStatusEnum.common:
        return this.renderCommonAction();
      case roomEditStatusEnum.split:
        return this.renderSplitAction();
      case roomEditStatusEnum.merge:
        return this.renderMergeAction();
      case roomEditStatusEnum.reName:
        return this.renderNameAction();
      case roomEditStatusEnum.custom:
        return this.renderCustomAction();
      case roomEditStatusEnum.reOrder:
        return this.renderOrderAction();
      default:
        break;
    }
  };

  renderCommonAction = () => {
    // mapPartitionMergeFunc等均为后台配置属性，false不支持操作
    const { panelConfig } = this.props;
    const { partitionMergeAvailable, partitionSplitFunc, partitionResetAvailable } =
      panelConfig.mapPartitionConfig;
    const { partitionRename } = panelConfig.nameConfig;
    const { attributesFan, attributesOrder, attributesTimes, attributesWater } =
      panelConfig.attributesConfig;

    const data = [
      {
        image: Res.merge,
        text: Strings.getLang('roomEdit_merge'),
        onPress: () => {
          this.handleMerge();
          this.setState({ status: 2, tip: Strings.getLang('mergeTip') });
        },
        hidden: !partitionMergeAvailable,
      },
      {
        image: Res.split,
        text: Strings.getLang('roomEdit_split'),
        onPress: () => {
          this.handleSplit();
          this.setState({ status: 1, tip: Strings.getLang('splitTip') });
        },
        hidden: !partitionSplitFunc.partitionSplitAvaiable,
      },
      {
        image: Res.reset,
        text: Strings.getLang('roomEdit_reset'),
        onPress: this.handleResetRoom,
        hidden: !partitionResetAvailable,
      },

      // V3 新增区域命名功能
      {
        image: Res.name_edit,
        text: Strings.getLang('roomEdit_name'),
        onPress: () => {
          this.handleRename();
          this.setState({ status: 4, tip: Strings.getLang('renameTip') });
        },
        hidden: !partitionRename,
      },
      // V3 新增定制模式功能
      {
        image: Res.custom_edit,
        text: Strings.getLang('roomEdit_custom'),
        onPress: () => {
          this.handleRename();
          this.setState({ status: 5, tip: Strings.getLang('customTip') });
        },
        hidden:
          !attributesFan.attributesFanSet &&
          !attributesWater.attributesWaterSet &&
          !attributesTimes.attributesTimesSet,
      },
      {
        image: Res.custom_order,
        text: Strings.getLang('roomEdit_order'),
        onPress: () => {
          this.handleReorder();
          this.setState({ status: 6, tip: Strings.getLang('orderTip') });
        },
        hidden: !attributesOrder.attributesOrderSet,
      },
    ];
    return this.renderButtonGroup(data, true);
  };

  renderMergeAction = () => {
    const data = [
      { text: Strings.getLang('cancel'), onPress: this.handleResetStep },
      { text: Strings.getLang('merge'), onPress: this.handleMergeOk },
    ];
    return this.renderButtonGroup(data);
  };

  renderSplitAction = () => {
    const data = [
      { text: Strings.getLang('cancel'), onPress: this.handleCancelStep },
      { text: Strings.getLang('split'), onPress: this.handleSplitOk },
    ];
    return this.renderButtonGroup(data);
  };

  /**
   * 重新命名操作按钮
   */
  renderNameAction = () => {
    const data = [
      { text: Strings.getLang('cancel'), onPress: this.handleCancelStep },
      { text: Strings.getLang('save'), onPress: this.handleRoomNameOk },
    ];
    return this.renderButtonGroup(data);
  };

  /**
   * 定制化房间按钮
   */
  renderCustomAction = () => {
    const data = [
      { text: Strings.getLang('cancel'), onPress: this.handleResetStep },
      { text: Strings.getLang('save'), onPress: this.handleRoomCustomOk },
    ];
    return this.renderButtonGroup(data);
  };

  renderOrderAction = () => {
    const data = [
      { text: Strings.getLang('cancel'), onPress: this.handleResetOrder },
      { text: Strings.getLang('save'), onPress: this.handleRoomOrderOk },
    ];
    return this.renderButtonGroup(data);
  };

  reName = (pixel: string) => {
    this.setState({
      roomIdHexState: pixel,
      showRenameModal: true,
    });
  };

  onClickSplitArea = (data: any) => {
    const { status } = this.state;
    let firstRoom = data;
    if (Array.isArray(data)) {
      [firstRoom] = data;
    }
    const { pixel } = firstRoom;
    const roomId = parseRoomId(pixel);
    if (roomId >= 32) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('home_selectRoom_unknown'), () => {});
    } else {
      switch (status) {
        case roomEditStatusEnum.reName:
          this.reName(pixel);
          break;
        case roomEditStatusEnum.custom:
          this.handleCustomRoom(firstRoom);
          break;
        default:
          break;
      }
    }
  };

  render() {
    const { panelConfig, fontColor, iconColor, customConfig } = this.props;
    const { previewCustom, showRenameModal, status, bottomBtnLen, tip, mapLoadEnd } = this.state;
    const { partitionNameEnum } = panelConfig.nameConfig;
    return (
      <View style={styles.flex1}>
        <View
          style={[
            styles.map,
            (bottomBtnLen <= 3 || status) && {
              height: height - convert(160 + (isIphoneX ? 15 : 0) + 46),
            },
          ]}
        >
          <MapView
            mapDisplayMode="splitMap"
            config={panelConfig}
            // 修改后存储的临时数据
            uiInterFace={{ isCustomizeMode: true, isShowAppoint: false }}
            preCustomConfig={previewCustom}
            customConfig={customConfig} // 修改成功后属性
            onMapId={this.handleMapId}
            onMapLoadEnd={this.onMapLoadEnd}
            onLoggerInfo={this.onLoggerInfo}
            mapLoadEnd={mapLoadEnd}
            onClickSplitArea={this.onClickSplitArea}
            fontColor={fontColor}
            iconColor={iconColor}
            pathVisible={false}
          />
        </View>
        <View
          style={[
            styles.bottomBox,
            (bottomBtnLen <= 3 || status) && {
              height: convert(80 + (isIphoneX ? 15 : 0) + 46),
            },
          ]}
        >
          <TYText style={styles.tip} text={tip} />
          {this.renderAction()}
        </View>
        <Rename
          visible={showRenameModal}
          tags={partitionNameEnum}
          onConfirm={(tag: string) => {
            const { roomIdHexState, previewCustom } = this.state;
            const room = previewCustom[roomIdHexState] || {};
            const curRoom = {
              [roomIdHexState]: {
                ...room,
                name: tag,
              },
            };
            const curData = { ...previewCustom, ...curRoom };
            this.setState({
              showRenameModal: false,
              previewCustom: curData,
            });
          }}
          onCancle={() => {
            this.setState({
              status: 0,
              tip: '',
              showRenameModal: false,
            });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  map: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height - convert(160 + (isIphoneX ? 15 : 0) + 46),
  },

  bottomBox: {
    position: 'absolute',
    bottom: 0,
    height: convert(160 + (isIphoneX ? 15 : 0) + 46),
  },
  group: {
    height: convert(170 + (isIphoneX ? 15 : 0)),
    paddingBottom: convert(isIphoneX ? 15 : 0),
    backgroundColor: '#fff',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: '#979797',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btnContent: {
    width: '33%',
    height: convert(80),
  },
  btn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnImg: {
    marginBottom: 9,
    tintColor: '#0065FF',
  },
  btnActionText: {
    fontSize: convert(14),
    color: '#313748',
  },
  btnText: {
    fontSize: convert(12),
    color: 'rgba(0,0,0,0.6)',
  },
  tip: {
    textAlign: 'center',
    fontSize: convert(14),
    lineHeight: convert(20),
    marginBottom: convert(16),
    marginTop: convert(10),
    color: '#9E9E9E',
  },
});
