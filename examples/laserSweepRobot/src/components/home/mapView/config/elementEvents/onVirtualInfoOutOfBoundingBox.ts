import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onVirtualInfoOutOfBoundingBox: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onVirtualInfoOutOfBoundingBox && config.onVirtualInfoOutOfBoundingBox(eventData);
  },
};

export default onVirtualInfoOutOfBoundingBox;
