import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// pileIcon Props生成规则
const format = (store: IStore, configs: IProps) => {
  // const { pile } = configs.laserMapPanelConfig;
  return '';
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const pileIcon: Interface.IElementProps = {
  format,
  validate,
};

export default pileIcon;
