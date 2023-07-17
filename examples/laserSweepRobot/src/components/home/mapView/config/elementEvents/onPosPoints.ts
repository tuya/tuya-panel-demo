import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onPosPoints: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onPosPoints && config.onPosPoints(eventData);
  },
};

export default onPosPoints;
