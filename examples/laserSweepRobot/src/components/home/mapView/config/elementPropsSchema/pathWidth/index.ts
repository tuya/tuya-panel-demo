import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// pathWidth Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { pathConfig } = configs.laserMapPanelConfig;
  return pathConfig.pathWidth;
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const pathWidth: Interface.IElementProps = {
  format,
  validate,
};

export default pathWidth;
