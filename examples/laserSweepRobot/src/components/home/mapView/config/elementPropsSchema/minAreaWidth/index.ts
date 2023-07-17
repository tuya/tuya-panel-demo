import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';

/**
 * 处理过后的信息都会在这里再进行一次整合之后发送给App
 * @param store
 * @param configs
 * @returns
 */
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
