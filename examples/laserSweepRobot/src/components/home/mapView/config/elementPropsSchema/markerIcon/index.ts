import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import { robotBase64Img } from '../../../../../../res/base64Imgs';

// markerIcon Props生成规则
const format = (store: IStore, configs: IProps) => {
  return robotBase64Img;
};

const validate = (value: any) => {
  if (!value) return false;
  return true;
};

const markerIcon: Interface.IElementProps = {
  format,
  validate,
};

export default markerIcon;
