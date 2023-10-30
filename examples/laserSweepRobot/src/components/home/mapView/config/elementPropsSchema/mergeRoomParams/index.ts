import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// mergeRoomParams Props生成规则
// 房间合并中 是否显示选中的图标
// 可以配置选中和修改选中的图标 详情@tuya/rn-robot-map 的types 定义
const format = (store: IStore, configs: IProps) => {
  return {
    checkedIcon: {
      checkedIconEnable: true,
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
