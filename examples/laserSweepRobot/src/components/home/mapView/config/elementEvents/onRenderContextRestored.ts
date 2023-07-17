import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onRenderContextRestored: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onRenderContextRestored && config.onRenderContextRestored(eventData);
  },
};

export default onRenderContextRestored;
