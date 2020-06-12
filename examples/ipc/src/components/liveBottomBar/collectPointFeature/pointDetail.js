/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import CameraManager from '../../nativeComponents/cameraManager';
import NoPointData from './noPointData';
import PointFlatList from './pointFlatList';
import TYSdk from '../../../api';
import TopHeader from '../../publicComponents/topHeader';
import Strings from '../../../i18n';
import { backNavigatorLivePlay, backLivePlayWillUnmount } from '../../../config/click';
import { sortCollectData, cancelRequestTimeOut } from '../../../utils';
import Config from '../../../config';

const { isIOS, statusBarHeight } = Config;

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;

class PointDetail extends React.Component {
  static propTypes = {
    devId: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      pointList: [],
    };
  }
  componentDidMount() {
    this.getMemoryPointList();
    TYEvent.on('deviceDataChange', this.editListenDpDataChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.editListenDpDataChange);
    backLivePlayWillUnmount();
  }
  getMemoryPointList = () => {
    const { devId } = this.props;
    TYSdk.getMemoryPointList(devId)
      .then(result => {
        let pointList = [];
        if (result.length > 0) {
          pointList = result.sort(sortCollectData);
        }
        if (result.length < 2) {
          TYEvent.emit('reWirterMemory');
        }
        this.setState(
          {
            pointList,
          },
          () => {
            TYNative.hideLoading();
          }
        );
      })
      .catch(err => {
        TYNative.hideLoading();
        const errResult = JSON.parse(err);
        CameraManager.showTip(errResult.errorMsg);
      });
  };
  editListenDpDataChange = data => {
    const changedp = data.payload;
    if (changedp.memory_point_set !== undefined) {
      const result = JSON.parse(changedp.memory_point_set);
      const { type, data: memoryData } = result;
      let { error } = memoryData;
      error = error === undefined ? 0 : error;
      if (type === 2) {
        if (error <= 10000) {
          this.getMemoryPointList();
        } else if (error === 10001) {
          TYNative.hideLoading();
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_errmsg_add_memory_point_max'));
          }, 400);
        } else if (error === 10002) {
          TYNative.hideLoading();
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
          }, 400);
        } else if (error === 10003) {
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('ipc_errmsg_deveicePonitlessTwo'));
          }, 400);
          TYNative.hideLoading();
        } else {
          setTimeout(() => {
            CameraManager.showTip(Strings.getLang('systemError'));
          }, 400);
          TYNative.hideLoading();
        }
      }
    }
  };
  backLivePage = () => {
    backNavigatorLivePlay();
  };
  render() {
    const { pointList } = this.state;
    const ponitLength = pointList.length;
    return (
      <View style={styles.pointDetailPage}>
        <StatusBar
          barStyle={isIOS ? 'dark-content' : 'light-content'}
          translucent={true}
          backgroundColor="transparent"
        />
        <View style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}>
          <TopHeader
            hasRight={false}
            contentTitle={Strings.getLang('ipc_setting_site_manage')}
            leftPress={this.backLivePage}
          />
        </View>
        {ponitLength === 0 ? (
          <NoPointData />
        ) : (
          <PointFlatList pointList={pointList} getList={this.getMemoryPointList} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pointDetailPage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
const mapStateToProps = state => {
  const { devId } = state.devInfo;
  return {
    devId,
  };
};
export default connect(mapStateToProps, null)(PointDetail);
