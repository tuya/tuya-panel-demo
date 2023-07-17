import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// markerIcon Props生成规则
const format = (store: IStore, configs: IProps) => {
  return 3;
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const maxRoomPropertyLength: Interface.IElementProps = {
  format,
  validate,
};

export default maxRoomPropertyLength;
