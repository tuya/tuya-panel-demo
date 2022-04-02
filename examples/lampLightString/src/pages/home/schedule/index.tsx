/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import { GlobalToast, Utils, TYSdk, TYText } from 'tuya-panel-kit';
import { SupportUtils, WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import Strings from '@i18n';
import SettingRow from '@components/SettingRow';
import DpCodes from '@config/dpCodes';
import { parseJSON, formatCountdown, base64ToRaw } from '@utils';
import _ from 'lodash';
import Res from '@res';
import Api from '@api';
import Icons from '@res/iconfont';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import ColourFormatter from '@tuya/tuya-panel-lamp-sdk/lib/formatter/colourData';
import rgbSceneFormater from '@config/dragons/rgbSceneFormater';
import scenes from '@config/default/scenes';
import { countdownDo } from 'composeLayout';
import { ITimerData, TimerType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import TaskList from './TaskList';

const _has = _.has;
const colourFormater = new ColourFormatter();
interface ScheduleProps {
  theme?: any;
  navigation: StackNavigationProp<any>;
  lampPower?: boolean;
  countdown?: number;
  isSupportCloudTimer?: boolean;
}
interface ScheduleState {
  is24Hour: boolean;
  timerList: ITimerData[];
  listCloseStatus: boolean[];
}

const { convertX: cx, isIphoneX, winWidth } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

const { powerCode, countdownCode, workModeCode, rgbSceneCode, colourCode } = DpCodes;
const CloudTimerCategory = 'category_timer';

class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  isCloudTimer: boolean;

  constructor(props: ScheduleProps) {
    super(props);
    this.state = {
      is24Hour: false,
      timerList: [],
      // eslint-disable-next-line react/no-unused-state
      listCloseStatus: [],
    };
    this.isCloudTimer = !!TYSdk.devInfo.panelConfig.bic[0].selected;
  }

  componentWillMount() {
    this.sync24Hour();
    this.getCloudTimerList();
  }

  getCloudTimerList = async (showLoad = true) => {
    if (showLoad) {
      TYSdk.mobile.showLoading();
    }
    const handleError = (response: any) => {
      const err = parseJSON(response);
      TYSdk.mobile.hideLoading();
      GlobalToast.show({
        text: err.message || err.errorMsg,
        d: Icons.error,
        onFinish: GlobalToast.hide,
      });
    };
    let timerList: any = [];
    try {
      const timers = await Api.getCategoryTimerList(CloudTimerCategory);
      // @ts-ignore
      timerList = [...(timers.groups || [])];
      TYSdk.native.hideLoading();
    } catch (error) {
      handleError(error);
      TYSdk.mobile.hideLoading();
    }
    const dataSource = this.formatCloudData(timerList);
    this.setState({
      timerList: dataSource,
    });
  };

  scrollViewRef: ScrollView;

  formatCloudData = (timerList: any[]) => {
    const repeat = 0;
    const formattedData = timerList.map((item, index) => {
      const { id } = item;
      const timer = item.timers[0];
      const timeStr = timer.time; // 时间具体值，用于编辑的操作
      const hour = +timeStr.split(':')[0];
      const minute = +timeStr.split(':')[1];
      let repeatStr = '';
      if (repeat === 0) {
        repeatStr = timer.loops.toString();
      }
      const repeatArr = repeatStr.split('').map(i => +i);
      const weeks = [...repeatArr, 0];
      const powerDpId = TYSdk.device.getDpIdByCode(powerCode);
      const workModeDpId = TYSdk.device.getDpIdByCode(workModeCode);
      const colourDpId = TYSdk.device.getDpIdByCode(colourCode);
      const rgbSceneId = TYSdk.device.getDpIdByCode(rgbSceneCode);

      const { dps } = timer;
      const result: any = {
        dpPowerValue: false,
        workMode: WORK_MODE.COLOUR,
        hue: 0,
        saturation: 1000,
        value: 1000,
        rgbSceneValue: scenes[1][0].value,
      };

      if (_has(dps, powerDpId)) {
        result.dpPowerValue = dps[powerDpId];
        if (result.dpPowerValue) {
          result.workMode = dps[workModeDpId] || WORK_MODE.COLOUR;
          if (result.workMode === WORK_MODE.COLOUR) {
            const colorData = dps[colourDpId];
            const { hue, saturation, value } = colourFormater.parse(colorData);
            result.hue = hue;
            result.saturation = saturation;
            result.value = value;
          } else if (result.workMode === WORK_MODE.SCENE) {
            result.rgbSceneValue =
              rgbSceneFormater.parse(base64ToRaw(dps[rgbSceneId])) || scenes[1][0].value;
          }
        }
      }
      return {
        id,
        power: !!timer.status,
        hour,
        minute,
        weeks,
        ...result,
        key: `${TimerType.timer}_${index}`,
        type: TimerType.timer,
        index,
        startTime: hour * 60 + minute,
        name: Strings.getLang('cloud_timer'),
      };
    });
    return formattedData;
  };

  sync24Hour() {
    TYSdk.mobile.is24Hour().then((d: boolean) => {
      this.setState({ is24Hour: d });
    });
  }

  handleAddTimer = () => {
    const { is24Hour, timerList } = this.state;
    if (timerList.length >= 30) {
      GlobalToast.show({
        text: Strings.getLang('cloud_timer_max_tip'),
        d: Icons.error,
        onFinish: GlobalToast.hide,
      });
      return;
    }
    // 展示添加定时
    const { navigation } = this.props;
    navigation.navigate('cloudTimer', {
      title: Strings.getLang('title_add_timer'),
      isAdd: true,
      is24Hour,
      onBack: () => {},
      onSave: this.getCloudTimerList,
    });
  };

  handleEditItem = (item: ITimerData) => () => {
    const { navigation } = this.props;
    const { is24Hour } = this.state;
    // 获取的weeks长度为8，截取前7位使用
    const weeks = item.weeks.slice(0, 7);
    navigation.navigate('cloudTimer', {
      title: Strings.getLang('title_edit_timer'),
      isAdd: false,
      is24Hour,
      onBack: () => {},
      onSave: this.getCloudTimerList,
      ...item,
      weeks,
    });
  };

  handleShowCountdown = (value: boolean) => {
    if (value) {
      const { navigation } = this.props;
      navigation.navigate('countDown');
    } else {
      dragon.putDpData(
        {
          [countdownCode]: 0,
        },
        {
          checkCurrent: false,
        }
      );
      countdownDo(0);
    }
  };

  handleScrollViewEnableChange = (enable: boolean) => {
    // @ts-ignore
    this.scrollViewRef?.setNativeProps({
      scrollEnabled: enable,
    });
  };

  render() {
    const { timerList, is24Hour } = this.state;
    const { theme, lampPower, countdown } = this.props;
    const {
      global: { themeColor, fontColor, isDefaultTheme },
    } = theme;
    const isShow = !SupportUtils.isGroupDevice() && SupportUtils.isSupportCountdown();
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={(ref: ScrollView) => {
            this.scrollViewRef = ref;
          }}
          contentContainerStyle={styles.scrollViewContentContainer}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {isShow && (
            <SettingRow
              style={[
                styles.countdownRow,
                {
                  backgroundColor: isDefaultTheme ? 'rgba(255,255,255,0.07)' : '#fff',
                },
              ]}
              contentStyle={{ borderBottomWidth: 0 }}
              icon={Res.countdown}
              iconColor={fontColor}
              rightType="switch"
              value={countdown! > 0}
              title={
                lampPower
                  ? Strings.getLang('row_countdown_off')
                  : Strings.getLang('row_countdown_on')
              }
              subTitle={countdown ? formatCountdown(lampPower!, countdown) : undefined}
              onSwitchChange={this.handleShowCountdown}
              onPress={this.handleShowCountdown}
            />
          )}
          {/* 云定时 */}
          {this.isCloudTimer && (
            <View style={styles.scrollViewContent}>
              {/* 当设备没有倒计时且没有定时时，不显示定时标题 */}
              {isShow && (
                <View style={styles.addTaskBox}>
                  <TYText style={{ fontSize: cx(14) }}>{Strings.getLang('title_schedule')}</TYText>
                </View>
              )}
              <View style={[styles.addTaskBox, styles.addTaskBom, !isShow && styles.addNoDown]}>
                <TYText style={styles.tip}>{Strings.getLang('tip_schedule')}</TYText>
              </View>
              {/* 定时任务 */}
              <TaskList
                timerList={timerList}
                is24Hour={is24Hour}
                taskKeyList={['timer']}
                onGetCloudTimerList={this.getCloudTimerList}
                onEditItem={this.handleEditItem}
                onScrollViewEnableChange={this.handleScrollViewEnableChange}
              />
            </View>
          )}
        </ScrollView>
        {this.isCloudTimer && (
          <TouchableOpacity
            onPress={this.handleAddTimer}
            style={[
              styles.addTaskBtn,
              {
                backgroundColor: themeColor,
              },
            ]}
          >
            <Image source={Res.plus} style={styles.img} resizeMode="contain" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

export default connect(({ dpState }: any) => ({
  lampPower: dpState[powerCode],
  countdown: dpState[countdownCode],
}))(withTheme(Schedule));

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    width: winWidth,
    alignItems: 'center',
    paddingBottom: cx(160),
  },

  scrollViewContent: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  addTaskBox: {
    marginTop: cx(32),
    marginBottom: cx(2),
    paddingHorizontal: cx(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  addNoDown: {
    justifyContent: 'center',
    marginVertical: cx(24),
  },
  addTaskBom: {
    marginTop: 0,
    marginBottom: cx(16),
  },

  addTaskBtn: {
    position: 'absolute',
    right: cx(24),
    bottom: (isIphoneX ? 118 : 98) + cx(24),
    width: cx(52),
    height: cx(52),
    borderRadius: cx(26),
    justifyContent: 'center',
    alignItems: 'center',
  },

  countdownRow: {
    height: cx(70),
    width: winWidth - cx(48),
    marginHorizontal: cx(24),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: cx(16),
    marginTop: cx(24),
  },
  img: {
    width: cx(52),
    height: cx(52),
  },
  tip: {
    fontSize: cx(12),
    opacity: 0.5,
  },
});
