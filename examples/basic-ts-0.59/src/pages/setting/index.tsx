import { StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import React from 'react';

const Setting: React.FC = () => {
  return (
    <View style={styles.container}>
      <TYText size={24} color="#fff">
        I am Setting Page&apos;s Content
      </TYText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Setting;
