/* eslint-disable prefer-destructuring */
/* eslint-disable no-bitwise */
/* eslint-disable no-shadow */
/* eslint-disable no-restricted-properties */
/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import _ from 'lodash';
import { Utils, Modal, Popup } from 'tuya-panel-kit';
import { decode } from './base-64';
import TYSdk from '../api';
import Strings from '../i18n';
import { makePy } from './mapPy';
import CountdownPickerView from '../mode-setting-view/time-picker';
import MinCountdownView from '../mode-setting-view/low-time-picker';
import PluralPickerView from '../mode-setting-view/temp-picker';
import Config from '../../../config';

const { scaleNumber } = Utils.NumberUtils;
const unitMin = ['分钟', 'min'];
const unitSec = ['秒', 's'];
export const timeType = {
  hm: 'hm',
  min: 'min',
  sec: 'sec',
};

export const toC = (v, scale = 0) => +Math.floor((v - 32 * 10 ** scale) / 1.8).toFixed(scale);

export const toF = (v, scale = 0) => Math.floor((v * 9) / 5) + 32 * 10 ** scale;

export const arrayToObject = arr => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign(...arr);
};

// 基础dp
export const defaultCodes = [
  'power',
  'switch',
  'start',
  'mode',
  'temp_current',
  'cook_gear',
  'cloud_recipe_number',
  'pressure',
  'status',
  'appointment_time',
  'cook_time',
  'remain_time',
  'multistep',
  'fault',
  'cook_temperature',
  'temperature',
  'c_f',
  'auto_clean',
  'manual_clean',
  'gear',
  'cook_mode',
];

// json格式化
export function handleJson(json) {
  try {
    if (json) {
      return json
        .replace(/\r\n/g, '\\r\\n')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
    }
    return json;
  } catch (error) {
    return json;
  }
}

/**
 * @description 菜谱列表数据格式化
 * @author risatoar.xu
 * @param {Array} datas //菜谱原始数据
 * @returns
 */
export const parseCookBookListDatas = datas => {
  if ('contentList' in datas) {
    const { contentList } = datas;
    const recipes = contentList
      .map(r => {
        const { data, externalId, id } = r;
        const recipeData = formatRecipe(JSON.parse(handleJson(data)));
        // return recipeData;
        return {
          ...recipeData,
          contentId: externalId,
          id,
        };
      })
      .filter(d => {
        const { supdev } = d;
        const pid = Config.devInfo.productId;
        if (supdev) return supdev.includes(pid);
        return true;
      });
    return recipes;
  }
};

/**
 * @description 菜谱数据格式化
 * @author risatoar.xu
 * @param {Object} data //菜谱原始数据
 * @returns
 */
export function formatRecipe(data) {
  const result = {};
  const keys = [
    'name',
    'picture',
    'isDiy',
    'ingredients',
    'stepsdsc',
    'introduction',
    'isStart',
    'categoryName',
    'supdevctrl',
    'twsteps',
  ];

  const base64keys = ['name', 'ingredients', 'steps', 'stepsdsc', 'introduction', 'twsteps'];
  const map = {
    name: 'name',
    picture: 'image',
    pinyin: 'pinyin',
    isDiy: 'diy',
    isStart: 'isStart',
    supdevctrl: 'supdevctrl',
    ingredients: 'ingredients',
    stepsdsc: 'stepsdsc',
    introduction: 'introduction',
    directions: 'directions',
    categoryName: 'categoryName',
    twsteps: 'twsteps',
  };
  const dpObj = {};
  data.forEach(item => {
    const k = item.key;
    if (keys.indexOf(k) !== -1) {
      if (base64keys.indexOf(k) !== -1) {
        if (map[k] in result) {
          // result[map[k]] = decode(item.value);
        } else result[map[k]] = decode(item.value);
      } else {
        result[map[k]] = item.value;
      }
    } else {
      result[k] = item.value;
    }
    if (item.dp) {
      dpObj[[item.dp]] = item.value;
    }
    // 获取索引字母
    if ('pinyin' in item && typeof item.pinyin === 'string') {
      result[map.pinyin] = item.pinyin.toUpperCase().charAt(0);
    }
  });
  result.dpObj = dpObj;
  // if('contentId_dp_value' in item) result.bookId = item.contentId_dp_value;
  return result;
}

