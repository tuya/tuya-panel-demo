import { Interface } from '../../resourceManager';

import { IProps } from '../interface';

const onLongPressInAreaView: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onLongPressInAreaView && config.onLongPressInAreaView(eventData);
  },
};

export default onLongPressInAreaView;
