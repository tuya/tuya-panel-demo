import { Interface } from '../../resourceManager';

import { IProps } from '../interface';

const onClickSplitArea: Interface.IElementEvent = {
  onEvent: (eventData, store, config: IProps) => {
    config.onClickSplitArea && config.onClickSplitArea(eventData);
  },
};

export default onClickSplitArea;
