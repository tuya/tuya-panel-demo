import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onVirtualInfoRendered: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onVirtualInfoRendered && config.onVirtualInfoRendered(eventData);
  },
};

export default onVirtualInfoRendered;
