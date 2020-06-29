import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeModeView from './home-mode-view';
import HomeControlView from './home-control-view';
import HomeCurtainView from './home-curtain-view';

const HomeScene = () => (
  <View style={styles.container}>
    <HomeModeView />
    <HomeCurtainView />
    <HomeControlView />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default HomeScene;
