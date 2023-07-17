import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onRenderContextLost: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onRenderContextLost && config.onRenderContextLost(eventData);
  },
};

export default onRenderContextLost;
