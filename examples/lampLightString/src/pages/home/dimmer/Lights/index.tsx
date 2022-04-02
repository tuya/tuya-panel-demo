/* eslint-disable react/require-default-props */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import _ from 'lodash';
import { Utils } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import LightsUI from './UI';
import useGestureHandlers from './useGestureHandler';

const { convertX: cx } = Utils.RatioUtils;

interface LightsProps {
  style?: StyleProp<ViewStyle>;
  onSetRef?: any;
  heigthWidhtRatio?: number;
}

const Lights: React.FC<LightsProps> = ({ heigthWidhtRatio }) => {
  const { handlers, uiRef } = useGestureHandlers();
  const [ratio, setRatio] = useState(heigthWidhtRatio);
  useEffect(() => {
    setRatio(heigthWidhtRatio);
  }, [heigthWidhtRatio]);
  return (
    <View
      style={[
        styles.container,
        {
          marginTop: ratio! <= 1.75 ? cx(10) : cx(39),
          marginBottom: ratio! <= 1.75 ? cx(10) : cx(34),
        },
      ]}
      {...handlers}
    >
      <LightsUI innerRef={uiRef} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default connect(({ uiState }: any) => {
  return {
    heigthWidhtRatio: uiState.heigthWidhtRatio,
  };
})(Lights);