/**
 * @description 公版菜谱数据格式化
 * @author risatoar.xu
 * @param {Object} data //菜谱原始数据
 * @returns
 */
export function formatPublicRecipe(data) {
  const base64keys = ['detail', 'knowledge', 'playUrl', 'tags_info', 'xyxk'];
  const obj = Object.keys(data).reduce((pre, cur) => {
    if (base64keys.includes(cur)) {
      return Object.assign({}, pre, {
        [cur]: decode(data[cur]),
      });
    }
    return Object.assign({}, pre, {
      [cur]: data[cur],
    });
  }, {});
  return obj;
}

export const normalSchema = [
  {
    title: '',
  },
];

/**
 * @description 菜谱数据格式化（步骤、详情、菜谱等）
 * @author risatoar.xu
 * @param {Object} recipeData //菜谱原始数据
 * @param {Boolean} isPublic //是否是公版菜谱
 * @returns
 */
export function formatRecipeData(recipeData, isPublic) {
  const { data } = recipeData;
  const { introduction, ingredients, stepsdsc, content, knowledge, xyxk, detail, twsteps } = data;
  const normalSchema = [
    {
      title: Strings.getLang('description'),
      data: introduction,
    },
    {
      title: Strings.getLang('ingredients'),
      data: ingredients,
    },
    {
      title: Strings.getLang('stepsdsc'),
      data: stepsdsc,
    },
    {
      title: Strings.getLang('twsteps'),
      data: twsteps,
    },
  ];
  if (stepsdsc && twsteps) {
    normalSchema.splice(
      normalSchema.findIndex(({ title }) => title === Strings.getLang('stepsDesc')),
      1
    );
  }
  const publicSchema = [
    {
      title: Strings.getLang('description'),
      data: content,
    },
    {
      title: Strings.getLang('ingredients'),
      data: ingredients,
    },
    {
      title: Strings.getLang('stepsDesc'),
      data: detail,
    },
    {
      title: Strings.getLang('knowledge'),
      data: knowledge,
    },
    {
      title: Strings.getLang('xyxk'),
      data: xyxk,
    },
  ];
  const checkedStack = isPublic ? publicSchema : normalSchema;
  const dataSource = checkedStack
    .filter(({ data: sData }) => sData)
    .map(({ data: source, title }, i) => ({
      title,
      data: [isJson(source) ? JSON.parse(source) : source],
    }));
  const tabs = dataSource.map(({ title }) => title);
  return {
    dataSource,
    tabs,
  };
}

/**
 * @description 判断是否json
 * @author risatoar.xu
 * @export
 * @param {*} str
 * @returns
 */
export function isJson(str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true;
    }
  } catch (e) {}
  return false;
}

/**
 * @description 获取dp点值的原始类型
 * @author risatoar.xu
 * @export
 * @param {*} value 值
 * @param {*} type dp类型
 * @returns
 */
export function getDpValueByType(value, type) {
  const stringTypes = ['enum', 'string', 'raw'];
  if (type === 'bool') {
    if (_.isBoolean(value)) return value;
    // eslint-disable-next-line no-eval
    return eval(value.toLowerCase());
  } else if (type === 'value') {
    if (_.isNumber(value)) return value;
    return Number(value);
  } else if (stringTypes.includes(type)) {
    if (typeof value === 'string') return value;
    return `${value}`;
  }
}

