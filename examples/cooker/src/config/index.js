/* eslint-disable max-len */
import _ from 'lodash';
import constant from './constant';
import dpCodes from './dpCodes';
import assist from './assist';
import { defaultCodes } from '../utils';

export class ConfigFactory {
  constructor() {
    this.assist = assist;
    this.constant = constant;
    this.dataBase = {};
    this.codes = dpCodes;
    this.themeColor = '#3DCD58';
    this.background = null;
    this.cloudFun = {
      cloudFunData: [],
    };
    this.router = {};
    this.dpFun = {
      settingDps: [],
      settingExtraDps: [],
    };
    this.devInfo = {};
    this.themeData = {
      fontColor: '#333',
      themeColor: 'red',
      toastColor: 'red',
      powerColor: 'red',
    };
    this.schema = {};
  }

  parseSchema = schema => {
    if (typeof schema === 'string') {
      return JSON.parse(schema);
    } else if (typeof schema === 'object') {
      return Object.entries(schema).reduce((prev, [__, val]) => [...prev, val], []);
    }
    return [];
  };

  buildConfig = (s = '') => {
    let schema = this.parseSchema(s);
    schema = schema.reduce(
      (pre, { code, property = {}, ...rest }) => ({
        ...pre,
        [code]: { ...rest, ...(typeof property === 'string' ? JSON.parse(property) : property) },
      }),
      {}
    );
    this.schema = schema;
    this.codes = Object.keys(schema).reduce(
      (pre, cur) => ({
        ...pre,
        [_.camelCase(cur)]: cur,
      }),
      {}
    );
    const {
      cookTime: cTimeCode,
      cF: cfCode,
      cookTemperature: cTempCode,
      cookMode: cModeCode,
      gear: oldGearCode,
      cookGear: newGearCode,
      pressure: pressureCode,
      autoClean: autoCode,
      manualClean: manualCode,
      tempUnitConvert: newCfCode,
    } = this.codes;
    const schemaValues = Object.values(schema);
    const cloudCodesValue = Object.keys(schema);
    const defaultCodesValue = Object.values(defaultCodes);
    const diffCodes = cloudCodesValue.reduce(
      (pre, cur) => (defaultCodesValue.includes(cur) ? pre : pre.concat(cur)),
      []
    );
    const cookModeCodes = diffCodes.filter(d => d.match(/cook_mode_/));
    const settingCodes = diffCodes.filter(d => !d.match(/cook_mode_/));
    const COOK_MODE_DPS = schemaValues.filter(({ code }) => cookModeCodes.includes(code));
    const washCode = autoCode || manualCode;
    const COOKER_BOTTOM_DPS = [cTempCode, cModeCode, pressureCode, oldGearCode, newGearCode];
    const COOKER_SETTING_DPS = [
      newCfCode,
      cfCode,
      cTimeCode,
      cTempCode,
      cModeCode,
      pressureCode,
      oldGearCode,
      newGearCode,
    ].filter(Boolean);
    const SETTING_SCENE_OMIT_DPS = [...settingCodes];
    this.dpFun = {
      settingDps: schemaValues.filter(
        ({ code, mode }) =>
          mode === 'rw' && SETTING_SCENE_OMIT_DPS.includes(code) && !cookModeCodes.includes(code)
      ),
      settingExtraDps: [washCode],
      cookerBottomDps: [...COOKER_BOTTOM_DPS, ...cookModeCodes],
      cookSettingDps: [...COOKER_SETTING_DPS, ...cookModeCodes],
      cookModeDps: COOK_MODE_DPS.filter(({ mode }) => mode === 'rw'),
    };
  };

  getDpSchema = code => {
    if (this.schema[code]) {
      return this.schema[code];
    }
    return {};
  };

  getUiValue = target => _.get(this.assist, `icons.${target}`);

  setDevInfo = info => {
    console.log('info', info);
    Object.assign(this.devInfo, info);
    console.log('this.info', this.info);
  };
}

const Config = new ConfigFactory();

export default Config;
