import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onLoggerInfo: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onLoggerInfo && config.onLoggerInfo(eventData);
  },
};

export default onLoggerInfo;
