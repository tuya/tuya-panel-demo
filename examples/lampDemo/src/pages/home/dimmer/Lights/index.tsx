import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import _ from 'lodash';
import LightsUI from './UI';
import useGestureHandlers from './useGestureHandlers';

interface LightsProps {
  style?: StyleProp<ViewStyle>;
}

const Lights: React.FC<LightsProps> = ({ style }) => {
  const { handlers, uiRef } = useGestureHandlers();

  return (
    <View style={[styles.container, style]} {...handlers}>
      <LightsUI innerRef={uiRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Lights;
