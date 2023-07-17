import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import Utils from '../../../../../../protocol/utils';

const {
  PressCoordinateUtils: { convertColorToArgbHex },
} = Utils;

// d3WallColor Props生成规则
const format = (store: IStore, configs: IProps) => {
  return convertColorToArgbHex('#E1E1E1');
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const d3BgColor: Interface.IElementProps = {
  format,
  validate,
};

export default d3BgColor;
