import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TYText } from 'tuya-panel-kit';

const Loading = ({ tip = '' }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator animating={true} size="large" color="#bbb" />
      <TYText style={styles.noSubtitle}>{tip}</TYText>
    </View>
  );
};
export default Loading;

const styles = StyleSheet.create({
  noSubtitle: {
    color: '#9B9B9B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
});
