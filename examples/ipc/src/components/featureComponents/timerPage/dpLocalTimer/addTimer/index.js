/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable new-cap */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import { Dialog, Popup, TYSdk } from 'tuya-panel-kit';
// 这里使用connect将本地定时的dp点的数据进行获取
import { connect } from 'react-redux';
import moment from 'moment';
import Config from '../../../../../config';
import Strings from '../../../../../i18n';
import { sToHex, requestTimeout, cancelRequestTimeOut } from '../../../../../utils';

const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };

const { cx, cy, isIOS, statusBarHeight } = Config;
const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const react_native_1 = require('react-native');

const components_1 = require('../components');
const tuya_panel_kit1 = require('tuya-panel-kit');
const repeatCircle_1 = __importDefault(require('./repeatCircle'));
const theme_get_1 = require('../../theme/theme-get');
const i18n_1 = __importDefault(require('../i18n'));
const utils_1 = require('../utils');
const style_1 = require('./style');

const { parseJSON } = tuya_panel_kit1.Utils.JsonUtils;
const { parseTimer, stringToSecond } = tuya_panel_kit1.Utils.TimeUtils;
const { ThemeProvider, ThemeConsumer } = tuya_panel_kit1.Utils.ThemeUtils;

const Row = props => {
  return (
    <react_native_1.TouchableOpacity
      accessibilityLabel={props.accessibilityLabel}
      style={props.style}
      activeOpacity={1}
      onPress={props.onPress}
    >
      <style_1.StyledCell>
        <style_1.StyledTitle numberOfLines={1} size={cx(17)}>
          {props.title}
        </style_1.StyledTitle>
        <react_native_1.View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <style_1.StyledSubTitle style={{ flex: 1 }}>{props.content}</style_1.StyledSubTitle>
        </react_native_1.View>
      </style_1.StyledCell>
      {!!props.bordered && <style_1.StyledDivider />}
    </react_native_1.TouchableOpacity>
  );
};

class DpAddTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repeatSelected: props.isEdit ? props.timerItem.repeatStr : '0000000',
      time: props.isEdit ? props.timerItem.time : this.getInitTime(props),
      // time: '22:20~23:20',
      tag: props.isEdit ? props.timerItem.tagStr : '',
      scrollHeight: 100,
      contentHeight: 100,
      dpDataList: this.getInitDpData(props),
      initDataSource: props.dataSource,
      // saveData: this.getInitSaveData(props),
    };
  }
  componentDidMount() {
    //  这里使用监听dp点的方法,检测到有上报后返回上一页
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
      this.setState({
        initDataSource: nextProps.dataSource,
      });
    }
  }

  componentWillUnmount() {
    TYEvent.off('dpDataChange', this.dpChange);
  }

  onRepeatSelect = value => {
    this.setState({
      repeatSelected: value,
      repeatContent: utils_1.GetRepeatStr(value),
    });
  };

  onTagPress = () => {
    const { tag } = this.state;
    Dialog.prompt({
      accessibilityLabel: 'Timer_TagInput',
      title: i18n_1.default.getLang('tag'),
      cancelText: i18n_1.default.getLang('cancel'),
      confirmText: i18n_1.default.getLang('confirm'),
      defaultValue: tag,
      autoFocus: true,
      onConfirm: text => {
        this.setState({ tag: text });
        Dialog.close();
      },
    });
  };

  onDpPress = dpData => {
    const { type } = dpData;
    type !== 'value' &&
      Popup.picker({
        accessibilityLabel: 'Timer_PopupPicker',
        dataSource: dpData.selectedValue.map((item, index) => ({
          value: item.value,
          label: item.name,
        })),
        value: dpData.selectedValue[dpData.selected].value,
        title: dpData.dpName,
        cancelText: i18n_1.default.getLang('cancel'),
        confirmText: i18n_1.default.getLang('confirm'),
        onConfirm: value => {
          this.onDpConfirm({ value, rowItem: dpData, dpStateData: this.state.dpDataList });
        },
      });
    type === 'value' &&
      Popup.numberSelector({
        title: dpData.unit === '' ? `${dpData.dpName}` : `${dpData.dpName} (${dpData.unit})`,
        cancelText: i18n_1.default.getLang('cancel'),
        confirmText: i18n_1.default.getLang('confirm'),
        value: dpData.defaultValue,
        min: dpData.min,
        max: dpData.max,
        step: dpData.step,
        onConfirm: value => {
          this.onDpConfirm({ value, rowItem: dpData, dpStateData: this.state.dpDataList });
          Popup.close();
        },
      });
    return false;
  };
  onDpConfirm = dpConfirm => {
    const { value, rowItem, dpStateData } = dpConfirm;
    // 遍历拷贝一波
    const newDpState = dpStateData.map(item => ({
      ...item,
    }));
    newDpState.forEach((item, index) => {
      if (rowItem.dp === item.dp) {
        if (rowItem.type !== 'value') {
          const selectedIndex = _.findIndex(rowItem.selectedValue, o => {
            return o.value === value;
          });
          newDpState[index].selected = selectedIndex;
        } else {
          newDpState[index].defaultLabel = value;
          newDpState[index].defaultValue = value;
        }
      }
    });
    this.setState({ dpDataList: newDpState });
    Popup.close();
  };

  get theme() {
    const theme = this.props.theme ? { timer: this.props.theme } : {};
    return theme;
  }

  getInitDpData = props => {
    const { dpsArrData, isEdit } = props;
    // 遍历拷贝一波
    const initShowData = dpsArrData.map(item => ({
      ...item,
    }));
    if (isEdit) {
      const { timerItem } = this.props;
      const { tasks } = timerItem;
      tasks.forEach((item, itemIndex) => {
        initShowData.forEach((o, oIndex) => {
          if (o.dp === item.dp) {
            if (o.type !== 'value') {
              const newSelected = _.findIndex(o.selectedValue, selected => {
                return selected.value === item.value;
              });
              initShowData[oIndex].selected = newSelected;
            } else {
              const newDefaultLabel = item.value;
              initShowData[oIndex].defaultLabel = newDefaultLabel;
              initShowData[oIndex].defaultValue = newDefaultLabel;
            }
          }
        });
      });
    }

    return initShowData;
  };
  // 非编辑定时页面
  getInitTime = props => {
    const date = new Date();
    let time = `${utils_1.addBeforetimeZeros(date.getHours())}:${utils_1.addBeforetimeZeros(
      date.getMinutes()
    )}`;
    if (props.isTimeZone) {
      const endDate = new Date();
      endDate.setMinutes(date.getMinutes() + 30);
      const endTime = `${utils_1.addBeforetimeZeros(
        endDate.getHours()
      )}:${utils_1.addBeforetimeZeros(endDate.getMinutes())}`;
      time = time.concat(`~${endTime}`);
    }
    return time;
  };
  // 保存按钮
  save = () => {
    const tasks = [];
    const { isEdit, timerItem, dpTimeCode } = this.props;
    const { tag, repeatSelected, time, dpDataList } = this.state;
    dpDataList.forEach((item, index) => {
      if (item.type === 'value') {
        tasks.push({ dpId: item.dpId, type: item.type, value: item.defaultValue });
      } else {
        tasks.push({
          dpId: item.dpId,
          type: item.type,
          value: item.selectedValue[item.selected].value,
        });
      }
    });
    const sendData = {
      enabled: true,
      repeatStr: repeatSelected,
      time,
      tagStr: tag,
      tasks,
    };
    const { initDataSource } = this.state;
    if (isEdit) {
      // 当前定时的id
      const { id } = timerItem;
      sendData.id = id;
      // 对于编辑按钮进行判定，在编辑保存时，如果此条数据已被删除，给予提示
      const idIsExist = _.findIndex(initDataSource.data, o => {
        return o.id === id;
      });
      if (idIsExist === -1) {
        TYNative.simpleTipDialog(Strings.getLang(Strings.getLang('ipc_dptime_tip_err')), () => {
          const TYNavigator = TYSdk.Navigator;
          TYNavigator.pop();
        });
      } else {
        // 如果存在的话更改Data数据
        initDataSource.data[idIsExist] = sendData;
      }
    } else {
      // 非编辑添加时间
      // 获取当前时间戳为下发的id
      const idRandom = moment().valueOf(new Date());
      sendData.id = idRandom;
      initDataSource.data.push(sendData);
    }
    initDataSource.code = 0;
    const sendString = JSON.stringify(initDataSource);
    TYNative.showLoading({ title: '' });
    // Raw型需要转为16进制
    TYDevice.putDeviceData({
      [dpTimeCode]: sToHex(sendString),
    });
    requestTimeout();
  };

  dpChange = data => {
    const changedp = data.payload;
    const { dpTimeCode } = this.props;
    if (changedp[dpTimeCode] !== undefined) {
      cancelRequestTimeOut();
      TYNative.hideLoading();
      const TYNavigator = TYSdk.Navigator;
      TYNavigator.pop();
    }
  };

  renderTagView = () => {
    const { repeatRouter, repeatType = 'circle' } = this.props;
    const { tag } = this.state;
    return (
      <Row
        style={{ marginTop: repeatRouter || repeatType === 'popup' ? 0 : 22 }}
        accessibilityLabel="Timer_TagRow"
        title={i18n_1.default.getLang('tag')}
        bordered={this.props.isSupportNotice}
        content={tag}
        onPress={this.onTagPress}
      />
    );
  };
  renderRepeatView = () => {
    const { hasRepeat, repeatRouter, repeatType = 'circle' } = this.props;
    if (!hasRepeat) {
      return null;
    }
    if (repeatRouter || repeatType === 'popup') {
      return (
        <Row
          style={{ marginTop: 16 }}
          accessibilityLabel="Timer_RepeatRow"
          bordered={true}
          title={i18n_1.default.getLang('repeat')}
          content={this.state.repeatContent}
          onPress={this.onRepeatPress}
        />
      );
    }
    return (
      <repeatCircle_1.default selected={this.state.repeatSelected} onSelect={this.onRepeatSelect} />
    );
  };

  renderHeader = () => {
    const { isEdit } = this.props;
    return (
      <components_1.TopBar
        title={i18n_1.default.getLang(isEdit ? 'editTimer' : 'addTimer')}
        leftActions={[
          {
            accessibilityLabel: 'TopBar_Btn_Back',
            contentStyle: { fontSize: 16 },
            source: i18n_1.default.getLang('cancel'),
            onPress: () => {
              const TYNavigator = TYSdk.Navigator;
              TYNavigator.pop();
            },
          },
        ]}
        actions={[
          {
            accessibilityLabel: 'TopBar_Btn_Save',
            contentStyle: { fontSize: 16 },
            source: i18n_1.default.getLang('save'),
            onPress: this.save,
          },
        ]}
      />
    );
  };

  // 渲染触发dp点的数据
  renderDpView = () => {
    let dpList;
    const { dpDataList } = this.state;
    // const dpDataList = Object.values(this.state.dpData);
    // const { renderDpItem } = this.props;
    if (dpDataList.length) {
      dpList = (
        <react_native_1.View style={{ marginTop: 16 }}>
          {dpDataList.map((item, index) => {
            const renderRow = originRowProps => (
              <Row
                key={`Timer_DpRow_${index}`}
                accessibilityLabel={`Timer_DpRow_${index}`}
                bordered={index !== dpDataList.length - 1}
                title={item.dpName}
                content={
                  item.type !== 'value'
                    ? item.selectedValue[item.selected].name
                    : `${item.defaultLabel}${item.unit}`
                }
                onPress={() => this.onDpPress(item)}
                {...originRowProps}
              />
            );
            // const DpItem =
            //   renderDpItem &&
            //   renderDpItem({
            //     dataSource: showItemArr,
            //     rowItem: item,
            //     index,
            //     renderRow,
            //     dpStateData: this.state.dpData,
            //     onDpConfirm: this.onDpConfirm,
            //   });
            // if (typeof renderDpItem === 'function' && DpItem) {
            //   return DpItem;
            // }
            return renderRow();
          })}
        </react_native_1.View>
      );
    } else {
      dpList = null;
    }
    return dpList;
  };
  renderDatePicker = () => {
    const { is12Hours, isPickerAlignCenter, loop } = this.props;
    const [hour, minute] = this.state.time.split(':');
    return (
      <style_1.StyledTimerPointPicker
        is12Hours={is12Hours}
        loop={loop}
        isPickerAlignCenter={isPickerAlignCenter}
        hour={hour}
        minute={minute}
        onTimerChange={value => {
          this.setState({ time: parseTimer(value * 60) });
        }}
      />
    );
  };
  renderTimeZone = () => {
    const { is12Hours, timeZoneType = 'timerPicker' } = this.props;
    const [startTime, endTime] = this.state.time.split('~');
    const [formatStartTime, formatEndTime] = this.state.time.split('~').map(v => {
      return is12Hours ? utils_1.parseHour12(stringToSecond(v) * 60) : v;
    });
    let TimeZone;
    switch (timeZoneType) {
      case 'popup':
        TimeZone = [
          <Row
            key="Timer_StartTimeRow"
            accessibilityLabel="Timer_StartTimeRow"
            bordered={true}
            title={i18n_1.default.getLang('startTimeTitle')}
            content={formatStartTime}
            onPress={() => this.showDatePicker('start', startTime)}
          />,
          <Row
            key="Timer_EndTimeRow"
            accessibilityLabel="Timer_EndTimeRow"
            title={i18n_1.default.getLang('endTimeTitle')}
            content={formatEndTime}
            onPress={() => this.showDatePicker('end', endTime)}
          />,
        ];
        break;
      case 'timerPicker':
        {
          const [start, end] = [startTime, endTime].map(stringToSecond);
          const [startAmPm, startText] = formatStartTime.split(' ');
          const [endAmPm, endText] = formatEndTime.split(' ');
          const isTomorrow = start > end;
          TimeZone = (
            <style_1.StyledTimeZone>
              <style_1.StyledTimeZoneHeader>
                <style_1.StyledTimeZoneItem>
                  <style_1.StyledTimeZoneText>
                    {i18n_1.default.formatValue('startTimeTip', startAmPm)}
                  </style_1.StyledTimeZoneText>
                  <style_1.StyledTimeZoneTitle>{startText}</style_1.StyledTimeZoneTitle>
                  <style_1.StyledTimeZoneText secondary={true}>
                    {i18n_1.default.getLang('startTimeTitle')}
                  </style_1.StyledTimeZoneText>
                </style_1.StyledTimeZoneItem>
                <style_1.StyledTimeZoneSymbol />
                <style_1.StyledTimeZoneItem>
                  <style_1.StyledTimeZoneText>
                    {i18n_1.default.formatValue(
                      'endTimeTip',
                      isTomorrow ? `${i18n_1.default.getLang('tomorrow')} ` : '',
                      endAmPm
                    )}
                  </style_1.StyledTimeZoneText>
                  <style_1.StyledTimeZoneTitle>{endText}</style_1.StyledTimeZoneTitle>
                  <style_1.StyledTimeZoneText secondary={true}>
                    {i18n_1.default.getLang('endTimeTitle')}
                  </style_1.StyledTimeZoneText>
                </style_1.StyledTimeZoneItem>
              </style_1.StyledTimeZoneHeader>
              <style_1.StyledTimerRangePicker
                accessibilityLabel="Timer_TimerRangePicker"
                loop={false}
                startTime={stringToSecond(startTime)}
                endTime={stringToSecond(endTime)}
                onTimerChange={(sTime, eTime) => {
                  const time = `${parseTimer(sTime * 60)}~${parseTimer(eTime * 60)}`;
                  this.setState({ time });
                }}
                is12Hours={is12Hours}
                prefixPosition={['left', 'left']}
              />
            </style_1.StyledTimeZone>
          );
        }
        break;
      default:
        TimeZone = null;
        break;
    }
    return TimeZone;
  };

  render() {
    const scrollEnabled = this.state.scrollHeight >= this.state.contentHeight;
    return (
      <ThemeProvider theme={this.theme}>
        <style_1.StyledContainer>
          <ThemeConsumer>
            {theme => {
              const propsWithTheme = Object.assign(Object.assign({}, this.props), { theme });
              const statusBgStyle = theme_get_1.timer.statusBgStyle(propsWithTheme);
              return <react_native_1.StatusBar barStyle={statusBgStyle} />;
            }}
          </ThemeConsumer>
          <react_native_1.StatusBar
            barStyle={isIOS ? 'dark-content' : 'light-content'}
            translucent={true}
            backgroundColor="transparent"
          />
          <react_native_1.View
            style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}
          >
            {this.renderHeader()}
          </react_native_1.View>
          <style_1.StyledContainer style={{ marginTop: cy(16) }}>
            {!this.props.isTimeZone ? this.renderDatePicker() : this.renderTimeZone()}
            <react_native_1.ScrollView
              scrollEnabled={scrollEnabled}
              onLayout={({ nativeEvent: { layout } }) => {
                this.setState({ contentHeight: layout.height });
              }}
              onContentSizeChange={(_, height) => {
                this.setState({ scrollHeight: height });
              }}
            >
              {this.renderRepeatView()}
              {this.renderTagView()}
              {this.renderDpView()}
            </react_native_1.ScrollView>
          </style_1.StyledContainer>
        </style_1.StyledContainer>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => {
  return {
    allDpData: { ...state.dpState },
  };
};

export default connect(mapStateToProps, null)(DpAddTimer);
