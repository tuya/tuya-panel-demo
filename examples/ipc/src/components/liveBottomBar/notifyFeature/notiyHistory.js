/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import React from 'react';
import { View, StyleSheet, SectionList, Image, TouchableOpacity, Platform } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import { TYText } from 'tuya-panel-kit';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CameraManager from '../../nativeComponents/cameraManager';
import TYSdk from '../../../api';
import NoMessage from './noMessage';
import LoadingCircle from '../../publicComponents/loadingCircle';
import Config from '../../../config';
import { cloudStorageState as cloudStorageStateAction } from '../../../redux/modules/ipcCommon';
import Res from '../../../res';
import Strings from '../../../i18n';
import {
  gotoCameraMessagePreview,
  goToMessageDynamicGotoWithParams,
  judgeSdAndCloud,
} from '../../../config/click';
import { notifyImgIcon } from '../../../config/cameraData';
import { uniqueArr } from '../../../utils';

const { cx, winWidth, isIOS } = Config;
const TYEvent = TYSdk.event;

class NotiyHistory extends React.Component {
  static propTypes = {
    ...SectionList.propTypes,
    isSupportCloudStorage: PropTypes.bool.isRequired,
    cloudStorageStateAction: PropTypes.func.isRequired,
    tabContentHeight: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.offset = 0;
    this.state = {
      hasNextPage: false,
      showFooter: true,
      msgDataSource: [],
      refreshFlag: false,
    };
  }
  componentDidMount() {
    // 如果是分享的设备
    const { isShare } = this.props;
    if (isShare) {
      this.getMsgList();
    }
    TYEvent.on('reGetMsgList', () => {
      this.refreshHistorySection();
    });
    TYEvent.on('reGetCloudList', () => {
      const { isSupportCloudStorage, productId, uuid } = this.props;
      if (isSupportCloudStorage) {
        this.getServiceStatus(productId, uuid);
      }
    });
  }

  componentWillUnmount() {
    TYEvent.off('reGetMsgList');
    TYEvent.off('reGetCloudList');
  }
  // 获取云存储服务状态
  getServiceStatus = (pid, uuid) => {
    TYSdk.getServiceStatus(pid, uuid)
      .then(data => {
        if (data === 'running') {
          this.props.cloudStorageStateAction({ cloudStorageState: true });
        }
      })
      .catch(error => {
        CameraManager.showTip(Strings.getLang('cloudRequestError'));
      });
  };

