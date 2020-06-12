/* eslint-disable max-len */
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { TYText, TYFlatList, UnitText } from 'tuya-panel-kit';
// import CameraManager from '../../nativeComponents/cameraManager';
import _ from 'lodash';
import moment from 'moment';
import PanelClick from '../../../config/panelClick';
import LoadingCircle from '../../publicComponents/loadingCircle';
import Res from '../../../res';
import Strings from '../../../i18n';
import Config from '../../../config';
import { addZeros } from '../../../utils';

const { cx, winWidth, smallScreen, middlleScreen, isIOS } = Config;

class MotionCloudData extends React.Component {
  static propTypes = {
    cloudEventData: PropTypes.array.isRequired,
    is12Hour: PropTypes.bool.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
    loadMore: PropTypes.func.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
    showFooter: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.offset = 0;
  }
  getShowTime = (timeStamp, is12Hour) => {
    const time = moment(timeStamp * 1000).format('HH:mm');
    const show12Hour = is12Hour;
    let show12HourText = Strings.getLang('am');
    const timeHour = Number(time.split(':')[0]);
    let timeHourString = time.split(':')[0];
    const timeMinutString = time.split(':')[1];
    if (is12Hour) {
      if (timeHour > 12) {
        timeHourString = `${addZeros(timeHour - 12)}`;
        show12HourText = Strings.getLang('pm');
      }
    }
    return {
      timeHourString,
      timeMinutString,
      show12Hour,
      show12HourText,
    };
  };
  // 进入跳转云存储
  gotoCloudPage = startTime => {
    // 跳转到固定的云存储事件列表3.18的
    // goToNativeCloudEventDetailPlayTime(startTime);
    PanelClick.enterCloudStorage();
  };
  _keyExtractor = item => {
    return item.startTime;
  };
  renderItem = item => {
    const { is12Hour } = this.props;
    const { snapshotUrl, startTime } = item;
    const { timeHourString, timeMinutString, show12Hour, show12HourText } = this.getShowTime(
      startTime,
      is12Hour
    );
    let cloudImgBoxWidth = 150;
    let cloudImgWidth = 140;
    if (smallScreen) {
      cloudImgBoxWidth = 130;
      cloudImgWidth = 120;
    } else if (middlleScreen) {
      cloudImgBoxWidth = 140;
      cloudImgWidth = 130;
    }
    return (
      <TouchableOpacity
        style={styles.flatItem}
        activeOpacity={0.9}
        onPress={() => this.gotoCloudPage(startTime)}
      >
        <View style={styles.timeBox}>
          <UnitText size={24} value={timeHourString} valueColor="#333" />
          <TYText style={{ fontSize: 24, color: '#000000', fontWeight: '600', left: -5 }}>:</TYText>
          <UnitText size={24} value={timeMinutString} valueColor="#333" style={{ left: -10 }} />
          {show12Hour && (
            <TYText
              style={{ fontSize: cx(16), color: '#333', left: -10, fontWeight: '600', top: 5 }}
            >
              {show12HourText}
            </TYText>
          )}
        </View>
        <View style={[styles.cloudImgBox, { width: cloudImgBoxWidth }]}>
          <Image
            style={[styles.cloudImg, { width: cloudImgWidth, height: (cloudImgWidth * 9) / 16 }]}
            source={{ uri: snapshotUrl }}
          />
        </View>
      </TouchableOpacity>
    );
  };
  renderListFooter = () => {
    const { hasNextPage, showFooter, cloudEventData } = this.props;
    const Footer = (props = {}) => (
      <View style={[styles.footer, { width: cloudEventData.length === 0 ? winWidth : cx(150) }]}>
        {props.children}
        <TYText style={styles.footerText}>{props.text}</TYText>
      </View>
    );

    if (showFooter && hasNextPage) {
      return (
        <Footer text={Strings.getLang('cloud_storage_list_loading')}>
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
      return <Footer text={Strings.getLang('cloud_storage_list_null')} />;
    }
    return <View style={styles.footer} />;
  };

  render() {
    const { panelItemActiveColor, cloudEventData } = this.props;
    return (
      <View style={styles.motionCloudDataPage}>
        <View style={styles.motionTitleBox}>
          <Image
            source={Res.collectPoint.collectDot}
            style={[styles.pointDot, { tintColor: panelItemActiveColor }]}
          />
          <TYText style={styles.motionTitle} numberOfLines={1}>
            {Strings.getLang('cloud_storage_event')}
          </TYText>
        </View>
        <View style={styles.eventBox}>
          <TYFlatList
            keyExtractor={this._keyExtractor}
            bounces={false}
            removeClippedSubviews={true}
            initialNumToRender={5}
            separatorStyle={{ height: 0 }}
            horizontal={true}
            showsHorizontalScrollIndicator={cloudEventData.length !== 0}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatContainer}
            data={cloudEventData}
            renderItem={({ item, index }) => this.renderItem(item, index)}
            onEndReachedThreshold={0.5}
            onEndReached={_.throttle(() => {
              this.props.loadMore();
            }, 100)}
            // getItemLayout={(item, index) => ({ length: cloudEventData.length, offset: 300, index })}
            automaticallyAdjustContentInsets={false}
            ListFooterComponent={this.renderListFooter}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  motionCloudDataPage: {
    paddingLeft: cx(12),
    flex: 1,
    width: '100%',
    paddingTop: cx(10),
  },
  motionTitleBox: {
    flexDirection: 'row',
    height: cx(25),
    alignItems: 'center',
  },
  pointDot: {
    width: cx(4),
    resizeMode: 'contain',
    marginRight: cx(5),
  },
  motionTitle: {
    fontSize: cx(16),
  },
  eventBox: {
    flex: 1,
    justifyContent: 'center',
  },
  flatContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatItem: {
    marginRight: cx(5),
  },
  timeBox: {
    flexDirection: 'row',
    height: cx(25),
    borderLeftColor: '#e5e5e5',
    borderLeftWidth: 2,
    alignItems: 'center',
    paddingLeft: cx(3),
    marginBottom: cx(15),
  },
  cloudImgBox: {
    width: 150,
  },
  cloudImg: {
    width: 140,
    height: (140 * 9) / 16,
    borderRadius: 3,
  },
  loading: {},
  footer: {
    marginBottom: cx(10),
    height: cx(48),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: cx(14),
    marginTop: cx(10),
  },
});

export default MotionCloudData;
