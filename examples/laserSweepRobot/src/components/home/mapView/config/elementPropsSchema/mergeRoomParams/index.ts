import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// mergeRoomParams Props生成规则
const format = (store: IStore, configs: IProps) => {
  return {
    checkedIcon: {
      checkedIconEnable: false,
    },
  };
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const mergeRoomParams: Interface.IElementProps = {
  format,
  validate,
};

export default mergeRoomParams;
