import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import Utils from '../../../../../../protocol/utils';

const { convertColorToArgbHex } = Utils.PressCoordinateUtils;

// planPathColor Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { pathConfig } = configs.laserMapPanelConfig;

  return convertColorToArgbHex(pathConfig.pathColor.transitions);
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const planPathColor: Interface.IElementProps = {
  format,
  validate,
};

export default planPathColor;
