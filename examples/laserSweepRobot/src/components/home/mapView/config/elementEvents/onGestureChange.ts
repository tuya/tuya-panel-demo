import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onGestureChange: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onGestureChange && config.onGestureChange(eventData);
  },
};

export default onGestureChange;
