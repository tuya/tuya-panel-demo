import { TYSdk } from 'tuya-panel-kit';
import dpCodes from './dpCodes';

const getDpExist = () => {
  const codes = dpCodes as { [key: string]: string };
  const dpArr = Object.keys(codes).reduce((pre, curr) => {
    const upperCaseCurr = curr[0].toUpperCase() + curr.substr(1);
    return { ...pre, [`dp${upperCaseCurr}`]: !!TYSdk.device.checkDpExist(codes[curr]) };
  }, {});
  return dpArr;
};

const getIdsByCodes = (codes: string[]) => {
  const ids: number[] = [];
  Object.values(dpCodes).forEach(v => {
    if (codes.includes(v)) {
      const id = TYSdk.device.getDpIdByCode(v);
      ids.push(Number(id));
    }
  });
  return ids.filter(i => !!i);
};

export default {
  getDpExist,
  getIdsByCodes,
};
