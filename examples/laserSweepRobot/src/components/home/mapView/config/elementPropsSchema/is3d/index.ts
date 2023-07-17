import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// is3d
const format = (store: IStore, configs: IProps) => {
  return false;
};

const validate = (value: any) => {
  if (value === undefined) return false;
  return true;
};

const is3d: Interface.IElementProps = {
  format,
  validate,
};

export default is3d;
