import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onMapLoadEnd: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onMapLoadEnd && config.onMapLoadEnd(eventData);
  },
};

export default onMapLoadEnd;
