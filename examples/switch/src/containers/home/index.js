import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeSwitchView from './home-switch-view';
import HomeBottomView from './home-bottom-view';

const HomeScene = props => (
  <View style={styles.container}>
    <HomeSwitchView {...props} />
    <HomeBottomView {...props} />
  </View>
);

HomeScene.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});

export default HomeScene;