export function checkDpData(data = []) {
  const putData = data.reduce((pre, cur) => {
    const { key, value } = cur;
    const dpSchema = Config.getDpSchema(key);
    const { type } = dpSchema;
    const dpValue = getDpValueByType(value, type);
    const res = Object.assign({}, pre, {
      [key]: dpValue,
    });
    return res;
  }, {});
  return putData;
}

/**
 * @description 统一清除变量名带timerId的定时器
 * @author risatoar.xu
 * @export
 * @param {*} context // 上下文
 * @returns
 */
export function clearAllTimer(context) {
  if (typeof context !== 'object') return;
  const timerKeys = Object.keys(context).filter(key => key.match(/_timerId[0-9]/));
  if (timerKeys.length === 0) return;
  _.forEach(timerKeys, tk => {
    // eslint-disable-next-line no-prototype-builtins
    if (tk.hasOwnProperty('name') && tk) {
      const { name } = tk;
      name === 'setTimeout' && clearTimeout(tk);
      name === 'setInterval' && clearInterval(tk);
    }
  });
}

export function errorTip(text) {
  TYSdk.simpleTipDialog(text, () => {});
}

export function jumpToSense({ navigator, ...args }, method = 'push') {
  const nav = navigator || TYSdk.Navigator;
  nav[method]({ ...args });
}
/**
 * @description
 * @author risatoar.xu
 * @export
 * @param {*} {
 *   modeCode = '',
 *   Res = {},
 *   Config = {},
 * }
 * @returns
 */
export function formatModeNavPropsData({ modeCode = '', Res = {}, Config = {} }) {
  const { range } = Config.getDpSchema(modeCode);
  const res = range.map(d => {
    let image = Config.getUiValue(modeCode, d);
    const keys = Object.keys(Res);
    const isDefault = keys.includes(d);
    image = image || (isDefault ? Res[d] : Res.default);
    if (typeof image === 'string') {
      image = { uri: image };
    }
    return {
      key: d,
      title: Strings.getDpLang(modeCode, d),
      image,
      contentId: '',
    };
  });
  return res;
}

/**
 * @description 格式化拼音数据
 * @author risatoar.xu
 * @export
 * @param {*} datas
 * @returns
 */
export function formatRecipeList(datas) {
  const lists = {};
  _.forEach(datas, ({ pinyin, ...data }) => {
    if (pinyin in lists) {
      lists[pinyin].data = [...lists[pinyin].data, { ...data }];
    } else if (!pinyin) {
      if ('#' in lists) {
        lists['#'].data = [...lists['#'].data, { ...data }];
      } else {
        lists['#'] = {
          title: '#',
          data: [{ ...data }],
        };
      }
    } else {
      lists[pinyin] = {
        title: pinyin,
        data: [{ ...data }],
      };
    }
  });
  return _.orderBy(Object.values(lists), ({ title }) => title.match(/[a-zA-Z]/));
}

export const mapPy = str => {
  const string = `${str}`.trim();
  const word = string[0];
  if (word.match(/[a-zA-Z]/)) {
    return word;
  } else if (word.match(/[\u4e00-\u9fa5]/)) {
    return _.head(makePy(word));
  }
  return '#';
};

export const formatRecipeDetail = (lists = [], content = []) =>
  parseCookBookListDatas(lists).map(book => {
    let ids = '';
    let itemIndex = 0;
    let recipeTitle = '';
    content.forEach((element, index) => {
      if (element.externalId === book.contentId) {
        ids = element.externalId;
        itemIndex = index;
        recipeTitle = element.contentName;
      }
    });
    if (book.name) recipeTitle = book.name;
    const { pinyin } = book;
    const py = !pinyin ? mapPy(recipeTitle) : pinyin;
    return Object.assign({}, book, {
      id: ids,
      index: itemIndex,
      recipeTitle,
      pinyin: py,
      ownId: book.id,
    });
  });

