import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import Utils from '../../../../../../protocol/utils';

const {
  PressCoordinateUtils: { convertColorToArgbHex },
} = Utils;

// splitColor Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { mapPartitionConfig } = configs.laserMapPanelConfig;
  return convertColorToArgbHex(mapPartitionConfig.partitionSplitFunc.partitionSplitColor);
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const splitColor: Interface.IElementProps = {
  format,
  validate,
};

export default splitColor;
