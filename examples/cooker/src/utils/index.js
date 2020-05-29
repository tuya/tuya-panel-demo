/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Utils, Modal } from 'tuya-panel-kit';
import { CountdownPickerView, MinCountdownView, PluralPickerView } from '../components/recipe';
import _ from 'lodash';
import Strings from '../i18n';
import { decode } from './base-64';
import TYSdk from '../api';
import Config from '../config';
// import CountdownPickerView from '../components/time-picker';
// import MinCountdownView from '../components/low-time-picker';
// import PluralPickerView from '../components/temp-picker';

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
/**
 *
 * @param {Array} arr
 * @return {Object}
 *
 * @example
 * const arr = [{ speed: '1' }, { lock: true }];
 * arrayToObject(arr);
 * // { speed: '1', lock: true }
 */
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
  'cookTemperature',
  'cook_temperature',
  'pause',
  'temperature',
  'c_f',
  'auto_clean',
  'manual_clean',
  'gear',
  'cook_gear',
  'cook_mode',
  'stop',
  'temp_unit_convert',
];

export const weekDeepClone = obj => JSON.parse(JSON.stringify(obj));

export const isEmptyObj = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

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
    Modal.picker({
      title: titleRender || Strings.getDpLang(code),
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
    onValueChange: value => {
      const val = Math.floor(value * 10 ** scale);
      const temp = unit === '℃' || !cfCode ? val : toC(val, scale);
      TYSdk.device.putDeviceData({ [code]: temp });
      Modal.close();
    },
  };

  scale === 0 && Modal.picker(data);
  scale > 0 && Modal.render(<PluralPickerView {...pluralData} />);
};

export const formatDpValueName = (code = '', value = '') => {
  const { type, unit, scale } = Config.getDpSchema(code);
  const valStr =
    type === 'value'
      ? `${Utils.NumberUtils.scaleNumber(scale, value)}${unit}`
      : getCodeName(code, value);
  return valStr;
};

export function getCodeName(code, value) {
  return typeof value !== 'undefined' ? Strings.getDpLang(code, value) : Strings.getDpLang(code);
}

export function errorTip(text) {
  TYSdk.simpleTipDialog(text, () => {});
}

export function jumpToSense({ navigator, ...args }) {
  const nav = navigator || TYSdk.Navigator;
  nav.push({ ...args });
}

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
      .map((r, _idx) => {
        const { data, externalId, id } = r;
        const recipeData = formatRecipe(JSON.parse(handleJson(data)));
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
        } else {
          result[map[k]] = decode(item.value);
        }
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
      title: Strings.getLang('stepsDesc'),
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

export function formatPublicRecipeContent(content, type) {
  switch (content) {
    case 'description':
      break;

    default:
      break;
  }
}
