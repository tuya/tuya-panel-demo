import { Interface } from '../../resourceManager';
import { IProps } from '../interface';

const onClickMapView: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickMapView && config.onClickMapView(eventData);
  },
};

export default onClickMapView;
