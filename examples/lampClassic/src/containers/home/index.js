import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeBottomView from './bottom';
import Lamp from '../lamp';

const HomeScene = () => (
  <View style={styles.container}>
    <Lamp />
    <HomeBottomView />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScene;
