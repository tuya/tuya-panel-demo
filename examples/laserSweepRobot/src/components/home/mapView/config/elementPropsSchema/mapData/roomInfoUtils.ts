/* eslint-disable camelcase */
/* eslint-disable radix */
import _ from 'lodash';

// roomInfo配置
export const getRoomProperty = (
  params: {
    name?: string;
    water_level?: string;
    fan?: string;
    sweep_count?: string;
  },
  UIConfig: { isCustomizeMode: boolean },
  mapConfig: any
) => {
  const { nameConfig, attributesConfig } = mapConfig;
  const { isCustomizeMode } = UIConfig;

  // 后台配置信息，可控制名称和配置信息的显示
  const { partitionNameShow } = nameConfig;
  const { attributesFan, attributesTimes, attributesWater } = attributesConfig;
  const { attributesFanShow, attributesFanIconEnum = [] } = attributesFan;
  const { attributesTimesShow } = attributesTimes;
  const { attributesWaterShow, attributesWaterIconEnum = [] } = attributesWater;
  const roomProperty = [];
  // 名称text
  if (params.name && partitionNameShow) {
    roomProperty.push({
      propertyType: 'text',
      value: params.name,
    });
  }
  if (!isCustomizeMode && !_.isUndefined(isCustomizeMode)) return roomProperty;
  // 水量和吸力image
  const iconPro = [];
  const { water_level, fan, sweep_count } = params;

  if (attributesWaterShow) {
    const icon =
      !!water_level && attributesWaterIconEnum[+water_level]
        ? attributesWaterIconEnum[+water_level]
        : null;
    iconPro.push({ value: water_level, icon });
  }

  if (attributesFanShow) {
    const icon = !!fan && attributesFanIconEnum[+fan] ? attributesFanIconEnum[+fan] : null;
    iconPro.push({ value: fan, icon });
  }
  const iconRes = iconPro
    .filter(({ value, icon }) => !!icon || (!_.isUndefined(value) && +value < 5))
    .map(({ value, icon }) => {
      return {
        propertyType: 'uri',
        value: icon,
      };
    });

  if (iconRes.length > 0) {
    roomProperty.push(...iconRes);
  }
  if (
    attributesTimesShow &&
    sweep_count &&
    !!parseInt(sweep_count) &&
    parseInt(sweep_count) < 255
  ) {
    roomProperty.push({
      propertyType: 'text',
      value: ` ×${sweep_count}`,
    });
  }
  return roomProperty;
};

export const getCurData = (
  pre: { [x: string]: string },
  custom: { [x: string]: string },
  cur: { [x: string]: string },
  key: string
) => {
  let res: number | string;
  if (pre && pre[key]) {
    res = pre[key];
  } else if (custom && custom[key]) {
    res = custom[key];
  } else {
    res = cur[key];
  }
  return res;
};
