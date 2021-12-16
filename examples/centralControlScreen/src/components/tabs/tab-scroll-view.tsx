import React from 'react';
import { ScrollView } from 'react-native';

export default class TabScrollView extends React.PureComponent {
  _scrollView;

  componentDidMount() {
    this._scrollView.scrollResponderHandleStartShouldSetResponder = () => true;
  }

  render() {
    const { children } = this.props;
    return (
      <ScrollView
        ref={x => {
          this._scrollView = x;
        }}
        {...this.props}
      >
        {children}
      </ScrollView>
    );
  }
}