export const getCountDownValue = ({ code, value }) => {
  let v = value || 0;
  const type = getCountDownType(code);
  v = type === timeType.sec ? v : v * 60;
  const [h, m, s] = Utils.TimeUtils.parseSecond(v);
  switch (type) {
    case 'sec':
      return Strings.formatString(Strings.getLang('countdownMode_sec'), h, m, s);
    default:
      return Strings.formatString(Strings.getLang('countdownMode_hm'), h, m);
  }
};

export const onPressTimeSet = (code, value, onPress, titleRender) => {
  let min = 0;
  let max = 360;
  let step = 1;
  if (code) {
    min = Config.getDpSchema(code).min;
    max = Config.getDpSchema(code).max;
    step = Config.getDpSchema(code).step;
  }
  const type = getCountDownType(code);
  if (type === 'sec') {
    const data = {
      name: Strings.getDpLang(code),
      value,
      min,
      max,
      step,
      titleRender,
      onValueChange: v => {
        onPress && onPress(~~(v < min ? min : v));
        !onPress &&
          TYSdk.device.putDeviceData({
            [code]: ~~(v < min ? min : v),
          });
        Modal.close();
      },
      onCancel: () => Modal.close(),
    };
    Modal.render(<MinCountdownView {...data} />);
  } else if (type === 'min') {
    const { max, min, step, scale, unit } = Config.getDpSchema(code);
    const values = Utils.NumberUtils.range(min, step === 1 ? max + step : max, step);
    Popup.picker({
      name: titleRender || Strings.getDpLang(code),
      label: `${unit}`,
      values: values.map(d => ({
        value: Number(scaleNumber(scale, d)),
        label: scaleNumber(scale, d),
      })),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      value,
      onValueChange: v => {
        if (v >= min && v <= max) {
          onPress && onPress(Number(v) * Math.pow(10, scale));
          !onPress &&
            TYSdk.device.putDeviceData({
              [code]: Number(v) * Math.pow(10, scale),
            });
        } else {
          TYSdk.simpleTipDialog(Strings.getLang('publishErrorTip'), () => {});
        }
      },
    });
  } else {
    const data = {
      name: Strings.getDpLang(code),
      value,
      max,
      step,
      titleRender,
      onValueChange: v => {
        onPress && onPress(v < min ? min : v);
        !onPress &&
          TYSdk.device.putDeviceData({
            [code]: v < min ? min : v,
          });
        Modal.close();
      },
      onCancel: () => Modal.close(),
    };
    Modal.render(<CountdownPickerView {...data} />);
  }
};

export function getRangeByMinAndMax(min, max, step) {
  const res = [];
  for (let i = +min; i <= +max; i += step) {
    res.push(i);
  }
  return res;
}

export const onPressTempSet = ({ code, v, propsUnit = '℃', cfCode, range }) => {
  const unit = propsUnit;
  const { scale, step, max, min } = Config.getDpSchema(code);
  const maxProp = unit === '℃' ? max : toF(max, scale);
  const minProp = unit === '℃' ? min : toF(min, scale);
  const data = {
    title: Strings.getDpLang(code),
    value: propsUnit === '℃' ? v : toF(v, scale),
    label: cfCode ? propsUnit : unit,
    dataSource: range.map((item, index) => ({
      value: range[index],
      label: `${item}`,
    })),
    onConfirm: value => {
      const val = Math.floor(value * 10 ** scale);
      const temp = unit === '℃' || !cfCode ? val : toC(val, scale);
      TYSdk.device.putDeviceData({ [code]: temp });
      Modal.close();
    },
  };

  const pluralData = {
    name: Strings.getDpLang(code),
    min: minProp,
    max: maxProp,
    scale,
    value: unit === '℃' ? v : toF(v, scale),
    step,
    onCancel: () => {
      Modal.close();
    },
    cancelText: Strings.getLang('cancel'),
    confirmText: Strings.getLang('confirm'),
    onValueChange: value => {
      const val = Math.floor(value * 10 ** scale);
      const temp = unit === '℃' || !cfCode ? val : toC(val, scale);
      TYSdk.device.putDeviceData({ [code]: temp });
      Modal.close();
    },
  };

  scale === 0 && Popup.picker(data);
  scale > 0 && Modal.render(<PluralPickerView {...pluralData} />);
};

