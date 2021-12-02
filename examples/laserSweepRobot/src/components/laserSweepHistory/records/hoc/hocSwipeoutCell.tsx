/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { Swipeout } from 'tuya-panel-kit';

import Strings from '@i18n';

interface IProps {
  onItemDeletePress: () => void; // item删除回调
}

const HocSwipeCell = WrappedComponent => {
  return class HocSwipeCell extends Component<IProps> {
    // eslint-disable-next-line react/static-property-placement
    static defaultProps = {
      onItemDeletePress: () => { },
    };

    onItemDeletePress = () => {
      const { onItemDeletePress } = this.props;
      onItemDeletePress && onItemDeletePress();
    };

    render() {
      return (
        <Swipeout
          right={[
            {
              text: Strings.getLang('delete'),
              onPress: this.onItemDeletePress,
              type: 'delete',
              textStyle: { color: '#fff', fontSize: 16 },
            },
          ]}
        >
          <WrappedComponent {...this.props} />
        </Swipeout>
      );
    }
  };
};

export default HocSwipeCell;
