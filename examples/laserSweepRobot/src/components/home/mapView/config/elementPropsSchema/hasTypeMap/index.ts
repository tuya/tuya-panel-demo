import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// hasTypeMap Props生成规则
const format = (store: IStore, configs: IProps) => {
  return true;
};

const validate = (value: any) => {
  return !!value;
};

const hasTypeMap: Interface.IElementProps = {
  format,
  validate,
};

export default hasTypeMap;
