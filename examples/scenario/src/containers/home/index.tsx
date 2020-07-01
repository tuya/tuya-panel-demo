import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeContentView from './home-content-view';

export default class HomeLayout extends React.PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <HomeContentView />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
