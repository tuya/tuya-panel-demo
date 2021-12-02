import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// planPathData Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { planPathData } = store;
  return JSON.stringify(planPathData);
};

const validate = (value: any) => {
  return !!value;
};

const planPathData: Interface.IElementProps = {
  format,
  validate,
};

export default planPathData;
