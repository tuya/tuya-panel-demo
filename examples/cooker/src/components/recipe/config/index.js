import camelCase from 'camelcase';
import { Utils, TYSdk } from 'tuya-panel-kit';
import { arrayToObject } from '../utils';

const { RatioUtils } = Utils;
const { convertY: cy } = RatioUtils;
export class Config {
  constructor() {
    this.codes = this.getCodes();
    this.DetailBaseHeight = cy(225);
    this.themeColor = '#4397D7';
  }

  setDevInfo = devInfo => {
    this.codes = this.getCodes(devInfo);
  };

  setThemeColor = themeColor => {
    this.themeColor = themeColor;
  };

  getCodes = devInfo => {
    try {
      const { schema } = devInfo || TYSdk.devInfo;
      const dpSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
      const schemaValues = Object.values(dpSchema);
      const codes = arrayToObject(
        schemaValues.map(({ code }) => {
          const key = camelCase(code);
          return {
            [key]: code,
          };
        })
      );
      return codes;
    } catch (error) {
      return {};
    }
  };
}

export const configBase = Config;

export default new Config();
