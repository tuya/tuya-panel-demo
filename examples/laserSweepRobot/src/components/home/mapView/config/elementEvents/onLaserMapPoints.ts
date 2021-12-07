import { Interface } from '../../resourceManager';

import { IProps } from '../interface';

const onLaserMapPoints: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onLaserMapPoints && config.onLaserMapPoints(eventData);
  },
};

export default onLaserMapPoints;
