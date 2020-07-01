import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeBottomView from './home-bottom-view';
import HomeTopView from './home-top-view';
import AlarmTipView from './alarm-tip-view';

const HomeScene = () => (
  <View style={styles.container}>
    <HomeTopView style={styles.content} />
    <AlarmTipView />
    <HomeBottomView />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  content: {
    flex: 1,
  },
});

export default HomeScene;