export const getCountDownType = code => {
  let type = timeType.hm;
  if (code) {
    const { unit, max } = Config.getDpSchema(code);
    if (unitMin.includes(unit)) {
      if (max <= 60) {
        type = timeType.min;
      }
    }
    if (unitSec.includes(unit)) type = timeType.sec;
  }
  return type;
};

// 处理按下开始后的逻辑

// isdevCtrl 是否支持自定义控制
// displayDevCtrl 是否显示设备控制
// supCookingStep 是否支持烹饪步骤
// cookingStepMode === 1 高级模式 1简单模式

export const handleStartButtonPress = ({
  recipeData,
  navigator,
  executeAfterCommonStart,
  handleUnDevCtrl,
}) => {
  const {
    start: startCode,
    multistep: multistepCode,
    cloudRecipeNumber: recipeCode,
  } = Config.codes;
  const { multisteps, multistepstext, multistepslist, hmsteps = {}, image } = _.get(
    recipeData,
    'data',
    {}
  );
  const recipeId = _.get(recipeData, 'id', {});
  // const displayDevCtrl = _.get(hmsteps, 'devCtrl.displayDevCtrl', undefined);
  const devCtrl = _.get(hmsteps, 'devCtrl', {});
  // const hideOption = typeof displayDevCtrl !== 'undefined' && !displayDevCtrl;
  const { cookingStepMode, isdevctrl, supCookingStep } = devCtrl;
  // 多步骤
  if (multisteps && isdevctrl) {
    // 高级模式数据
    const superStepDatas = _.get(hmsteps, 'cooking');
    // 高级模式执行
    if (supCookingStep && cookingStepMode === 1) {
      executeSuperStepMode({ navigator, superStepDatas, recipeId, image });
    } else {
      multistepCode && executeCommonMode({ multistepstext, recipeId, executeAfterCommonStart });
      !multistepCode && errorTip(Strings.getLang('cook_mode_multi_step_code_lose_error_tip'));
    }
  } else {
    const { schema } = Config;
    if (!isdevctrl) {
      handleUnDevCtrl(recipeId);
      return;
    }
    const isAllEqual = multistepslist.map(d => d.key).every(k => Object.keys(schema).includes(k));
    const isIncomplete = multistepslist.every(({ key } = {}) => !key);
    if (isAllEqual || multistepslist.length === 0 || isIncomplete) {
      const putData = checkDpData(multistepslist);
      // if (hideOption) {
      putData[startCode] = true;
      putData[recipeCode] = recipeId;
      // }
      TYSdk.device.putDeviceData(putData).finally(() => {
        sendUpdateRecipeMsg();
        executeAfterCommonStart();
      });
    } else {
      errorTip(Strings.getLang('cook_mode_error_tip'));
    }
  }
};

export const sendUpdateRecipeMsg = () => {
  TYSdk.event.emit('updateRecipeStatus');
};

export const executeCommonMode = ({ multistepstext, recipeId, executeAfterCommonStart }) => {
  const {
    start: startCode,
    multistep: multistepCode,
    cloudRecipeNumber: recipeCode,
  } = Config.codes;
  TYSdk.device
    .putDeviceData({
      [multistepCode]: `${multistepstext}`,
      [recipeCode]: recipeId,
      [startCode]: true,
    })
    .finally(() => {
      sendUpdateRecipeMsg();
      executeAfterCommonStart && executeAfterCommonStart();
    });
};

