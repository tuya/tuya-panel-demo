import { Interface } from '../../../resourceManager';
import Utils from '../../../../../../protocol/utils';
import { IStore, IProps } from '../../interface';

const { convertColorToArgbHex } = Utils.PressCoordinateUtils;

// pathData Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { pathData } = store;
  const { ringConfig, pathConfig } = configs.laserMapPanelConfig;
  const { isShowCurPosRing } = configs.uiInterFace || {};
  if (!pathData.length) return '[]';
  const tmp = [...pathData];
  tmp[tmp.length - 1] = {
    ...tmp[tmp.length - 1],
    hidden: !(ringConfig.ringAvailable && isShowCurPosRing),
    rate: ringConfig.ringMaxRate,
    bgColor: convertColorToArgbHex(ringConfig.ringBgColor),
    duration: ringConfig.ringDuration,
    dataColors: {
      common: convertColorToArgbHex(pathConfig.pathColor.common),
      charge: convertColorToArgbHex(pathConfig.pathColor.backCharge),
      transitions: convertColorToArgbHex(pathConfig.pathColor.transitions),
    },
  };

  return JSON.stringify(tmp);
};

const validate = (value: any) => {
  return !!value;
};

const pathData: Interface.IElementProps = {
  format,
  validate,
};

export default pathData;
