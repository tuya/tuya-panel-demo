import _ from 'lodash';
import { Interface } from '../../../resourceManager';
import Utils from '../../../../../../protocol/utils';
import { IStore, IProps } from '../../interface';

const { convertColorToArgbHex } = Utils.PressCoordinateUtils;

// pilePosition Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { pilePosition } = store;
  const { uiInterFace, laserMapPanelConfig } = configs;
  const {
    forbiddenAreaConfig: { pileConfig },
  } = laserMapPanelConfig;
  const { isShowPileRing } = uiInterFace || {};

  const curPilePosition = {
    ...pilePosition,
    radius: Math.floor(pileConfig.ringRadiusRealMeter / 0.05),
    bgColor: convertColorToArgbHex(pileConfig.ringBgColor),
    borderColor: convertColorToArgbHex(pileConfig.ringBorderColor),
  };
  if (isShowPileRing && pileConfig.pileRingAvailable) {
    return {
      ...curPilePosition,
      hidden: false,
    };
  }
  return { ...pilePosition, hidden: true };
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const pilePosition: Interface.IElementProps = {
  format,
  validate,
};

export default pilePosition;
