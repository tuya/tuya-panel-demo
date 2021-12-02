import { Interface } from '../../../resourceManager';
import Utils from '../../../../../../protocol/utils';
import { IStore, IProps } from '../../interface';

const { convertColorToArgbHex } = Utils.PressCoordinateUtils;

// factorInfo Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { laserMapPanelConfig } = configs;
  const {
    forbiddenAreaConfig: {
      sweepForbiddenArea: { sweepForbiddenShowUnit, sweepForbiddenFactorColor = '#000000' },
    },
  } = laserMapPanelConfig;
  if (!sweepForbiddenShowUnit) return {};
  return { factor: 0.05, font: 12, color: convertColorToArgbHex(sweepForbiddenFactorColor) };
};

const validate = (value: any) => {
  return true;
};

const factorInfo: Interface.IElementProps = {
  format,
  validate,
};

export default factorInfo;
