import camelCase from 'camelcase';
import _ from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export const arrayToObject = (arr: any) => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign(...arr);
};

export const getSettings = (schema: any) => {
  const schemaValues = Object.values(schema);
  const codes = arrayToObject(
    schemaValues.map(({ code }) => ({
      [camelCase(code)]: code,
    }))
  );
  const getDpCodes = (dps: any, regex: any) => {
    const reg = new RegExp(regex);
    return dps.filter((dp: string) => reg.test(dp));
  };
  const dpCodesValues = Object.values(codes);
  const switchCodes = getDpCodes(dpCodesValues, '^switch((?!all|inching).)+$');
  const countdownCodes = getDpCodes(dpCodesValues, '^countdown');
  // 通用功能点不在设置页面显示
  const notSettingCodes = _.uniq([...switchCodes, ...countdownCodes]);
  return schemaValues.filter(({ code }) => !notSettingCodes.includes(code));
};
