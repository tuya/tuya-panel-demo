/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React from 'react';
import { View, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { TYText, TYSdk } from 'tuya-panel-kit';
import Strings from '../../../i18n';
import Config from '../../../config';
import { enterDpTimePage, enterRnPage } from '../../../config/click';
import Res from '../../../res';

const { cx } = Config;

const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;
const TYMobile = TYSdk.mobile;

const is24Hour = TYMobile.is24Hour();
let is12Hour = true;
is24Hour.then(d => {
  is12Hour = !d;
});
class FeedControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      btnData: [
        {
          name: Strings.getLang('ipc_pet_schedule'),
          imgSource: Res.tabFeed.feedTime,
          key: 'timer',
          isDpTime: false,
        },
      ],
    };
  }

  componentDidMount() {
    this.getInitData();
  }

  onPressBtn = item => {
    const { key, isDpTime } = item;
    switch (key) {
      case 'timer':
        if (isDpTime) {
          enterDpTimePage('feedNumSchedule');
        } else {
          // 走云端定时
          const { schema } = this.props;
          const feedNumTimeSchema = schema.feed_num;
          const { max: feedNumTimeMax } = feedNumTimeSchema;
          const rangeKeys = new Array(feedNumTimeMax);
          const rangeValues = [];
          for (let i = 0; i < rangeKeys.length; i++) {
            rangeKeys[i] = i + 1;
            rangeValues.push({
              dpValue: `${i + 1}(${Strings.getLang('ipc_pet_num')})`,
            });
          }
          const paramData = [
            {
              dpId: TYDevice.getDpIdByCode('feed_num'),
              dpName: `${Strings.getLang('ipc_pet_feed')}`,
              selected: 0,
              rangeKeys,
              rangeValues,
            },
          ];
          const timerConfig = {
            addTimerRouter: 'addTimer',
            category: 'petFeed',
            repeat: 0,
            data: paramData,
          };
          const sendData = {
            timerConfig,
            is12Hours: is12Hour,
            // 表示定时是需要直接返回预览界面的
            backLivePlay: true,
          };
          enterRnPage('timer', sendData);
        }
        break;
      case 'record':
        const sendData = {
          title: Strings.getLang('ipc_pet_record_page_title'),
          dpId: TYDevice.getDpIdByCode('feed_num'),
          legened: Strings.getLang('ipc_pet_record_page_legened_text'),
        };
        enterRnPage('statistics', sendData);
        break;
      default:
        return false;
    }
  };

  getInitData = () => {
    const { history_data, ipc_feed_plan } = this.props;
    const { btnData } = this.state;
    if (typeof ipc_feed_plan !== 'undefined') {
      btnData.forEach((item, index) => {
        item.key === 'timer' && (btnData[index].isDpTime = true);
      });
    }

    if (typeof history_data !== 'undefined') {
      btnData.push({
        name: Strings.getLang('ipc_pet_record'),
        key: 'record',
        imgSource: Res.tabFeed.feedList,
      });
    }
    if (btnData.length > 2) {
      this.props.changeMargin({ value: cx(8) });
    }
    this.setState({
      btnData,
    });
  };

  render() {
    const { btnData } = this.state;
    const btnLength = btnData.length;
    return (
      <View style={styles.feedControlpPage}>
        {btnData.map((item, index) => (
          <TouchableWithoutFeedback key={item.key} onPress={() => this.onPressBtn(item)}>
            <View
              style={
                btnLength === 1
                  ? styles.btnItem
                  : [styles.btnHalfItem, { marginBottom: btnLength > 2 ? cx(8) : 0 }]
              }
            >
              <View style={styles.btnLeftBox}>
                <Image source={item.imgSource} style={styles.btnLeftIcon} />
                <TYText numberOfLines={1} style={styles.btnLeftText}>
                  {item.name}
                </TYText>
              </View>
              <Image source={Res.tabFeed.feedArrow} style={styles.btnRightIcon} />
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  feedControlpPage: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  btnItem: {
    paddingHorizontal: cx(15),
    flex: 1,
    height: cx(48),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  btnHalfItem: {
    paddingHorizontal: cx(15),
    flexDirection: 'row',
    height: cx(48),
    width: '49%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  btnLeftBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnLeftText: {
    marginLeft: cx(5),
    fontSize: cx(14),
  },
});

const mapStateToProps = state => {
  const { history_data, ipc_feed_plan } = state.dpState;
  const { schema } = state.devInfo;
  return {
    history_data,
    ipc_feed_plan,
    schema,
  };
};

export default connect(mapStateToProps, null)(FeedControl);
