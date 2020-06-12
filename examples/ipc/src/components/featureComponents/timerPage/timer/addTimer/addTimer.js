/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import { Dialog, Popup, TYSdk } from 'tuya-panel-kit';
import Config from '../../../../../config';
import Strings from '../../../../../i18n';

const { isIOS, statusBarHeight } = Config;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

/* eslint-disable camelcase */
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
const get_1 = __importDefault(require('lodash/get'));
const React = __importStar(require('react'));
const react_native_1 = require('react-native');
const tuya_panel_kit_1 = require('tuya-panel-kit');
// const dialog_1 = __importDefault(require('../../dialog'));
// const popup_1 = __importDefault(require('../../popup'));
const repeat_1 = __importDefault(require('./repeat'));
const repeatCircle_1 = __importDefault(require('./repeatCircle'));
const theme_get_1 = require('../../theme/theme-get');
const components_1 = require('../components');
const api_1 = require('../api');
const i18n_1 = __importDefault(require('../i18n'));
const utils_1 = require('../utils');
const style_1 = require('./style');

const { parseJSON } = tuya_panel_kit_1.Utils.JsonUtils;
const { parseTimer, stringToSecond } = tuya_panel_kit_1.Utils.TimeUtils;
const { ThemeProvider, ThemeConsumer } = tuya_panel_kit_1.Utils.ThemeUtils;
const { convertX: cx, convertY: cy } = tuya_panel_kit_1.Utils.RatioUtils;
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
          {/* {!isCollect && <style_1.StyledIcon name="arrow" size={cx(14)} />} */}
        </react_native_1.View>
      </style_1.StyledCell>
      {!!props.bordered && <style_1.StyledDivider />}
    </react_native_1.TouchableOpacity>
  );
};
class AddTimer extends React.Component {
  constructor(props) {
    super(props);
    this.showItemArr = [];
    this.onApiSuccess = () => {
      TYNative.hideLoading();
      if (this.props.fetchData) {
        this.props.fetchData();
      }
      const TYNavigator = TYSdk.Navigator;
      TYNavigator.pop();
    };
    this.save = () => {
      TYNative.showLoading({ title: '' });
      const { time } = this.state;
      const { category } = this.props;
      let dps = {};
      this.showItemArr.length &&
        this.showItemArr.map(dpData => {
          dps[dpData.dpId] = dpData.rangeKeys[dpData.selected];
        });

      if (this.props.saveExtraHandler) {
        const extraDps = this.props.saveExtraHandler(dps);
        dps = extraDps || dps;
      }
      const params = time.split('~').map(item => {
        return { time: item, dps };
      });
      const error = response => {
        const err = parseJSON(response);
        TYNative.hideLoading();
        TYNative.simpleTipDialog(err.message || err.errorMsg, () => {});
      };
      if (this.props.groupId) {
        api_1
          .updateTimer({
            groupId: this.props.groupId,
            category,
            loops: this.state.repeatSelected,
            instruct: params,
            aliasName: this.state.tag,
            isAppPush: this.state.isAppPush,
          })
          .then(this.onApiSuccess, error);
      } else {
        api_1
          .addTimer({
            category,
            loops: this.state.repeatSelected,
            instruct: params,
            aliasName: this.state.tag,
            isAppPush: this.state.isAppPush,
          })
          .then(this.onApiSuccess, error);
      }
    };
    this.getDpStr = index => {
      const { isEdit, isTimeZone, dpDataList, hasRepeat, isMainSwitch, dataSource } = this.props;
      const tempTime = isTimeZone ? this.state.time.split('~') : [this.state.time];
      const time = tempTime.reduce((tTotal, tCurrent) => {
        return tTotal + tCurrent.split(':').join('');
      }, '');
      const switchStr = isMainSwitch
        ? ''
        : isEdit
        ? dataSource[index].switchValue
          ? '01'
          : '00'
        : '01';
      let repeat = hasRepeat
        ? parseInt(this.state.repeatSelected || '0000000', 2).toString(16)
        : '';
      if (hasRepeat && repeat.length === 1) {
        repeat = `0${repeat}`;
      }
      const dpArr = Array(dpDataList.length).fill('noData');
      Object.keys(this.state.dpData).map(id => {
        const dpData = this.state.dpData[id];
        dpArr[dpData.index] = dpData.rangeKeys[dpData.selected];
      });
      const dpStr = dpArr.filter(value => value !== 'noData').join('');
      return `${switchStr}${time}${repeat}${dpStr}`;
    };
    this.putUpDP = () => {
      const { mainSwitch, dataSource, isMainSwitch, index, isEdit } = this.props;
      let sendData = '';
      if (dataSource.length > 0) {
        sendData = dataSource.reduce(
          (total, current, rindex) => {
            let currentData = current.originalData;
            if (rindex === index && isEdit) {
              currentData = this.getDpStr(rindex);
            }
            return total + currentData;
          },
          isMainSwitch ? (mainSwitch ? '01' : '00') : ''
        );
        if (!isEdit) {
          sendData = `${sendData}${this.getDpStr(0)}`;
        }
      } else {
        sendData = this.getDpStr(0);
      }
      TYDevice.putDeviceData({ [this.props.dpId]: sendData });
      this.onApiSuccess();
    };
    this.onDpPress = dpData => {
      Popup.picker({
        accessibilityLabel: 'Timer_PopupPicker',
        dataSource: dpData.rangeValues.map((item, index) => ({
          value: dpData.rangeKeys[index],
          label: item.dpValue,
        })),
        value: dpData.rangeKeys[dpData.selected],
        title: dpData.dpName,
        cancelText: i18n_1.default.getLang('cancel'),
        confirmText: i18n_1.default.getLang('confirm'),
        onConfirm: value =>
          this.onDpConfirm({ value, rowItem: dpData, dpStateData: this.state.dpData }),
      });
    };
    this.onDpConfirm = dpConfirm => {
      const { value, rowItem, dpStateData } = dpConfirm;
      const newDpdata = Object.assign({}, dpStateData);
      newDpdata[rowItem.dpId].selected = rowItem.rangeKeys.indexOf(value);
      this.setState({ dpData: newDpdata });
      Popup.close();
    };
    this.handleTime = (date, type) => {
      if (type === 'single') {
        const dateStr = `${this.plusZero(new Date(date).getHours())}:${this.plusZero(
          new Date(date).getMinutes()
        )}`;
        this.setState({
          time: dateStr,
        });
      } else {
        const tempTime = this.state.time.split('~');
        tempTime[type === 'start' ? 0 : 1] = `${this.plusZero(
          new Date(date).getHours()
        )}:${this.plusZero(new Date(date).getMinutes())}`;
        this.tempTime = tempTime.join('~');
      }
    };
    this.plusZero = num => {
      return num < 10 ? `0${num}` : num;
    };
    this.confirmTime = () => {
      this.setState({ time: this.tempTime });
      Popup.close();
    };
    this.onRepeatSelect = value => {
      this.setState({
        repeatSelected: value,
        repeatContent: utils_1.GetRepeatStr(value),
      });
    };
    this.onRepeatPress = () => {
      const { theme, repeatRouter } = this.props;
      if (!repeatRouter) {
        Popup.custom({
          title: i18n_1.default.getLang('repeat'),
          cancelText: i18n_1.default.getLang('cancel'),
          confirmText: i18n_1.default.getLang('confirm'),
          content: (
            <repeat_1.default selected={this.state.repeatSelected} onSelect={this.onRepeatSelect} />
          ),
          onConfirm: () => {
            this.onRepeatSelect(this.state.repeatSelected);
            Popup.close();
          },
        });
        return;
      }
      const TYNavigator = TYSdk.Navigator;
      TYNavigator.push({
        id: repeatRouter,
        hideTopbar: true,
        title: i18n_1.default.getLang('repeat'),
        theme,
        repeat: this.state.repeatSelected,
        onRepeatChange: repeat => {
          this.setState({
            repeatSelected: repeat,
            repeatContent: utils_1.GetRepeatStr(repeat),
          });
        },
      });
    };
    this.onTagPress = () => {
      Dialog.prompt({
        accessibilityLabel: 'Timer_TagInput',
        title: i18n_1.default.getLang('tag'),
        cancelText: i18n_1.default.getLang('cancel'),
        confirmText: i18n_1.default.getLang('confirm'),
        defaultValue: this.state.tag,
        autoFocus: true,
        onConfirm: text => {
          this.setState({ tag: text });
          Dialog.close();
        },
      });
    };
    this.chainCompare = (itemLoop, showItemArr) => {
      if (itemLoop) {
        if (typeof itemLoop === 'string' || typeof itemLoop === 'number') {
          showItemArr.push(this.state.dpData[itemLoop]);
          const childItemId = this.state.dpData[itemLoop].rangeValues[
            this.state.dpData[itemLoop].selected
          ].subItem;
          if (childItemId) {
            this.chainCompare(childItemId, showItemArr);
          }
          return showItemArr;
        }
        itemLoop.map(d => {
          showItemArr.push(this.state.dpData[d]);
          const childItemId = this.state.dpData[d].rangeValues[this.state.dpData[d].selected]
            .subItem;
          if (childItemId) {
            this.chainCompare(childItemId, showItemArr);
          }
        });
        return showItemArr;
      }
    };
    this.calShowItem = () => {
      const dpDataList = Object.values(this.state.dpData);
      const showItemArr = dpDataList.filter(dpData => {
        return !dpData.isSubItem;
      });
      showItemArr.map(dpData => {
        const itemId = dpData.rangeValues[dpData.selected].subItem;
        this.chainCompare(itemId, showItemArr);
      });
      showItemArr.sort((a, b) => {
        const sort = a.index - b.index;
        return sort;
      });
      this.showItemArr = showItemArr;
      return showItemArr;
    };
    this.showDatePicker = (type, time) => {
      const { loop, is12Hours } = this.props;
      const [hour, minute] = time.split(':').map(v => +v);
      const pickerDate = new Date();
      pickerDate.setHours(hour);
      pickerDate.setMinutes(minute);
      Popup.datePicker({
        isAmpmFirst: true,
        use12Hours: is12Hours,
        onConfirm: this.confirmTime,
        onDateChange: v => this.handleTime(v, type),
        loop,
        title: i18n_1.default.getLang(`${type}TimeTitle`),
        cancelText: i18n_1.default.getLang('cancel'),
        confirmText: i18n_1.default.getLang('confirm'),
        defaultDate: pickerDate,
        mode: 'time',
      });
    };
    this.renderHeader = () => {
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
              onPress: this.props.fetchType === 'cloud' ? this.save : this.putUpDP,
            },
          ]}
        />
      );
    };
    this.renderRepeatView = () => {
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
        <repeatCircle_1.default
          selected={this.state.repeatSelected}
          onSelect={this.onRepeatSelect}
        />
      );
    };
    this.renderTagView = () => {
      const { repeatRouter, repeatType = 'circle' } = this.props;
      return (
        <Row
          style={{ marginTop: repeatRouter || repeatType === 'popup' ? 0 : 22 }}
          accessibilityLabel="Timer_TagRow"
          title={i18n_1.default.getLang('tag')}
          bordered={this.props.isSupportNotice}
          content={this.state.tag}
          onPress={this.onTagPress}
        />
      );
    };
    this.renderNoticeView = () => {
      if (!this.props.isSupportNotice) {
        return null;
      }
      return (
        <style_1.StyledNoticeItem
          title={i18n_1.default.getLang('notice')}
          value={this.state.isAppPush}
          onValueChange={isAppPush => this.setState({ isAppPush })}
        />
      );
    };
    this.backCollectPage = () => {
      // 主要原理在于，找到栈中所有的页面，调用getCurrentRoutes方法找到对应的路由，再次执行popToRoute即可。
      const routes = this.props.navigator.state.routeStack;
      let destinationRoute = '';
      for (let i = routes.length - 1; i >= 0; i--) {
        if (routes[i].id === 'pointDetail') {
          destinationRoute = this.props.navigator.getCurrentRoutes()[i];
        }
      }
      this.props.navigator.popToRoute(destinationRoute);
    };
    // 渲染收藏点
    this.renderCollect = () => {
      const dpDataList = Object.values(this.state.dpData);
      // isCollect如果是收藏点页面,则点击失效
      if (Array.isArray(dpDataList) && dpDataList.length) {
        this.calShowItem();
      }
      return (
        <react_native_1.TouchableOpacity
          style={props.style}
          activeOpacity={1}
          onPress={this.backCollectPage}
        >
          <style_1.StyledCell>
            <style_1.StyledTitle numberOfLines={1} size={cx(17)}>
              {Strings.getLang('ipc_live_page_memory_point_time_goNow')}
            </style_1.StyledTitle>
          </style_1.StyledCell>
          {/* {!!props.bordered && <style_1.StyledDivider />} */}
        </react_native_1.TouchableOpacity>
      );
    };
    this.renderDpView = () => {
      let dpList;
      const dpDataList = Object.values(this.state.dpData);
      // isCollect如果是收藏点页面,则点击失效
      const { renderDpItem } = this.props;
      if (Array.isArray(dpDataList) && dpDataList.length) {
        const showItemArr = this.calShowItem();
        dpList = (
          <react_native_1.View style={{ marginTop: 16 }}>
            {showItemArr.map((item, index) => {
              const renderRow = originRowProps => (
                <Row
                  key={`Timer_DpRow_${index}`}
                  accessibilityLabel={`Timer_DpRow_${index}`}
                  bordered={index !== showItemArr.length - 1}
                  title={item.dpName}
                  content={item.rangeValues[item.selected].dpValue}
                  onPress={() => this.onDpPress(item)}
                  {...originRowProps}
                />
              );
              const DpItem =
                renderDpItem &&
                renderDpItem({
                  dataSource: showItemArr,
                  rowItem: item,
                  index,
                  renderRow,
                  dpStateData: this.state.dpData,
                  onDpConfirm: this.onDpConfirm,
                });
              if (typeof renderDpItem === 'function' && DpItem) {
                return DpItem;
              }
              return renderRow();
            })}
          </react_native_1.View>
        );
      } else {
        dpList = null;
      }
      return dpList;
    };
    this.renderDatePicker = () => {
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
    this.renderTimeZone = () => {
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
    const dpDic = {};
    props.dpDataList.map((dpData, index) => {
      dpData.index = index;
      dpDic[dpData.dpId] = dpData;
    });
    let time = '';
    if (props.isEdit) {
      Object.keys(dpDic).map(id => {
        if (props.fetchType === 'dp') {
          const dpTotalStr = props.timer.substring(
            props.timer.length - props.dpDataList.length * 2
          );
          const dpValueArr = dpTotalStr.match(/\w{2}/g);
          const index = dpDic[id].index;
          dpDic[id].selected =
            props.dpDataList[index].rangeKeys.indexOf(dpValueArr[index]) || dpDic[id].selected;
        } else {
          const selectedIndex = dpDic[id].rangeKeys.indexOf(props.timer.timers[0].dps[id]);
          dpDic[id].selected = selectedIndex < 0 ? dpDic[id].selected : selectedIndex;
        }
      });
      time = props.dataSource[props.index].timeStr;
    } else {
      const date = new Date();
      time = `${date.getHours()}:${date.getMinutes()}`;
      if (props.isTimeZone) {
        const endDate = new Date();
        endDate.setMinutes(date.getMinutes() + 30);
        const endTime = `${endDate.getHours()}:${endDate.getMinutes()}`;
        time = time.concat(`~${endTime}`);
      }
    }
    const repeatValue = props.isEdit
      ? props.dataSource[props.index].repeatStr || '0000000'
      : '0000000';
    const repeatContent = utils_1.GetRepeatStr(repeatValue);
    this.tempTime = time;
    const tag = get_1.default(props.dataSource, `[${props.index}].tagStr`, '');
    const isAppPush = get_1.default(props.dataSource, `[${props.index}].isAppPush`, false);
    this.state = {
      repeatSelected: repeatValue,
      dpData: dpDic,
      repeatContent,
      time,
      tag,
      isAppPush,
    };
  }
  get theme() {
    const theme = this.props.theme ? { timer: this.props.theme } : {};
    return theme;
  }
  render() {
    const scrollEnabled = this.state.scrollHeight >= this.state.contentHeight;
    // isCollect如果是收藏点页面,则点击失效
    const { isCollect } = this.props;
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
              {/* 如果是收藏点定时,将执行通知按钮取消 */}
              {!isCollect && this.renderNoticeView()}
              {isCollect ? this.renderCollect() : this.renderDpView()}
            </react_native_1.ScrollView>
          </style_1.StyledContainer>
        </style_1.StyledContainer>
      </ThemeProvider>
    );
  }
}
exports.default = AddTimer;
