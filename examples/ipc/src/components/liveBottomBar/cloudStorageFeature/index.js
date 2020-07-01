/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import { connect } from 'react-redux';
import CameraManager from '../../../components/nativeComponents/cameraManager';
import NotPurCharse from './notPurCharse';
import NoMotionCloudData from './noMotionCloudData';
import MotionCloudData from './motionCloudData';
import ReBuyCloudData from './reBuyCloudData';
import Strings from '../../../i18n';
import TYSdk from '../../../api';
import Config from '../../../config';
import { uniqueArr } from '../../../utils';

const { cx } = Config;
const TYEvent = TYSdk.event;
const TYMobile = TYSdk.mobile;

let is12Hour = false;
TYMobile.is24Hour().then(d => {
  is12Hour = !d;
});

class CloudStorage extends React.Component {
  static propTypes = {
    panelItemActiveColor: PropTypes.string.isRequired,
    isSupportCloudStorage: PropTypes.bool.isRequired,
    tabContentHeight: PropTypes.number.isRequired,
    productId: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    devId: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.offset = 0;
    this.cloudDay = '2018-06-25';
    this.state = {
      serverStatus: '',
      hasCloudData: false,
      cloudEventData: [],
      showCloseIcon: true,
      hasNextPage: false,
      showFooter: true,
      scrollHeight: 0,
    };
    this.firstgetHeight = 0;
  }
  componentWillMount() {
    // 在Tabchange后,重新获取事件片段
    TYEvent.on('reGetCloudList', () => {
      this.offset = 0;
      this.setState(
        {
          cloudEventData: [],
        },
        () => {
          const { isSupportCloudStorage, productId, uuid, devId } = this.props;
          if (isSupportCloudStorage) {
            this.getServiceStatus(productId, uuid);
            this.getStorageByDay(devId);
          }
        }
      );
    });
    this.fromBuyPageListener = RCTDeviceEventEmitter.addListener('backFromActivityBrowser', () => {
      // 购买成功后的监听
      const { productId, uuid, devId } = this.props;
      this.getServiceStatus(productId, uuid);
      this.getStorageByDay(devId);
    });
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(this.props.isSupportCloudStorage, nextProps.isSupportCloudStorage) &&
      nextProps.isSupportCloudStorage
    ) {
      const { productId, uuid, devId } = this.props;
      this.getServiceStatus(productId, uuid);
      this.getStorageByDay(devId);
    }
  }
  componentWillUnmount() {
    this.fromBuyPageListener.remove();
    TYEvent.off('reGetCloudList');
  }

  // 获取云存储服务状态
  getServiceStatus = (pid, uuid) => {
    TYSdk.getServiceStatus(pid, uuid)
      .then(data => {
        this.setState({
          serverStatus: data,
        });
      })
      .catch(error => {
        CameraManager.showTip(`${Strings.getLang('cloudRequestError')} sdjksjdjsk ----- `);
      });
  };

  getEventDatas = (dateTime, offset) => {
    if (dateTime) {
      const { cloudEventData } = this.state;
      const { devId } = this.props;
      const playtime = moment(`${dateTime}`).toDate();
      const startTime = playtime.setHours(0, 0, 0, 0) / 1000;
      const endTime = playtime.setHours(24, 0, 0, 0) / 1000;
      TYSdk.queryCloudEventList(startTime, endTime, offset, devId)
        .then(data => {
          if (typeof data.datas !== 'undefined') {
            let hasNextPage = false;
            if (data.datas.length === 30) {
              hasNextPage = true;
            }
            this.setState({
              cloudEventData: uniqueArr(cloudEventData.concat(data.datas)),
              hasNextPage,
            });
          }
        })
        .catch(error => {
          CameraManager.showTip(
            `${Strings.getLang('cloudRequestError')}dsadhisadhshajdhshafhhs====`
          );
        });
    }
  };
  // 按天获取存储统计信息
  getStorageByDay = async devId => {
    try {
      const cloudData = await TYSdk.getStorageByDay(devId);
      if (cloudData.length !== 0) {
        const hasCloudData = true;
        const cloudLastDay = cloudData[cloudData.length - 1].uploadDay;
        this.cloudDay = cloudLastDay;
        this.getEventDatas(cloudLastDay, this.offset);
        this.setState({
          hasCloudData,
        });
      }
    } catch (err) {
      CameraManager.showTip(`${Strings.getLang('cloudRequestError')}`);
    }
  };
  // 取消显示续订弹出框
  changeClose = () => {
    this.setState({
      showCloseIcon: false,
    });
  };
  loadMore = () => {
    const { hasNextPage } = this.state;
    if (!hasNextPage) {
      return false;
    }
    // 加载更多
    this.offset = this.offset + 30;
    this.getEventDatas(this.cloudDay, this.offset);
  };
  _onLayout = e => {
    const { height } = e.nativeEvent.layout;
    if (this.firstgetHeight !== height && this.firstgetHeight !== 0) {
      _.throttle(() => {
        this.setState({
          scrollHeight: height,
        });
      }, 200);
    }
    this.firstgetHeight = height;
  };
  render() {
    const {
      serverStatus,
      hasCloudData,
      showCloseIcon,
      cloudEventData,
      showFooter,
      hasNextPage,
      scrollHeight,
    } = this.state;
    const eventDataLen = cloudEventData.length;
    const { panelItemActiveColor, tabContentHeight } = this.props;
    const scrollEnabled = tabContentHeight < scrollHeight && eventDataLen === 0;
    return (
      // 这里样式复杂的原因是为适配有些国家多语言 会很长！！！
      <ScrollView
        scrollEnabled={scrollEnabled}
        // scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={[
          scrollEnabled
            ? styles.cloudScrollFeaturePage
            : [
                styles.cloudFeatureNormalPage,
                {
                  justifyContent: eventDataLen === 0 ? 'center' : 'flex-start',
                  alignItems: eventDataLen === 0 ? 'center' : 'flex-start',
                },
              ],
        ]}
      >
        <View
          onLayout={e => this._onLayout(e)}
          style={[eventDataLen !== 0 ? styles.hasEventData : styles.noEventData, { width: '100%' }]}
        >
          {/* 表示未购买云存储套餐 */}
          {serverStatus !== 'running' && !hasCloudData && eventDataLen === 0 && (
            <NotPurCharse panelItemActiveColor={panelItemActiveColor} />
          )}
          {/* 表示已购买云存储套餐,但无检测事件，或者为连续录像存储 */}
          {serverStatus === 'running' && (!hasCloudData || eventDataLen === 0) && (
            <NoMotionCloudData panelItemActiveColor={panelItemActiveColor} />
          )}
          {/* 表示有事件云存储 */}
          {hasCloudData && eventDataLen !== 0 && (
            <MotionCloudData
              cloudEventData={cloudEventData}
              is12Hour={is12Hour}
              panelItemActiveColor={panelItemActiveColor}
              loadMore={this.loadMore}
              showFooter={showFooter}
              hasNextPage={hasNextPage}
            />
          )}
        </View>
        {/* 显示续订云存储 */}
        {showCloseIcon && serverStatus !== 'running' && hasCloudData && eventDataLen !== 0 && (
          <ReBuyCloudData closeTip={this.changeClose} />
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cloudScrollFeaturePage: {
    paddingHorizontal: cx(12),
    paddingVertical: cx(15),
  },
  cloudFeatureNormalPage: {
    flex: 1,
    justifyContent: 'center',
  },
  hasEventData: {
    flex: 1,
  },
  noEventData: {},
});

const mapStateToProps = state => {
  const { panelItemActiveColor, isSupportCloudStorage } = state.ipcCommonState;
  const { productId, uuid, devId } = state.devInfo;
  return {
    panelItemActiveColor,
    isSupportCloudStorage,
    productId,
    uuid,
    devId,
  };
};

export default connect(mapStateToProps, null)(CloudStorage);
