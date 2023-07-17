import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onSplitLine: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onSplitLine && config.onSplitLine(eventData);
  },
};

export default onSplitLine;
