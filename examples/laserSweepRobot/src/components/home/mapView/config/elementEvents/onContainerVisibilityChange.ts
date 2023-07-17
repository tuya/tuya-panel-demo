import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onContainerVisibilityChange: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onContainerVisibilityChange && config.onContainerVisibilityChange(eventData);
  },
};

export default onContainerVisibilityChange;
