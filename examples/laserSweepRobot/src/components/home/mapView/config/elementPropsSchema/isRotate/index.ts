import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

// isRotate Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { forbiddenAreaConfig } = configs.laserMapPanelConfig;
  return forbiddenAreaConfig.sweepForbiddenArea.sweepForbiddenRotate;
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const isRotate: Interface.IElementProps = {
  format,
  validate,
};

export default isRotate;
