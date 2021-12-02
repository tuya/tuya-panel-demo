import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onClickRoom: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickRoom && config.onClickRoom(eventData);
  },
};

export default onClickRoom;
