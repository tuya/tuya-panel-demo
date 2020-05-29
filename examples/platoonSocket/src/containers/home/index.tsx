/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { View } from 'react-native';
import HomeBottomView from './home-bottom-view';
import HomeSocketView from './Home-socket-view';

export default class MainLayout extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <HomeSocketView />
        <HomeBottomView />
      </View>
    );
  }
}
