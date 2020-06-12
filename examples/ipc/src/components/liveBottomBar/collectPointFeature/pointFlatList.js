/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TYFlatList, TYText, Dialog } from 'tuya-panel-kit';
import CameraManager from '../../nativeComponents/cameraManager';
import TYSdk from '../../../api';
import Strings from '../../../i18n';
import Res from '../../../res';
import Config from '../../../config';
import { getCuriseStatus, enterRnPage } from '../../../config/click';
import { requestTimeout, cancelRequestTimeOut } from '../../../utils';

const { cx } = Config;

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;
const TYMobile = TYSdk.mobile;

const is24Hour = TYMobile.is24Hour();
let is12Hour = true;
is24Hour.then(d => {
  is12Hour = !d;
});

class PointFlatList extends React.Component {
  static propTypes = {
    pointList: PropTypes.array.isRequired,
    getList: PropTypes.func.isRequired,
    devId: PropTypes.string.isRequired,
    devInfo: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      detailList: [],
    };
  }
  componentDidMount() {
    const newpointArr = [...this.props.pointList];
    newpointArr.forEach((item, index) => {
      newpointArr[index].renderItem = this.renderItem;
      newpointArr[index].key = item.id;
    });
    this.setState({
      detailList: newpointArr,
    });
  }
  componentWillReceiveProps(nextProps) {
    const { pointList } = this.props;
    const { pointList: newPointList } = nextProps;
    if (!_.isEqual(pointList, newPointList)) {
      const newpointArr = [...newPointList];
      newpointArr.forEach((item, index) => {
        newpointArr[index].renderItem = this.renderItem;
        newpointArr[index].key = item.id;
      });
      this.setState({
        detailList: newPointList,
      });
    }
  }

  updateMemoryPointList = (id, name) => {
    const { devId } = this.props;
    TYSdk.updateMemoryPointList(devId, id, name)
      .then(result => {
        if (result) {
          this.props.getList();
          TYEvent.emit('reGetPointList');
        } else {
          CameraManager.showTip(Strings.getLang('ipc_memory_point_name_edit_failure'));
          TYNative.hideLoading();
          cancelRequestTimeOut();
        }
      })
      .catch(err => {
        TYNative.hideLoading();
        cancelRequestTimeOut();
        console.log(err);
        const errResult = JSON.parse(err);
        CameraManager.showTip(errResult.errorMsg);
      });
  };
  _handleEdit = item => {
    if (getCuriseStatus()) {
      CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
      return false;
    }
    Dialog.prompt({
      title: Strings.getLang('ipc_memory_point_name_update'),
      cancelText: Strings.getLang('cancel_btn'),
      confirmText: Strings.getLang('confirm_btn'),
      defaultValue: item.name,
      placeholder: Strings.getLang('ipc_live_pag_memory_add_site_tip_txt'),
      autoFocus: true,
      maxLength: 10,
      motionType: 'none',
      onConfirm: text => {
        if (getCuriseStatus()) {
          CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
          return false;
        }
        if (_.trim(text) === '') {
          CameraManager.showTip(Strings.getLang('ipc_memory_point_name_is_null'));
          return false;
        } else if (_.trim(text).length > 10) {
          CameraManager.showTip(Strings.getLang('ipc_memory_point_name_length_limit'));
          return false;
        }
        TYNative.showLoading({ title: '' });
        requestTimeout();
        this.updateMemoryPointList(item.id, _.trim(text));
        Dialog.close();
      },
    });
  };

  _handleDelete = item => {
    if (getCuriseStatus()) {
      CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
      return false;
    }
    TYNative.simpleConfirmDialog(
      '',
      Strings.getLang('confirmDelete'),
      () => {
        if (getCuriseStatus()) {
          CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
          return false;
        }
        TYNative.showLoading({ title: '' });
        TYDevice.putDeviceData({
          memory_point_set: JSON.stringify({
            type: 2,
            data: {
              num: 1,
              sets: [{ devId: item.id, mpId: item.mpId }],
            },
          }),
        });
        // 在删除收藏点的同事，删除定时数据
        TYSdk.removeTimerCategoryData(this.props.devId, item.id)
          .then(data => {
            console.log('删除定时数据');
          })
          .catch(err => {
            console.log(err, 'err');
          });
        requestTimeout();
      },
      () => {}
    );
  };

  _handleTimer = item => {
    this.jumpToTimer(item);
  };

  jumpToTimer = item => {
    const dpData = JSON.stringify({
      type: 3,
      data: {
        mpId: item.mpId,
      },
    });

    const paramData = [
      {
        dpId: TYDevice.getDpIdByCode('memory_point_set'),
        dpName: `${item.name}${Strings.getLang('ipc_live_page_memory_point_time_title_tip')}`,
        selected: 0,
        rangeKeys: [dpData],
        rangeValues: [{ dpValue: Strings.getLang('ipc_live_page_memory_point_time_content') }],
      },
    ];
    const timerConfig = {
      addTimerRouter: 'addTimer',
      category: `${item.id}`,
      repeat: 0,
      data: paramData,
    };
    const sendData = {
      timerConfig,
      is12Hours: is12Hour,
      isCollect: true,
    };
    enterRnPage('timer', sendData);
  };

  renderItem = ({ item, index }) => {
    const { detailList } = this.state;
    const { devInfo } = this.props;
    const singleCollectTimer = _.get(devInfo, 'panelConfig.fun.singleCollectTimer');
    return (
      <View
        style={[
          styles.pointItemBox,
          { borderBottomWidth: detailList.length === index + 1 ? 0 : StyleSheet.hairlineWidth },
        ]}
      >
        <View style={styles.pointImgBox}>
          <Image style={styles.pointImg} source={{ uri: item.pic }} />
        </View>
        <View style={styles.pointNameBox}>
          <TYText style={styles.pointName} numberOfLines={1}>
            {item.name}
          </TYText>
        </View>
        <View style={styles.operatorBox}>
          {singleCollectTimer && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => this._handleTimer(item)}
              style={styles.IconBox}
            >
              <Image style={[styles.pointIcon]} source={Res.collectPoint.detailTimer} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this._handleEdit(item)}
            style={[styles.IconBox, { width: singleCollectTimer ? cx(40) : cx(50) }]}
          >
            <Image style={styles.pointIcon} source={Res.collectPoint.detailEdit} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this._handleDelete(item)}
            style={[styles.IconBox, { width: singleCollectTimer ? cx(40) : cx(50) }]}
          >
            <Image style={[styles.pointIcon]} source={Res.collectPoint.detailDelete} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  render() {
    const { detailList } = this.state;
    return (
      <View style={styles.pointFlatListPage}>
        <TYFlatList
          separatorStyle={{ height: 0 }}
          contentContainerStyle={styles.flatContain}
          data={detailList}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  pointFlatListPage: {
    backgroundColor: '#ffffff',
  },
  pointItemBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: cx(10),
    borderColor: '#e5e5e5',
  },
  pointImgBox: {
    width: cx(124),
    height: (cx(124) * 9) / 16,
    borderRadius: Math.ceil(2),
    overflow: 'hidden',
  },
  pointImg: {
    width: '100%',
    height: '100%',
  },
  pointNameBox: {
    flex: 1,
    paddingLeft: cx(8),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  pointName: {
    fontSize: cx(16),
  },
  operatorBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  IconBox: {
    width: cx(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointIcon: {
    width: cx(30),
    resizeMode: 'contain',
  },
  flatContain: {
    paddingHorizontal: cx(15),
  },
});

const mapStateToProps = state => {
  const { devId } = state.devInfo;
  const { devInfo } = state;
  return {
    devId,
    devInfo,
  };
};

export default connect(mapStateToProps, null)(PointFlatList);
