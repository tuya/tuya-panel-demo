/* eslint-disable max-len */
/* eslint-disable no-lonely-if */
/* eslint-disable react/no-children-prop */
/* eslint-disable camelcase */
import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import { TYText, TYSectionList } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TYSdk from '../../../../api';
import TopHeader from '../../../publicComponents/topHeader';
import CameraManager from '../../../nativeComponents/cameraManager';
import {
  showNextDay as showNextDayAction,
  timerPickerValue as timerPickerValueAction,
} from '../../../../redux/modules/ipcCommon';
import Strings from '../../../../i18n';
import Config from '../../../../config';
import Res from '../../../../res';
import {
  backNavigatorLivePlay,
  backLivePlayWillUnmount,
  enterRnPage,
} from '../../../../config/click';
import PanelClick from '../../../../config/panelClick';
import { getHourMinute, convertHourMinute } from '../../../../utils';

const { cx, isIOS, statusBarHeight } = Config;
const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;
const TYMobile = TYSdk.mobile;

const is24Hour = TYMobile.is24Hour();
let is12Hour = true;
is24Hour.then(d => {
  is12Hour = !d;
});

class CruisePage extends React.Component {
  static propTypes = {
    cruise_switch: PropTypes.bool.isRequired,
    cruise_mode: PropTypes.string.isRequired,
    cruise_time_mode: PropTypes.string.isRequired,
    cruise_time: PropTypes.string.isRequired,
    devId: PropTypes.string.isRequired,
    timerPickerValue: PropTypes.array.isRequired,
    timerPickerValueAction: PropTypes.func.isRequired,
    showNextDayAction: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      sectionList: [],
      curiseMode: props.cruise_mode === '0' ? 'panoramic' : 'collection',
      timeMode: props.cruise_time_mode === '0' ? 'dayCurise' : 'timeCurise',
      timerPickerValue: [480, 482],
      showNextDay: false,
      // 只有收藏点巡航
      onlyCollectMode: false,
    };
  }
  componentDidMount() {
    this.changeSectionList(this.props);
    this.getInitTime(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.changeSectionList(nextProps);
    this.getInitTime(nextProps);
    const { cruise_mode, cruise_time_mode } = nextProps;
    this.setState({
      curiseMode: cruise_mode === '0' ? 'panoramic' : 'collection',
      timeMode: cruise_time_mode === '0' ? 'dayCurise' : 'timeCurise',
    });
  }
  componentWillUnmount() {
    // RN页面返回也应进行监听
    backLivePlayWillUnmount();
  }

  // 判断只有收藏点巡航
  onlyHasCollect = () => {
    const { schema } = this.props;
    const cruise_modeSchmea = schema.cruise_mode;
    const cruiseModeRange = cruise_modeSchmea.range;
    if (cruiseModeRange.length === 1 && cruiseModeRange[0] === '1') {
      return true;
    }
    return false;
  };

  getMemoryPointList = async () => {
    const { devId } = this.props;
    try {
      const listData = await TYSdk.getMemoryPointList(devId);
      return listData.length;
    } catch (err) {
      console.log(err);
      const errResult = JSON.parse(err);
      CameraManager.showTip(errResult.errorMsg);
    }
  };
  getInitTime = props => {
    const { cruise_time } = props;
    let startTime = 0;
    let endTime = 0;
    let showNextDay = false;
    if (cruise_time === '' || cruise_time === undefined) {
      startTime = moment(new Date()).format('HH:mm');
      const currentStamp = moment(new Date()).valueOf();
      endTime = moment(currentStamp + 3600 * 2000).format('HH:mm');
    } else {
      const timeObj = JSON.parse(cruise_time);
      startTime = timeObj.t_start;
      endTime = timeObj.t_end;
      if (convertHourMinute(startTime) >= convertHourMinute(endTime)) {
        showNextDay = true;
      }
    }
    this.setState({
      timerPickerValue: [convertHourMinute(startTime), convertHourMinute(endTime)],
      showNextDay,
    });
  };
  openTimerPop = () => {
    const { timerPickerValue, showNextDay } = this.state;
    this.props.showNextDayAction({ showNextDay });
    this.props.timerPickerValueAction({
      timerPickerValue,
    });
    PanelClick.saveCustomDialogDataToRedux('curiseTimePicker');
  };

  changeSectionList = async props => {
    const { cruise_switch, cruise_time, cruise_mode, cruise_schedule } = props;
    // 这里判断收藏点的个数为1,且为收藏点模式时,主动下发为全景巡航
    if (cruise_mode === '1') {
      try {
        const pointLength = await this.getMemoryPointList();
        if (pointLength < 2) {
          if (this.onlyHasCollect()) {
            TYDevice.putDeviceData({
              cruise_switch: false,
            });
          } else {
            TYDevice.putDeviceData({
              cruise_mode: '0',
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    // 根据巡航模式的枚举值
    const { schema } = this.props;
    const cruise_modeSchmea = schema.cruise_mode;
    const cruiseModeRange = cruise_modeSchmea.range;
    const sectionList = [
      {
        data: [
          {
            key: 'cruiseSwitch',
            title: Strings.getLang('ipc_cruise_settings'),
            value: cruise_switch,
            onValueChange: value => this.changeValue('cruise_switch', value),
          },
        ],
      },
    ];
    if (cruise_switch) {
      if (cruiseModeRange.length === 1) {
        // 巡航模式枚举只有1个,为1时表示只有收藏点巡航，需额外添加提示及判定
        if (cruiseModeRange[0] === '1') {
          this.setState({
            onlyCollectMode: true,
          });
          // // 这里主动将巡航模式改为true
          // TYNative.putDpData({
          //   cruise_mode: '1',
          // });
        }
        // 枚举值只有1个, 默认为0，全天巡航
        if (cruise_time !== undefined) {
          // 有定时巡航
          sectionList.push({
            title: Strings.getLang('ipc_cruise_time_mode_select_txt'),
            data: [
              {
                key: 'dayCurise',
                title: Strings.getLang('ipc_cruise_time_mode_allday'),
                subTitle: Strings.getLang('ipc_cruise_time_mode_allday_tips'),
              },
              {
                key: 'timeCurise',
                title: Strings.getLang('ipc_cruise_time_mode_schedule'),
                subTitle: Strings.getLang('ipc_cruise_time_mode_schedule_tips'),
              },
            ],
          });
        }
      } else {
        // 枚举值大于1个, 默认为0，全天巡航和收藏点巡航
        if (cruise_time !== undefined) {
          sectionList.push(
            {
              title: Strings.getLang('ipc_cruise_mode_select_txt'),
              data: [
                {
                  key: 'panoramic',
                  title: Strings.getLang('ipc_cruise_mode_full'),
                  subTitle: Strings.getLang('ipc_cruise_mode_full_tips'),
                },
                {
                  key: 'collection',
                  title: Strings.getLang('ipc_cruse_mode_memory'),
                  subTitle: Strings.getLang('ipc_cruise_mode_memory_tips'),
                },
              ],
            },
            {
              title: Strings.getLang('ipc_cruise_time_mode_select_txt'),
              data: [
                {
                  key: 'dayCurise',
                  title: Strings.getLang('ipc_cruise_time_mode_allday'),
                  subTitle: Strings.getLang('ipc_cruise_time_mode_allday_tips'),
                },
                {
                  key: 'timeCurise',
                  title: Strings.getLang('ipc_cruise_time_mode_schedule'),
                  subTitle: Strings.getLang('ipc_cruise_time_mode_schedule_tips'),
                },
              ],
            }
          );
        } else {
          sectionList.push({
            title: Strings.getLang('ipc_cruise_mode_select_txt'),
            data: [
              {
                key: 'panoramic',
                title: Strings.getLang('ipc_cruise_mode_full'),
                subTitle: Strings.getLang('ipc_cruise_mode_full_tips'),
              },
              {
                key: 'collection',
                title: Strings.getLang('ipc_cruse_mode_memory'),
                subTitle: Strings.getLang('ipc_cruise_mode_memory_tips'),
              },
            ],
          });
        }
      }

      // 这里根据cruise_schedule dp点判定是否显示极简巡航
      if (typeof cruise_schedule !== 'undefined') {
        sectionList.push({
          title: Strings.getLang('ipc_cruise_schedule_tip'),
          data: [
            {
              key: 'cruiseSchedule',
              title: Strings.getLang('ipc_cruise_schedule'),
            },
          ],
        });
      }
    }
    this.setState({
      sectionList,
    });
  };

  changeValue = async (key, value) => {
    if (key === 'cruise_mode' && value === '1') {
      try {
        const pointLength = await this.getMemoryPointList();
        if (pointLength < 2) {
          CameraManager.showTip(Strings.getLang('ipc_errmsg_cruise_memorypint_limit'));
          return false;
        }
      } catch (err) {
        CameraManager.showTip(Strings.getLang('systemError'));
      }
    } else if (key === 'cruise_time_mode' && value === '1') {
      this.openTimerPop(key, value);
      return false;
    } else if (key === 'cruise_switch' && value) {
      if (this.onlyHasCollect()) {
        try {
          const pointLength = await this.getMemoryPointList();
          if (pointLength < 2) {
            CameraManager.showTip(Strings.getLang('ipc_errmsg_cruise_memorypint_limit'));
            return false;
          }
        } catch (err) {
          CameraManager.showTip(Strings.getLang('systemError'));
        }
      }
    }
    TYDevice.putDeviceData({
      [key]: value,
    });
  };
  backLivePage = () => {
    backNavigatorLivePlay();
  };
  gotoSchedulePage = () => {
    // enterDpTimePage('cruiseSchedule');
    this.jumpToTimer();
  };
  jumpToTimer = () => {
    const { schema } = this.props;
    const cruiseStayTimeSchema = schema.cruise_stay_time;
    const { min: cruiseStayMin, max: cruiseStayMax, step: cruiseStayStep } = cruiseStayTimeSchema;
    const rangLength = (cruiseStayMax - cruiseStayMin) / cruiseStayStep + 1;
    const rangeKeys = [];
    const rangeValues = [];
    for (let i = 0; i < rangLength; i++) {
      const itemValue = cruiseStayMin + cruiseStayStep * i;
      rangeKeys.push(itemValue);
      rangeValues.push({
        dpValue: `${itemValue} ${Strings.getLang('ipc_cruise_stay_time_schedule_unit')}`,
      });
    }
    const paramData = [
      {
        dpId: TYNative.getDpIdByCode('cruise_stay_time'),
        dpName: Strings.getDpLang('cruise_stay_time'),
        selected: 0,
        rangeKeys,
        rangeValues,
      },
    ];
    const timerConfig = {
      addTimerRouter: 'addTimer',
      category: 'cruiseStayTime',
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
  };
  renderArrow = () => {
    return <Image source={Res.publicImage.listRightArrow} style={styles.arrowImg} />;
  };
  renderCuriosMode = key => {
    const { curiseMode } = this.state;
    return (
      <View>
        {curiseMode === key && (
          <Image source={Res.publicImage.checkCircle} style={styles.checkImg} />
        )}
      </View>
    );
  };
  renderCuriosWay = key => {
    const { timeMode } = this.state;
    return (
      <View>
        {timeMode === key && <Image source={Res.publicImage.checkCircle} style={styles.checkImg} />}
      </View>
    );
  };
  renderItem = ({ item, index }) => {
    const { key, ...itemProps } = item;
    const { timerPickerValue, showNextDay } = this.state;
    return (
      <View>
        {(key === 'panoramic' || key === 'collection') && (
          <TYSectionList.Item
            Action={this.renderCuriosMode(key)}
            onPress={() => this.changeValue('cruise_mode', key === 'panoramic' ? '0' : '1')}
            {...itemProps}
          />
        )}
        {(key === 'dayCurise' || key === 'timeCurise') && (
          <TYSectionList.Item
            Action={this.renderCuriosWay(key)}
            onPress={() => this.changeValue('cruise_time_mode', key === 'dayCurise' ? '0' : '1')}
            children={
              key === 'timeCurise' ? (
                <View style={styles.realTimeForCuriseBox}>
                  <TYText style={styles.realTimeForCuriseTitle}>
                    {`${Strings.getLang('realTimeForCurise')}: `}
                  </TYText>
                  <TYText style={styles.realTimeForCuriseContent}>
                    {`${getHourMinute(timerPickerValue[0])} - ${getHourMinute(
                      timerPickerValue[1]
                    )} `}
                    {showNextDay ? Strings.getLang('nextDay') : ''}
                  </TYText>
                </View>
              ) : null
            }
            {...itemProps}
          />
        )}
        {key === 'cruiseSwitch' && <TYSectionList.SwitchItem {...item} />}
        {key === 'cruiseSchedule' && (
          <TYSectionList.Item
            Action={this.renderArrow()}
            onPress={() => {
              this.gotoSchedulePage();
            }}
            {...itemProps}
          />
        )}
      </View>
    );
  };

  renderOnlyCollectMode = () => {
    return (
      <View style={styles.onlyCollectMode}>
        <TYText style={styles.onlyCollectModeText}>{Strings.getLang('ipc_cruse_site_only')}</TYText>
      </View>
    );
  };

  render() {
    const { sectionList, onlyCollectMode } = this.state;
    return (
      <View style={styles.cruisepage}>
        <StatusBar
          barStyle={isIOS ? 'dark-content' : 'light-content'}
          translucent={true}
          backgroundColor="transparent"
        />
        <View style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}>
          <TopHeader
            hasRight={false}
            contentTitle={Strings.getLang('ipc_cruise_settings_title')}
            leftPress={this.backLivePage}
          />
        </View>
        {/* 只显示收藏点提示 */}
        {onlyCollectMode && this.renderOnlyCollectMode()}
        <TYSectionList
          style={{ alignSelf: 'stretch' }}
          scrollEnabled={false}
          contentContainerStyle={styles.sectionContain}
          sections={sectionList}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  cruisepage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionContain: {},
  checkImg: {
    width: cx(22),
    resizeMode: 'contain',
  },
  realTimeForCuriseBox: {
    paddingTop: cx(5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  realTimeForCuriseTitle: {
    color: '#333',
    fontSize: cx(14),
  },
  realTimeForCuriseContent: {
    color: '#999',
    fontSize: cx(14),
  },
  onlyCollectMode: {
    paddingHorizontal: cx(15),
    minHeight: cx(35),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  onlyCollectModeText: {
    color: '#7f7e88',
    marginTop: 12,
  },
});
const mapStateToProps = state => {
  const { devId, schema } = state.devInfo;
  const {
    cruise_switch,
    cruise_mode,
    cruise_time_mode,
    cruise_time,
    // 极简巡航本地定时
    cruise_schedule,
  } = state.dpState;
  const { showNextDay, timerPickerValue } = state.ipcCommonState;
  return {
    devId,
    cruise_switch,
    cruise_mode,
    cruise_time_mode,
    cruise_time,
    cruise_schedule,
    showNextDay,
    timerPickerValue,
    schema,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators(
    {
      showNextDayAction,
      timerPickerValueAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapToDisPatch)(CruisePage);
