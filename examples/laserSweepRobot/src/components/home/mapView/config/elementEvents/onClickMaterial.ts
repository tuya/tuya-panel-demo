import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onClickMaterial: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickMaterial && config.onClickMaterial(eventData);
  },
};

export default onClickMaterial;
