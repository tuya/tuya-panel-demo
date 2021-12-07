import { Interface } from '../../resourceManager';

import { IProps } from '../interface';

const onMapId: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onMapId && config.onMapId(eventData);
  },
};

export default onMapId;
