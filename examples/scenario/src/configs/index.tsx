import { Utils, TYSdk } from 'tuya-panel-kit';
import constant from './constant';
import assist from './assist';
import Res from '../res';

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff; font-size: 36px';
const log = (...args: any) => __DEV__ && console.log(...args);
const TYNative = TYSdk.native;

const backgroundImage = Res.bg;

export class Config {
  constructor() {
    this.assist = assist;
    this.constant = constant;
    this.dataBase = {};
    this.themeColor = '#3DCD58';
    this.background = backgroundImage;
  }
  assist: any;
  constant: any;
  dataBase: any;
  themeColor: any;
  background: any;

  /**
   * @desc localStroge, 做http请求缓存使用
   * @param {string} [key='']
   * @param {*} value
   */
  setLocalStroge = (key = '', value: any) => {
    if (key in this.dataBase) {
      Object.assign(this.dataBase, { [key]: value });
    } else {
      this.dataBase[key] = value;
    }
  };

  /**
   * @desc localStroge, 做http请求缓存使用
   * @param {string} [color=''] 主题色
   */
  setTheme = (color = '') => {
    try {
      if (color.match(/^#[0-9A-F]{6}$/i)) {
        this.themeColor = color;
      }
    } catch (error) {
      console.log(`%c color is illegality`, errStyle);
    }
  };

  setBackground = (image: any) => typeof image !== 'undefined' && (this.background = image);

  getLocalStroge = (key: any) => this.dataBase[key] || {};

  getAssist = (key: any, type = 'images') => {
    if (typeof key === 'undefined') {
      console.warn('can not find assit');
      return void 0;
    }
    return this.assist[type][key];
  };

  getAssistImages = (key: any) => this.getAssist(key, 'images');

  getAssistIcons = (key: any) => this.getAssist(key, 'icons');

  getAssistLayout = (key: any) => this.getAssist(key, 'layout');

  getAssistAnimation = (key: any) => this.getAssist(key, 'animation');

  fetch = async (...args: any) => {
    try {
      const success = await this.api(...args);
      return [success, null];
    } catch (err) {
      return [null, err];
    }
  };

  api = (a: any, postData: any, v = '1.0') => {
    return new Promise((resolve, reject) => {
      TYNative.apiRNRequest(
        {
          a,
          postData,
          v,
        },
        (d: any) => {
          const data = Utils.JsonUtils.parseJSON(d);
          log(`API Success: %c${a}%o`, sucStyle, data);
          resolve(data);
        },
        (err: any) => {
          const e = Utils.JsonUtils.parseJSON(err);
          log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e);
          reject(e);
        }
      );
    });
  };
}

export default new Config();

export { default as theme } from './theme';