export const executeSuperStepMode = ({ navigator, superStepDatas, recipeId }) => {
  const {
    start: startCode,
    multistep: multistepCode,
    cloudRecipeNumber: recipeCode,
  } = Config.codes;
  TYSdk.device
    .putDeviceData({
      [recipeCode]: recipeId,
      [multistepCode]: parseSteps(superStepDatas),
      [startCode]: true,
    })
    .finally(() => {
      sendUpdateRecipeMsg();
      jumpToSense(
        {
          navigator,
          id: 'main',
          // multiSteps: superStepDatas,
          // image,
        },
        'resetTo'
      );
    });
};

export const parseStatusToMutiSteps = (status, multiSteps) => {
  try {
    const flatStatus = Object.entries(status).map(st => st[1]);
    const cloneSteps = _.cloneDeep(multiSteps);
    cloneSteps.forEach(({ items }, _idx) => {
      items.forEach(it => {
        it.value = `${flatStatus[_idx][it.key]}`;
      });
    });
    return cloneSteps;
  } catch (error) {
    return multiSteps;
  }
};

export const parseHexString = (value, pad = 2, hex = 10, trans = 16) =>
  _.padStart(parseInt(value, hex).toString(trans), pad, '0');

export const parseOrderAdd = multisteps =>
  (_.padStart(parseInt(multisteps.slice(0, 2), 10) + 1).toString(), 2, '0') + multisteps.slice(2);

export const parseOrderMinus = multisteps =>
  (_.padStart(parseInt(multisteps.slice(0, 2), 10) - 1).toString(), 2, '0') + multisteps.slice(2);

export const parseOrder = multisteps => parseInt(multisteps.slice(0, 2), 10) + 1;

export const parseStepDesc = (source, index) => {
  try {
    const descObj = _.pickBy(
      _.get(source, `${index}`, {}),
      (__, key) => key.indexOf('steps') !== -1
    );
    const { language } = Strings;
    const lang = language === 'zh' ? 'zh-cn' : language;
    const [, desc] = Object.entries(descObj).find(
      ([title = ''] = []) => title.toLowerCase().indexOf(lang) !== -1
    );
    return desc;
  } catch (error) {
    return '';
  }
};

export const parseStepItem = (source, index) => {
  try {
    const item = _.get(source, `${index}.items`, {});
    return item;
  } catch (error) {
    return [];
  }
};

export const parseExtraCookModeCode = (codes = []) => {
  const dpCodes = Object.keys(Config.schema);
  const diffCodes = dpCodes.filter(code => !defaultCodes.includes(code) && !codes.includes(code));
  const cookModeCodes = diffCodes.filter(code => {
    const { type } = Config.getDpSchema(code);
    return code.match(/cook_mode_/) && type === 'value';
  });
  return cookModeCodes.map(st => `${toHex(TYSdk.device.getDpIdByCode(st), 2)}0000`).join('');
};

export const toHex = (value, n = 4) => _.padStart(Number(value).toString(16), n, '0');

export const parseSteps = (multiStepsText = []) => {
  const fullParamKeys = multiStepsText.reduce((pre, { items }) => {
    const res = [...pre];
    const codes = items.map(({ key }) => key);
    codes.forEach(e => {
      !res.includes(e) && res.push(e);
    });
    return res;
  }, []);
  return multiStepsText.reduce((pre = '', { finishedItem, items } = {}, index) => {
    const waitOrgo = finishedItem === '0' ? '00' : '01';
    const codes = items.map(({ key }) => key);
    const extraStepParseData = parseExtraCookModeCode(codes);
    const steps = fullParamKeys.map(key => {
      const _idx = items.findIndex(({ key: k }) => key === k);
      const dpId = toHex(TYSdk.device.getDpIdByCode(key), 2);
      const dpValue = _idx !== -1 ? toHex(items[_idx].value) : '0000';
      return `${dpId}${dpValue}`;
    });

    const _idx = _.padStart(`${index}`, 2, '0');
    return `${pre}${_idx}${steps.join('')}${extraStepParseData}${waitOrgo}`;
  }, '00');
};
