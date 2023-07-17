import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onModelLoadingProgress: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onModelLoadingProgress && config.onModelLoadingProgress(eventData);
  },
};

export default onModelLoadingProgress;
