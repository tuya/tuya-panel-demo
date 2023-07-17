import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onClickRoomProperties: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickRoomProperties && config.onClickRoomProperties(eventData);
  },
};

export default onClickRoomProperties;
