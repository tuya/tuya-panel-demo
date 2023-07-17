import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onClickModel: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickModel && config.onClickModel(eventData);
  },
};

export default onClickModel;
