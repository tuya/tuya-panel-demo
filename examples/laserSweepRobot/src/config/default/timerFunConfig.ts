import { TYSdk } from 'tuya-panel-kit';
import Strings from '@i18n';
import { getFuncField } from '../../utils';
import { DPCodes } from '..';
import store from '../../store';

const theme = {
  fontColor: '#333', // 主要字体色
  titleBg: '#fff', // 头部栏底色
  titleFontColor: '#333', // 头部栏字体颜色
  boardBg: '#f8f8f8', // 整体底色
  cellBg: '#fff', // 列表底色
  cellLine: 'rgba(51, 51, 51, 0.1)', // 列表分隔栏颜色
  subFontColor: 'rgba(51, 51, 51, 0.5)', // 副标题字体颜色
  btnBg: '#fff', // 添加定时按钮底色
  btnBorder: 'rgba(51, 51, 51, 0.2)', // 添加定时按钮边框色
  btnFontColor: 'rgba(51, 51, 51, 0.8)', // 添加定时按钮字体颜色
  repeatColor: '#44DB5E', // 重复的背景颜色
  thumbTintColor: '#fff', // 关闭情况下滑块背景色
  onThumbTintColor: '#fff', // 开启情况下滑块背景色
  onTintColor: '#4CD964', // 开启情况下背景色
  tintColor: '#e5e5e5', // 关闭情况下背景色
  ios_backgroundColor: '#f0f0f0',
  statusBgStyle: 'default', // 状态栏字体颜色
};

export default function getTimerFunConifg() {
  const { panelConfig } = store;
  const panelState = panelConfig.store;
  const timerConfig = getFuncField('TimerConfig', null);
  const data = [];
  if (timerConfig) {
    const timerConfigParse = JSON.parse(timerConfig) || [];
    const timerConfigMap = timerConfigParse.map(({ code, rangeKeys }) => {
      let range = rangeKeys;
      if (rangeKeys[0] === 'true' && rangeKeys[1] === 'false' && rangeKeys.length === 2) {
        range = [true, false];
      }
      if (rangeKeys[0] === 'false' && rangeKeys[1] === 'true' && rangeKeys.length === 2) {
        range = [false, true];
      }
      return {
        dpId: TYSdk.device.getDpIdByCode(code),
        dpName: Strings.getDpLang(code),
        selected: 0,
        rangeKeys: range,
        rangeValues: range.map(key => ({
          dpValue: Strings.getDpLang(code, key),
        })),
      };
    });
    data.push(...timerConfigMap);
  }

  const addCleanSwitch = (dps = {}) => {
    return {
      ...dps,
      [TYSdk.device.getDpIdByCode(DPCodes.cleanSwitch)]: true,
    };
  };

  return {
    navigator: TYSdk.Navigator,
    hideTopbar: true,
    is12Hours: !panelState.timeFormatConfig.scheduleTimeIs24,
    theme,
    timerConfig: {
      addTimerRouter: 'TimerAddTimerCustomTimer',
      repeatRouter: 'timerRepeat',
      category: 'category__switch',
      saveExtraHandler: addCleanSwitch,
      repeat: 0,
      limit: panelState.scheduleConfig.scheduleLocal.scheduleLocalMaxNum || 10,
      data,
    },
  };
}
