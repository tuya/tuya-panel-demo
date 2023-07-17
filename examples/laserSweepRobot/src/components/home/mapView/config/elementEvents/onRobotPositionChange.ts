import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onRobotPositionChange: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onRobotPositionChange && config.onRobotPositionChange(eventData);
  },
};

export default onRobotPositionChange;
