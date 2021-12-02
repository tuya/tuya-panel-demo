import { Interface } from '../../resourceManager';
import { IStore, IProps } from '../interface';

// minAreaWidth Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { forbiddenAreaConfig } = configs.laserMapPanelConfig;
  return forbiddenAreaConfig.sweepForbiddenArea.sweepForbiddenMinWidth / 0.05;
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const minAreaWidth: Interface.IElementProps = {
  format,
  validate,
};

export default minAreaWidth;