  getMsgList = () => {
    const { devId } = this.props;
    const { msgDataSource } = this.state;
    TYSdk.getMsgList(devId, this.offset)
      .then(
        result => {
          const { datas } = result;
          let hasNextPage = false;
          if (datas.length === 20) {
            hasNextPage = true;
          } else {
            hasNextPage = false;
          }
          this.setState(
            {
              msgDataSource: uniqueArr(msgDataSource.concat(datas)),
              hasNextPage,
            },
            () => {
              console.log('第一次', this.state.msgDataSource);
            }
          );
        },
        err => {
          console.log('err', err);
        }
      )
      .catch(err => {
        console.log(err);
      });
  };
  getMediaType = data => {
    const { attachPics, attachVideos, attachAudios } = data;
    let sendType = '-1';
    if (
      typeof attachPic === 'undefined' &&
      typeof attachVideos === 'undefined' &&
      typeof attachAudios === 'undefined'
    ) {
      return sendType;
    }
    if (attachVideos.length === 0 && attachAudios.length === 0 && attachPics !== '') {
      sendType = '2';
    } else if (attachVideos.length !== 0) {
      // 查看视频
      sendType = '0';
    } else if (attachVideos.length === 0 && attachAudios.length !== 0) {
      // 查看录音音频
      sendType = '1';
    }
    return sendType;
  };
  reanderdriveLine = data => {
    return <View style={[styles.driveLine, { marginTop: data !== '' ? cx(10) : 0 }]} />;
  };
  loadMore = () => {
    const { hasNextPage } = this.state;
    if (!hasNextPage) {
      return false;
    }
    this.offset = this.offset + 20;
    this.getMsgList();
  };
  goNativePage = item => {
    const { attachPics, attachVideos, attachAudios, msgSrcId, msgTitle, time } = item;
    const sendTime = Platform.OS === 'ios' ? moment(time * 1000).format('HH:mm:ss') : String(time);
    const sendObject = {
      devId: this.props.devId,
      msgId: msgSrcId,
      msgTitle,
      msgTime: sendTime,
    };
    let sendType = '-1';
    let mediaUrl = '';
    // 查看告警图片
    if (attachVideos.length === 0 && attachAudios.length === 0 && attachPics !== '') {
      sendType = '2';
      mediaUrl = attachPics;
    } else if (attachVideos.length !== 0) {
      // 查看视频
      sendType = '0';
      mediaUrl = attachVideos[0];
    } else if (attachVideos.length === 0 && attachAudios.length !== 0) {
      // 查看录音音频
      sendType = '1';
      mediaUrl = attachAudios[0];
    }
    if (sendType === '-1') {
      return false;
    }
    sendObject.type = sendType;
    sendObject.mediaUrl = mediaUrl;
    gotoCameraMessagePreview(sendObject);
  };
  gotoSeeView = time => {
    goToMessageDynamicGotoWithParams(time);
  };
  refreshHistorySection = () => {
    this.offset = 0;
    this.setState(
      {
        msgDataSource: [],
        hasNextPage: false,
      },
      () => {
        this.getMsgList();
      }
    );
  };
  renderNotifyItem = data => {
    const { item, index } = data;
    const notifyIcon =
      notifyImgIcon[item.msgCode] !== undefined
        ? notifyImgIcon[item.msgCode]
        : notifyImgIcon.ipc_motion;

    const { isHasSdCard, isHasCloud } = judgeSdAndCloud();
    // 是否显示查看录像的按钮,如果需展现,将showMessageJump变为true即可。
    const showMessageJump = false;
    const hideSeeView = !isHasSdCard && !isHasCloud && showMessageJump;
    return (
      <TouchableOpacity
        style={[styles.alarmItemBox, { paddingTop: index === 0 ? 0 : cx(10) }]}
        onPress={() => this.goNativePage(item)}
        activeOpacity={0.9}
      >
        <View style={styles.alarmMsg}>
          <View style={styles.alarmLeftBox}>
            <View style={styles.leftBox}>
              <Image source={notifyIcon} style={styles.leftAlarmIcon} />
              <View style={styles.leftAlarmTitleBox}>
                <TYText style={styles.leftAlarmTitle}>{item.msgTitle}</TYText>
              </View>
            </View>
            <TYText style={styles.alarmContent}>{item.msgContent}</TYText>
            <TYText style={styles.rightTime}>
              {moment(item.time * 1000).format('YY-MM-DD HH:mm:ss')}
            </TYText>
            {/* 3.18上新的功能,需3.18及以上App */}
            {hideSeeView && (
              <TouchableOpacity
                onPress={() => {
                  this.gotoSeeView(item.time);
                }}
                activeOpacity={0.7}
              >
                <TYText style={styles.alarmSeeDetail}>
                  {Strings.getLang('ipc_message_click_to_see_video')}
                </TYText>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={this.getMediaType(item) === '-1' ? styles.alarmRightNoBox : styles.alarmRightBox}
          >
            {this.getMediaType(item) === '2' && (
              <View style={styles.alarmImgBox}>
                <Image source={{ uri: item.attachPics }} style={styles.alarmImg} />
              </View>
            )}
            {/* 视频 */}
            {this.getMediaType(item) === '0' && (
              <View style={styles.alarmImgBox}>
                <Image source={{ uri: item.attachPics }} style={styles.alarmImg} />
                <Image source={Res.notify.notifyVideoIcon} style={styles.videoPlayIcon} />
              </View>
            )}
            {/* 音频 */}
            {this.getMediaType(item) === '1' && (
              <View style={styles.audioImgBox}>
                <Image source={Res.notify.notifyAudioIcon} style={styles.audioImg} />
              </View>
            )}
          </View>
        </View>
        {this.reanderdriveLine(item.attachPics)}
      </TouchableOpacity>
    );
  };
  renderListFooter = () => {
    const { hasNextPage, showFooter } = this.state;
    const Footer = (props = {}) => (
      <View style={styles.footer}>
        {props.children}
        <TYText style={styles.footerText}>{props.text}</TYText>
      </View>
    );

    if (showFooter && hasNextPage) {
      return (
        <Footer text={Strings.getLang('ipc_message_loading')}>
          <LoadingCircle
            showComplete={false}
            itemNum={3}
            completeColor="#FA9601"
            sequenceColor="#FA9601"
            style={styles.loading}
            dotSize={cx(3)}
          />
        </Footer>
      );
    }
    if (!hasNextPage) {
      return <Footer text={Strings.getLang('ipc_message_null')} />;
    }
    return <View style={styles.footer} />;
  };
  render() {
    const { msgDataSource, refreshFlag } = this.state;
    const msgLength = msgDataSource.length;
    const { tabContentHeight } = this.props;
    return (
      <SectionList
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        refreshing={refreshFlag}
        style={styles.historySection}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews={!isIOS}
        initialNumToRender={5}
        windowSize={3}
        onRefresh={this.refreshHistorySection}
        ListEmptyComponent={<NoMessage tabContentHeight={tabContentHeight} />}
        ListFooterComponent={this.renderListFooter}
        contentContainerStyle={msgLength === 0 ? styles.historyContainer : styles.noFlex}
        renderItem={this.renderNotifyItem}
        keyExtractor={(__, _index) => `section_${_index + 1}`}
        removeClippedSubviews={true}
        onEndReachedThreshold={0.5}
        onEndReached={_.throttle(() => {
          this.loadMore();
        }, 100)}
        automaticallyAdjustContentInsets={false}
        sections={msgLength === 0 ? [] : [{ data: msgDataSource }]}
      />
    );
  }
}
const styles = StyleSheet.create({
  historySection: {
    width: winWidth,
    height: '100%',
  },
  historyContainer: {
    flex: 1,
  },
  noFlex: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  driveLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e1e1e1',
    width: winWidth - cx(55),
    alignSelf: 'flex-end',
  },
  alarmItemBox: {
    paddingHorizontal: cx(12),
    paddingBottom: 0,
  },
  alarmMsg: {
    flexDirection: 'row',
  },
  alarmLeftBox: {
    flex: 1,
  },
  alarmRightNoBox: {
    width: 0,
  },
  alarmRightBox: {
    width: cx(110),
    height: (cx(110) * 9) / 16,
  },
  leftBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAlarmIcon: {
    width: cx(30),
    resizeMode: 'contain',
  },
  leftAlarmTitleBox: {
    alignItems: 'center',
  },
  leftAlarmTitle: {
    fontSize: cx(16),
    fontWeight: '500',
  },
  rightTime: {
    fontSize: cx(12),
    color: '#999999',
    paddingLeft: cx(30),
    marginTop: cx(3),
  },
  alarmContent: {
    paddingLeft: cx(30),
    fontSize: cx(14),
    marginTop: cx(3),
  },
  alarmSeeDetail: {
    fontWeight: '600',
    paddingLeft: cx(30),
    fontSize: cx(14),
    marginTop: cx(5),
    color: '#1F78E0',
    textDecorationLine: 'underline',
  },
  audioImgBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  alarmImgBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  audioImg: {
    width: cx(110),
    resizeMode: 'contain',
    borderRadius: 3,
    overflow: 'hidden',
  },
  alarmImg: {
    width: cx(110),
    height: (cx(110) * 9) / 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  videoPlayIcon: {
    position: 'absolute',
    width: cx(35),
    resizeMode: 'contain',
  },
  loading: {},
  footer: {
    width: '100%',
    height: cx(48),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: cx(14),
    marginTop: cx(5),
    backgroundColor: 'transparent',
  },
});

const mapStateToProps = state => {
  const { devId, isShare, productId, uuid } = state.devInfo;
  const { isSupportCloudStorage } = state.ipcCommonState;
  return {
    devId,
    isShare,
    productId,
    uuid,
    isSupportCloudStorage,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators(
    {
      cloudStorageStateAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapToDisPatch)(NotiyHistory);
