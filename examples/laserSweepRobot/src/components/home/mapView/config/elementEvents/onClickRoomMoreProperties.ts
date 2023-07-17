import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onClickRoomMoreProperties: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickRoomMoreProperties && config.onClickRoomMoreProperties(eventData);
  },
};

export default onClickRoomMoreProperties;
