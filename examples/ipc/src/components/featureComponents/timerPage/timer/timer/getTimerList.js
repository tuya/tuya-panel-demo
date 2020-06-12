/* eslint-disable no-shadow */
/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable one-var */
/* eslint-disable indent */
/* eslint-disable react/prop-types */
/* eslint-disable no-return-assign */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
import { TYSdk } from 'tuya-panel-kit';

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

const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;
Object.defineProperty(exports, '__esModule', { value: true });
const sortBy_1 = __importDefault(require('lodash/sortBy'));
const React = __importStar(require('react'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const api_1 = require('../api');
const i18n_1 = __importDefault(require('../i18n'));
const utils_1 = require('../utils');

const { parseJSON } = tuya_panel_kit_1.Utils.JsonUtils;
const { stringToSecond, parseTimer } = tuya_panel_kit_1.Utils.TimeUtils;
const TimerHoc = WrappedComponent => {
  let _a;
  return (
    (_a = class WrapperComponent extends React.Component {
      constructor(props) {
        super(props);
        this.category = 'rnTimer';
        this.getTimerList = async () => {
          TYNative.showLoading({ title: '' });
          const handleError = response => {
            const err = parseJSON(response);
            TYNative.hideLoading();
            TYNative.simpleTipDialog(err.message || err.errorMsg, () => {});
          };
          let timerList = [];
          let isSupportNotice = false;
          try {
            const timers = await api_1.getCategoryTimerList(this.category);
            timerList = [...(timers.groups || [])];
            isSupportNotice = await api_1.checkIsSupportNotice();
          } catch (error) {
            handleError(error);
          }
          TYNative.hideLoading();
          TYEvent.emit('linkageTimeUpdate', {});
          if (!timerList.length) {
            this.setState({ isSupportNotice });
            return;
          }
          const dataSource = this.formatCloudData(timerList);
          // todo mainSwitch
          this.setState({
            dataSource,
            isSupportNotice,
            mainSwitchValue: true,
          });
        };
        this.formatCloudData = timerList => {
          const { is12Hours } = this.props;
          const { repeat, isTimeZone, dpStrFormatter } = this.props.timerConfig;
          const formattedData = timerList.map(item => {
            const { id } = item;
            // timeZone: timers has two timer which means start and end, every timer loop and dps is the same
            const timer = item.timers[0];
            let timeStr; // 时间具体值，用于编辑的操作
            let formatTimeStr; // 时间具体显示的值
            if (isTimeZone) {
              const timers = sortBy_1.default(item.timers, 'timerId');
              timeStr = timers.map(d => d.time).join('~');
              formatTimeStr = timers
                .map((d, idx) => {
                  const second = stringToSecond(d.time) * 60;
                  let str = is12Hours ? utils_1.parseHour12(second) : parseTimer(second);
                  if (idx === 1) {
                    const start = stringToSecond(timers[0].time) * 60;
                    const end = second;
                    if (start > end) {
                      str = `${i18n_1.default.getLang('tomorrow')} ${str}`;
                    }
                  }
                  return str;
                })
                .join(' ~ ');
            } else {
              timeStr = timer.time;
              const second = stringToSecond(timer.time) * 60;
              formatTimeStr = is12Hours ? utils_1.parseHour12(second) : parseTimer(second);
            }
            const tagStr = timer.aliasName;
            let repeatStr = '';
            if (repeat === 0) {
              repeatStr = timer.loops.toString();
            }
            const mapArray = Object.keys(this.dpIds).sort(
              (a, b) => this.dpIds[a].index - this.dpIds[b].index
            );
            const dpStrArr = mapArray
              .map(id => {
                const dpData = this.dpIds[id];
                const value =
                  typeof timer.dps[id] !== 'undefined'
                    ? timer.dps[id]
                    : dpData.rangeValues[0].dpValue;
                if (typeof dpStrFormatter === 'function') {
                  return dpStrFormatter(value, dpData);
                }
                return typeof timer.dps[id] !== 'undefined'
                  ? `${dpData.dpName}: ${
                      dpData.rangeValues[dpData.rangeKeys.indexOf(value)].dpValue
                    }`
                  : '';
              })
              .filter(v => !!v);
            return {
              id,
              timeStr,
              formatTimeStr,
              tagStr,
              repeatStr,
              dpStrArr,
              rowOpen: false,
              switchValue: !!timer.status,
              originalData: item,
              isAppPush: !!timer.isAppPush,
            };
          });
          return formattedData;
        };
        this.getDpTimerList = () => {
          const { limit, isMainSwitch, isTimeZone, dpId, data, repeat } = this.props.timerConfig;
          // 要改的
          let dpValue = TYNative.getState(dpId);
          this.dpData = dpValue;
          if (!dpValue || typeof dpValue === 'object') {
            if (!limit) return;
            const mainSwitchValue = isMainSwitch ? '01' : '';
            const switchValue = isMainSwitch ? '' : '01';
            const time = isTimeZone ? '00000000' : '0000';
            const repeatValue = repeat === 0 ? '00' : '';
            const dp = data
              .map(item => {
                return `${item.rangeKeys[item.selected].toString()}`;
              })
              .join('');
            const totalDp = `${switchValue}${time}${repeatValue}${dp}`.repeat(limit);
            dpValue = `${mainSwitchValue}${totalDp}`;
          }
          const { dataSource, mainSwitchValue } = this.formatDpData(dpValue);
          this.setState({
            dataSource,
            mainSwitchValue,
          });
        };
        this.transformDpData = dpValue => {
          const { isMainSwitch, limit, isTimeZone, repeat, data } = this.props.timerConfig;
          let everyLength = 0;
          if (isMainSwitch) {
            dpValue = dpValue.toString().substring(2, dpValue.toString().length);
          } else {
            everyLength += 2;
          }
          if (limit) {
            everyLength = dpValue.toString().length / limit;
          } else {
            // time
            everyLength += isTimeZone ? 8 : 4;
            // repeat
            everyLength += repeat === 0 ? 2 : 0;
            // dp
            const dpLength = data.length;
            everyLength += dpLength * 2;
          }
          const reg = new RegExp(`\\w{${everyLength}}`, 'g');
          const dpValueArr = dpValue.toString().match(reg);
          return dpValueArr;
        };
        this.formatDpData = dpValue => {
          const { isMainSwitch, isTimeZone, repeat } = this.props.timerConfig;
          let mainSwitchValue = true;
          const valueArr = this.transformDpData(dpValue);
          const formattedData = valueArr.map((item, mIndex) => {
            let repeatStr = '';
            let timeStr = '';
            let switchValue = true;
            let beginIndex = 0;
            if (isMainSwitch) {
              mainSwitchValue = dpValue.toString().substring(0, 2) === '01';
            } else {
              beginIndex = 2;
              switchValue = item.substring(0, 2) === '01';
            }
            if (isTimeZone) {
              const timerDpStr = item.substring(beginIndex, beginIndex + 8);
              timeStr = `${this.getTimeStr(timerDpStr.substring(0, 4))}~${this.getTimeStr(
                timerDpStr.substring(4, 8)
              )}`;
              beginIndex += 8;
            } else {
              const timerDpStr = item.substring(beginIndex, beginIndex + 4);
              timeStr = this.getTimeStr(timerDpStr);
              beginIndex += 4;
            }
            if (repeat === 0) {
              const repeatLoop = utils_1.TransformRepeat(
                item.substring(beginIndex, beginIndex + 2)
              );
              repeatStr = repeatLoop;
              beginIndex += 2;
            }
            const dpValueArr = item.substring(beginIndex).match(/\w{2}/g);
            const dpStrArr = dpValueArr.map((item, index) => {
              const dpData = this.props.timerConfig.data[index];
              return `${dpData.dpName}: ${
                dpData.rangeValues[dpData.rangeKeys.indexOf(item)].dpValue
              }`;
            });
            return {
              id: `dpTimer_${mIndex}}`,
              dpStrArr,
              repeatStr,
              timeStr,
              switchValue,
              rowOpen: false,
              originalData: item,
            };
          });
          return {
            dataSource: formattedData,
            mainSwitchValue,
          };
        };
        this.getTimeStr = time => {
          return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
        };
        this.category = props.timerConfig.category;
        this.dpIds = {};
        props.timerConfig.data.length &&
          props.timerConfig.data.map((dpData, index) => {
            dpData.index = index;
            this.dpIds[`${dpData.dpId}`] = dpData;
          });
        this.state = {
          dataSource: [],
          isSupportNotice: false,
          mainSwitchValue: true,
        };
        if (props.timerConfig.fetchType === 'dp') {
          const code = TYDevice.getDpCodeById(this.props.timerConfig.dpId);
          TYEvent.on('deviceDataChange', data => {
            const changedp = data.payload;
            if (this.dpData === changedp[code]) return;
            this.getDpTimerList();
          });
        }
      }
      componentDidMount() {
        const { fetchType = 'cloud' } = this.props.timerConfig;
        if (fetchType === 'cloud') {
          this.getTimerList();
        } else {
          this.getDpTimerList();
        }
        // react_native_1.InteractionManager.runAfterInteractions(() => {
        //   console.log('sdsdsd');
        //   // ...耗时较长的同步执行的任务...
        //   if (fetchType === 'cloud') {
        //     this.getTimerList();
        //   } else {
        //     this.getDpTimerList();
        //   }
        // });
      }
      render() {
        const { fetchType = 'cloud' } = this.props.timerConfig;
        return (
          <WrappedComponent
            {...this.props}
            mainSwitchValue={this.state.mainSwitchValue}
            dataSource={this.state.dataSource}
            isSupportNotice={this.state.isSupportNotice}
            fetchData={fetchType === 'cloud' ? this.getTimerList : this.getDpTimerList}
            dpIds={this.dpIds}
          />
        );
      }
    }),
    (_a.defaultProps = {
      is12Hours: false,
      timerConfig: {
        data: [],
        repeat: 0,
        category: 'rnTimer',
        addTimerRouter: 'addTimer',
        repeatType: 'row',
        repeatRouter: undefined,
        isTimeZone: false,
        limit: 30,
        isMainSwitch: false,
        fetchType: 'cloud',
      },
    }),
    _a
  );
};
exports.default = TimerHoc;
