import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

interface IButtonRadioProps {
  active?: boolean;
}

const ButtonRadios: FC<IButtonRadioProps> = ({ active }) => (
  <View
    style={[
      styles.container,
      {
        borderColor: active ? '#FF5A28' : '#C5CDD3',
        borderWidth: active ? 3 : 2,
      },
    ]}
  >
    <View
      style={{
        backgroundColor: active ? '#FF5A28' : 'transparent',
        width: cx(8),
        height: cx(8),
        borderRadius: cx(4),
      }}
    />
  </View>
);

ButtonRadios.defaultProps = {
  active: false,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: cx(20),
    height: cx(20),
    borderRadius: cx(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ButtonRadios;
