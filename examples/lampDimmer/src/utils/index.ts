import dpCodes from 'config/default/dpCodes';
import resource from 'res';

const { oldPower, power, bright, minBright, maxBright, countdown, ledType } = dpCodes;

export const devInfo: any = {};

export const setDevInfo = (v: any) => {
  Object.assign(devInfo, v);
};
export const getDpCodesByType = (type: number, schema: any) => {
  const codes: DpCodes = {
    powerCode: `${power}_${type}`,
    brightCode: `${bright}_${type}`,
    minBrightCode: `${minBright}_${type}`,
    maxBrightCode: `${maxBright}_${type}`,
    ledTypeCode: `${ledType}_${type}`,
    countdownCode: `${countdown}_${type}`,
  };

  // 倒计时老dp兼容处理
  if (type === 1) {
    if (schema[countdown]) {
      codes.countdownCode = countdown;
    }
  }
  // 老开关 dp 兼容处理
  const powerCode = `${oldPower}_${type}`;
  if (schema[powerCode]) {
    codes.powerCode = powerCode;
  }

  return codes;
};
export const isSupportFun = (code: string) => {
  const { schema } = devInfo;
  return Object.keys(schema).includes(code);
};

export const isCapability = (id: number) => {
  return (devInfo.capability & (1 << id)) > 0; // eslint-disable-line no-bitwise
};

export const getLightTypes = (index: number, schema: any) => {
  const { ledTypeCode } = getDpCodesByType(index, schema);
  if (schema[ledTypeCode]) {
    return schema[ledTypeCode].range.map((key: string) => ({
      key: key.toLowerCase(),
      value: key,
    }));
  }

  return [];
};

export const formatPercent = (value: number, { min = 0, max = 1000, minPercent = 0 } = {}) => {
  return Math.round(((100 - minPercent) * (value - min)) / (max - min) + minPercent);
};

export const getLedTypeIcon = (ledType: string, isSmall: boolean = false) => {
  switch (ledType.toLowerCase()) {
    case 'led':
      return isSmall ? resource.ledSmall : resource.led;
    case 'incandescent':
      return isSmall ? resource.incandescentSmall : resource.incandescent;
    case 'halogen':
      return isSmall ? resource.halogenSmall : resource.halogen;
    default:
      return isSmall ? resource.ledSmall : resource.led;
  }
};

export const isSupportTimer = () => {
  const {
    panelConfig: { bic },
  } = devInfo;

  return bic.some((item: any) => {
    return item.code === 'timer' && item.selected;
  });
};

export const isSupportJumpUrl = () => {
  const {
    panelConfig: { bic },
  } = devInfo;

  return bic.some((item: any) => {
    return item.code === 'jump_url' && item.selected;
  });
};
