import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onScreenSnapshot: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onScreenSnapshot && config.onScreenSnapshot(eventData);
  },
};

export default onScreenSnapshot;
