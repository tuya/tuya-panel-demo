/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable new-cap */
/* eslint-disable react/prop-types */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import { View, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { TYSdk } from 'tuya-panel-kit';
import CameraManager from '../../../../nativeComponents/cameraManager';
import TopHeader from '../../../../publicComponents/topHeader';
import { backNavigatorLivePlay, backLivePlayWillUnmount } from '../../../../../config/click';
import { sToTen, sToHex, requestTimeout, cancelRequestTimeOut } from '../../../../../utils';
import Config from '../../../../../config';
import Strings from '../../../../../i18n';

const { winWidth, cx, cy, isIOS, statusBarHeight, isIphoneX } = Config;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
const __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) {
      for (const k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    }
    result.default = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });

const color_1 = __importDefault(require('color'));
const react_native_1 = require('react-native');
const react_native_svg_1 = require('react-native-svg');
const tuya_panel_kit_1 = require('tuya-panel-kit');
const theme_get_1 = require('../../theme/theme-get');
const utils_1 = require('../utils');
const timerCell_1 = __importDefault(require('./timerCell'));
const style_1 = require('./style');
const i18n_1 = __importDefault(require('../i18n'));

const { ThemeProvider, ThemeConsumer } = tuya_panel_kit_1.Utils.ThemeUtils;

class DpTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.getDataSource(props.allDpData[props.dpTimeCode]),
      cellHeight: 60,
      flatHeight: 60,
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const { dpTimeCode } = this.props;
    // 这里dpTimeCode 上报数据有变化的话重新获取值
    if (!_.isEqual(this.props.allDpData[dpTimeCode], nextProps.allDpData[dpTimeCode])) {
      // 传第二个参数表示dp值发生变化，需要根据返回的code去进行提示
      const dataSource = this.getDataSource(nextProps.allDpData[dpTimeCode], 'dpChange');
      TYNative.hideLoading();
      cancelRequestTimeOut();
      this.setState({
        dataSource,
      });
    }
  }

  componentWillUnmount() {
    // 添加判定是返回预览界面吗,  如果是调用，否则不调用
    const { backLivePlay } = this.props;
    if (backLivePlay) {
      backLivePlayWillUnmount();
    }
  }

  // 开启定时按钮
  onValueChange = (item, value) => {
    const { dpTimeCode } = this.props;
    const { dataSource } = this.state;
    const newData = dataSource.data.map(item => ({
      ...item,
    }));

    const newTimeData = {
      data: newData,
      code: 0,
    };

    newTimeData.data.forEach((i, index) => {
      if (item.id === i.id) {
        newTimeData.data[index].enabled = Boolean(value);
      }
      delete newTimeData.data[index].formatTimeStr;
    });
    newTimeData.data.code = 0;
    TYNative.showLoading({ title: '' });
    TYDevice.putDeviceData({
      [dpTimeCode]: sToHex(JSON.stringify(newTimeData)),
    });
    requestTimeout();
  };

  // 安卓长按删除按键
  onCellLongPress = (...args) => {
    if (react_native_1.Platform.OS !== 'android') return;
    TYNative.simpleConfirmDialog(
      i18n_1.default.getLang('timerDelete'),
      i18n_1.default.getLang('timerDeleteTip'),
      () => this.deleteTimer(...args),
      () => {}
    );
  };
  // 点击定时任务进入编辑定时页面
  onCellPress = (...args) => {
    this.pushToAdd(...args);
  };

  get theme() {
    const theme = this.props.theme ? { timer: this.props.theme } : {};
    return theme;
  }

  getDataSource = (data, key) => {
    // 如果有传第二个参数dpchange, 定义定时的协议一定不为空字符串, 只有设备第一次初始化时才会为“”。
    const { is12Hours } = this.props;
    let sendData = { data: [], code: -1 };
    if (typeof data === 'string' && data !== '') {
      try {
        // 先将Raw型数据转为十进制;
        const getTenData = sToTen(data);
        const scheduleData = JSON.parse(getTenData) || {};
        const scheduleObj = Object.keys(scheduleData);

        if (scheduleObj.length !== 0) {
          const { data: timeData, code } = scheduleData;
          if (key === 'dpChange') {
            if (code === -1) {
              CameraManager.showTip('ipc_dptime_data_format_err');
            } else if (code === -2) {
              CameraManager.showTip('ipc_dptime_data_content_err');
            }
          }
          if (timeData instanceof Array) {
            sendData.data = [...timeData];
            sendData.code = code;
          }
        }
      } catch (e) {
        // 出错，用eval继续解析JSON字符串
        sendData = { data: [], code: -1 };
      }
    }
    const { data: timeData } = sendData;
    if (timeData.length !== 0) {
      timeData.forEach((item, index) => {
        const formatTimeStr = utils_1.getFormatTime(item.time, is12Hours);
        timeData[index].formatTimeStr = formatTimeStr;
      });
    }
    return sendData;
  };
  deleteTimer = id => {
    const { dpTimeCode } = this.props;
    // 遍历拷贝一波
    const { dataSource } = this.state;
    const newData = dataSource.data.map(item => ({
      ...item,
    }));

    const newTimeData = {
      data: newData,
      code: 0,
    };

    if (dataSource.data instanceof Array) {
      const timerIsExist = _.findIndex(dataSource.data, item => {
        return item.id === id;
      });
      if (timerIsExist === -1) {
        // 这里表示定时数据被其他人删除
        TYNative.simpleTipDialog(Strings.getLang('ipc_dptime_has_delete_tip'), () => {});
        return false;
      }
      _.remove(newTimeData.data, item => {
        return item.id === id;
      });
    }
    if (newTimeData.data.length !== 0) {
      newTimeData.data.forEach((item, index) => {
        delete newTimeData.data[index].formatTimeStr;
      });
    }
    TYNative.showLoading({ title: '' });
    TYDevice.putDeviceData({
      [dpTimeCode]: sToHex(JSON.stringify(newTimeData)),
    });
    requestTimeout();
  };

  pushToAdd = (timerItem, isEdit) => {
    const {
      theme = {},
      is12Hours,
      dpTimeCode,
      dpsArrData,
      isTimeZone,
      timeZoneType,
      devInfo,
    } = this.props;
    const { dataSource } = this.state;
    const dpAddTimerRouter = 'dpAddTimer';
    // 取dp定时的功能点配置值
    const dpPanelConfig = _.get(devInfo, `panelConfig.fun.${dpTimeCode}_limit`);
    // 防止配置的值转成数值为NaN, 做进一步判定, dp本地定时的数量限制,默认与云端定时保持一致为30条
    const limit = dpPanelConfig ? (Number(dpPanelConfig) ? Number(dpPanelConfig) : 30) : 30;
    if (!isEdit && dataSource.length >= limit) {
      TYNative.simpleTipDialog(i18n_1.default.formatValue('dpToMuchWarning', limit), () => {});
      return;
    }
    const TYNavigator = TYSdk.Navigator;
    TYNavigator.push({
      theme,
      timerItem,
      id: dpAddTimerRouter,
      // 表示设置dp本地定时的dpCode的值
      dpTimeCode,
      is12Hours,
      hasRepeat: true,
      isPickerAlignCenter: true,
      isEdit,
      limit,
      dpsArrData,
      isTimeZone,
      timeZoneType,
      // 现有的定时数据,对于多设备同步，在dp点上报时将数据进行处理,保证定时数据是同步的
      dataSource,
    });
  };

  goBack = () => {
    backNavigatorLivePlay();
  };
  _renderHeader = () => {
    return (
      <View style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}>
        <TopHeader
          hasRight={false}
          contentTitle={i18n_1.default.getLang('timerList')}
          leftPress={this.goBack}
        />
      </View>
    );
  };
  _onLayout = e => {
    const { height } = e.nativeEvent.layout;
    this.setState({
      flatHeight: height,
    });
  };

  swipeoutOnOpen = index => {
    // const { dataSource } = this.state;
    // dataSource[index].rowOpen = !dataSource[index].rowOpen;
    // this.setState({
    //   dataSource,
    // });
  };

  renderItem = ({ item, index }) => {
    const { isMainSwitch } = this.props;
    // enable: 表示定时开启, tagStr: 表示备注, formatTimeStr: 根据24小时制实际展示， task为执行定时的dp点
    const { id, formatTimeStr, tagStr, repeatStr, enabled: switchValue, tasks } = item;
    const { dpsArrData } = this.props;
    const dpStrArr = utils_1.getTaskDpStr(tasks, dpsArrData);
    const timerCell = (
      <ThemeConsumer>
        {theme => {
          const propsWithTheme = Object.assign(Object.assign({}, this.props), { theme });
          const cellLine = theme_get_1.timer.cellLine(propsWithTheme);
          return (
            <react_native_1.View
              key={id}
              onLayout={e => {
                const { height } = e.nativeEvent.layout;
                this.setState({
                  cellHeight: Math.round(height),
                });
              }}
            >
              <timerCell_1.default
                accessibilityLabel={`Timer_TimerCell${index}`}
                style={[
                  index === 0 && {
                    borderColor: cellLine,
                    borderTopWidth: react_native_1.StyleSheet.hairlineWidth,
                  },
                  index === this.state.dataSource.data.length - 1 && {
                    borderColor: cellLine,
                    borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
                  },
                ]}
                theme={theme}
                switchChange={value => this.onValueChange(item, value)}
                switchValue={switchValue}
                tagStr={tagStr}
                timeStr={formatTimeStr}
                repeatStr={utils_1.GetRepeatStr(repeatStr)}
                dpStr={dpStrArr.length > 1 ? dpStrArr.join(' | ') : dpStrArr.join('')}
                bordered={index !== this.state.dataSource.data.length - 1}
                onLongPress={() => this.onCellLongPress(id)}
                // 这里传item的值
                onPress={() => this.onCellPress(item, true)}
                // onLongPress={() => this.onCellPress(item, true)}
                // // 这里传item的值
                // onPress={() => this.onCellLongPress(id)}
                rightItem={isMainSwitch ? 'arrow' : 'switch'}
              />
            </react_native_1.View>
          );
        }}
      </ThemeConsumer>
    );

    return react_native_1.Platform.OS === 'ios' ? (
      <tuya_panel_kit_1.Swipeout
        autoClose={true}
        accessibilityLabel={`Timer_Swipeout${index}`}
        backgroundColor="transparent"
        onOpen={() => this.swipeoutOnOpen(index)}
        // close={!this.state.dataSource[index].rowOpen}
        right={[
          {
            text: i18n_1.default.getLang('timerDelete'),
            onPress: () => this.deleteTimer(id),
            type: 'delete',
            fontStyle: { color: '#fff', fontSize: cx(16) },
          },
        ]}
      >
        {timerCell}
      </tuya_panel_kit_1.Swipeout>
    ) : (
      timerCell
    );
  };
  // 定时Flatlist
  renderListHeaderComponent = () => {
    return (
      <style_1.StyledSubTitle
        onLayout={e => {
          const { height } = e.nativeEvent.layout;
          this.setState({
            titleHight: height,
          });
        }}
        style={{
          padding: cx(16),
          paddingBottom: cx(8),
        }}
      >
        {i18n_1.default.getLang('timerWarning')}
      </style_1.StyledSubTitle>
    );
  };

  render() {
    const { tintEmptyImage = true } = this.props;
    const { data: timeData } = this.state.dataSource;
    const isDisabled = timeData.length === 0;
    const isEmpty = timeData.length === 0;
    const footerDimension = { width: winWidth, height: isIphoneX ? 118 : cx(88) };
    const { cellHeight, titleHight, flatHeight } = this.state;
    const scrollEnabled = Boolean(
      cellHeight * timeData.length + titleHight > isIOS ? flatHeight - 30 : flatHeight
    );
    return (
      <ThemeProvider theme={this.theme}>
        <style_1.StyledContainer>
          <StatusBar
            barStyle={isIOS ? 'dark-content' : 'light-content'}
            translucent={true}
            backgroundColor="transparent"
          />
          {this._renderHeader()}
          <style_1.StyledListWrapper isDisabled={isDisabled}>
            {timeData.length ? (
              <react_native_1.FlatList
                onLayout={this._onLayout}
                keyExtractor={item => item.id}
                data={timeData}
                renderItem={this.renderItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                ListHeaderComponent={this.renderListHeaderComponent}
              />
            ) : (
              <style_1.Center>
                <style_1.StyledImage tintEmptyImage={tintEmptyImage} />
                <style_1.StyledSubTitle style={{ marginTop: cy(18), textAlign: 'center' }}>
                  {i18n_1.default.getLang('noTimerList')}
                </style_1.StyledSubTitle>
                {isEmpty && (
                  <style_1.StyledButton
                    accessibilityLabel="Timer_AddSchedule"
                    isEmpty={true}
                    onPress={() => this.pushToAdd()}
                  >
                    <style_1.StyledButtonText isEmpty={true}>
                      {i18n_1.default.getLang('addTimer')}
                    </style_1.StyledButtonText>
                  </style_1.StyledButton>
                )}
              </style_1.Center>
            )}
          </style_1.StyledListWrapper>
          {!isEmpty && (
            <react_native_1.View
              style={[
                footerDimension,
                {
                  position: 'absolute',
                  bottom: 0,
                  backgroundColor: 'transparent',
                },
              ]}
            >
              <ThemeConsumer>
                {theme => {
                  const propsWithTheme = Object.assign(Object.assign({}, this.props), { theme });
                  const boardBg = theme_get_1.timer.boardBg(propsWithTheme);
                  const c1 = color_1
                    .default(boardBg)
                    .alpha(0)
                    .rgbString();
                  return (
                    <tuya_panel_kit_1.LinearGradient
                      style={footerDimension}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="40%"
                      stops={{
                        '0%': c1,
                        '100%': boardBg,
                      }}
                    >
                      <react_native_svg_1.Rect {...footerDimension} />
                    </tuya_panel_kit_1.LinearGradient>
                  );
                }}
              </ThemeConsumer>
            </react_native_1.View>
          )}
          {!isEmpty && (
            <style_1.StyledButton
              accessibilityLabel="Timer_AddSchedule"
              isEmpty={false}
              onPress={() => this.pushToAdd()}
            >
              <style_1.StyledButtonText isEmpty={false}>
                {i18n_1.default.getLang('addTimer')}
              </style_1.StyledButtonText>
            </style_1.StyledButton>
          )}
        </style_1.StyledContainer>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => {
  const { devInfo } = state;
  return {
    allDpData: { ...state.dpState },
    devInfo,
  };
};

export default connect(mapStateToProps, null)(DpTimer);
