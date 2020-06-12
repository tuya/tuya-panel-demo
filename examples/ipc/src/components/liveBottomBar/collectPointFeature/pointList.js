/* eslint-disable max-len */
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TYText, Dialog } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import CameraManager from '../../nativeComponents/cameraManager';
import Config from '../../../config';
import Strings from '../../../i18n';
import Res from '../../../res';
import { getCuriseStatus } from '../../../config/click';
import { getPanelOpacity } from '../../../utils/panelStatus';
import TYSdk from '../../../api';
import { sortCollectData, requestTimeout, cancelRequestTimeOut } from '../../../utils';

const { cx } = Config;
const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

class PointList extends React.Component {
  static propTypes = {
    devId: PropTypes.string.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
    showVideoLoad: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      pointArr: [],
    };
  }
  componentDidMount() {
    this.getMemoryPointList();
    TYEvent.on('deviceDataChange', this.addListenDpDataChange);
    TYEvent.on('reGetPointList', this.getMemoryPointList);
  }

  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.addListenDpDataChange);
    TYEvent.off('reGetPointList');
  }
  getMemoryPointList = () => {
    const { devId } = this.props;
    TYSdk.getMemoryPointList(devId)
      .then(result => {
        let pointArr = [];
        if (result.length > 0) {
          pointArr = result.sort(sortCollectData);
        }
        this.setState(
          {
            pointArr,
          },
          () => {
            TYNative.hideLoading();
            cancelRequestTimeOut();
          }
        );
      })
      .catch(err => {
        TYNative.hideLoading();
        cancelRequestTimeOut();
        const errResult = JSON.parse(err);
        setTimeout(() => {
          CameraManager.showTip(errResult.errorMsg);
        }, 400);
      });
  };
  addListenDpDataChange = data => {
    const changedp = data.payload;
    if (changedp.memory_point_set !== undefined) {
      const result = JSON.parse(changedp.memory_point_set);
      const { type, data: memoryData } = result;
      let { error } = memoryData;
      error = error === undefined ? 0 : error;
      if (type === 1) {
        if (error <= 10000) {
          this.getMemoryPointList();
        } else if (error === 10001) {
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_memory_point_number_is_limited'));
          }, 400);
          TYNative.hideLoading();
          cancelRequestTimeOut();
        } else if (error === 10002) {
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
          }, 400);
          TYNative.hideLoading();
          cancelRequestTimeOut();
        }
      } else if (type === 2) {
        if (error <= 10000) {
          this.getMemoryPointList();
        }
      } else if (type === 4) {
        this.getMemoryPointList();
      }
    }
  };
  rotatePtz = item => {
    TYDevice.putDeviceData({
      memory_point_set: JSON.stringify({
        type: 3,
        data: {
          mpId: item.mpId,
        },
      }),
    });
  };
  addPoint = () => {
    const { pointArr } = this.state;
    if (pointArr.length >= 6) {
      setTimeout(() => {
        CameraManager.showTip(Strings.getLang('ipc_memory_point_number_is_limited'));
      }, 400);
      return false;
    }
    if (getCuriseStatus()) {
      CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
      return false;
    }
    Dialog.prompt({
      title: Strings.getLang('ipc_live_pag_memory_add_site_title'),
      cancelText: Strings.getLang('cancel_btn'),
      confirmText: Strings.getLang('confirm_btn'),
      defaultValue: '',
      placeholder: Strings.getLang('ipc_live_pag_memory_add_site_tip_txt'),
      autoFocus: true,
      maxLength: 10,
      motionType: 'none',
      onConfirm: text => {
        if (pointArr.length >= 6) {
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_memory_point_number_is_limited'));
          }, 400);
          return false;
        }
        if (getCuriseStatus()) {
          CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
          return false;
        }
        if (_.trim(text) === '') {
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_memory_point_name_is_null'));
          }, 400);
          return false;
        } else if (_.trim(text).length > 10) {
          CameraManager.showTip(Strings.getLang('ipc_memory_point_name_length_limit'));
          return false;
        }
        TYDevice.putDeviceData({
          memory_point_set: JSON.stringify({
            type: 1,
            data: {
              name: _.trim(text),
            },
          }),
        });
        Dialog.close();
        TYNative.showLoading({ title: '' });
        requestTimeout();
      },
    });
  };
  render() {
    const { pointArr } = this.state;
    const { panelItemActiveColor, showVideoLoad } = this.props;
    return (
      <ScrollView
        contentContainerStyle={styles.pointListPage}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        {pointArr.map(item => (
          <TouchableOpacity
            style={styles.itemContainer}
            key={item.id}
            disabled={showVideoLoad}
            onPress={_.throttle(
              // eslint-disable-next-line no-unused-expressions
              () => this.rotatePtz(item),
              500
            )}
            activeOpacity={0.9}
          >
            <Image
              style={[styles.itemPointBox, { resizeMode: 'cover' }]}
              source={item.pic === '' ? Res.collectPoint.collectInitImg : { uri: item.pic }}
            />
            <View style={styles.pointNameBox}>
              <Image
                source={Res.collectPoint.collectDot}
                style={[styles.pointDot, { tintColor: panelItemActiveColor }]}
              />
              <TYText style={styles.ponitName} numberOfLines={1}>
                {item.name}
              </TYText>
            </View>
          </TouchableOpacity>
        ))}
        {pointArr.length < 6 && (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={this.addPoint}
              style={styles.addPointBox}
              disabled={showVideoLoad}
            >
              <Image style={styles.addPointBgc} source={Res.collectPoint.addCollectBgc} />
              <View style={styles.addDecoration}>
                <Image
                  source={Res.collectPoint.addCollectDecoration}
                  style={styles.decorationImg}
                />
                <TYText style={styles.decorationText} numberOfLines={1}>
                  {Strings.getLang('ipc_memory_point_add_icon')}
                </TYText>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  pointListPage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  itemContainer: {
    width: '33.3%',
    height: 100,
    paddingHorizontal: cx(3),
  },
  itemPointBox: {
    width: '100%',
    height: 60,
    borderRadius: 3,
    overflow: 'hidden',
  },
  pointNameBox: {
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
  },
  pointDot: {
    width: cx(4),
    resizeMode: 'contain',
    marginRight: cx(5),
  },
  ponitName: {
    fontSize: cx(16),
  },
  addPointBox: {
    width: '100%',
  },
  addPointBgc: {
    width: '100%',
    resizeMode: 'stretch',
  },
  addDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    overflow: 'hidden',
  },
  decorationImg: {
    width: cx(20),
    resizeMode: 'contain',
    marginBottom: cx(2),
  },
  decorationText: {
    fontSize: cx(12),
  },
});

const mapStateToProps = state => {
  const { devId } = state.devInfo;
  const { showVideoLoad } = state.ipcCommonState;
  return {
    devId,
    showVideoLoad,
  };
};
export default connect(mapStateToProps, null)(PointList);
