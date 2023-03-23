/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker, TYText, Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

interface PickerUnitProps {
  list: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const PickerUnit: FC<PickerUnitProps> = ({ list, label, value, onChange, ...restProps }) => (
  <View style={styles.container}>
    <Picker
      style={styles.picker}
      itemStyle={styles.pickerItem}
      theme={{ fontSize: cx(40) }}
      visibleItemCount={7}
      selectedValue={value}
      onValueChange={onChange}
      {...restProps}
    >
      {list.map(v => (
        <Picker.Item key={v} value={v} label={v} />
      ))}
    </Picker>
    <TYText style={styles.label}>{label}</TYText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    width: cx(60),
    height: cx(324),
  },
  pickerItem: {
    height: cx(324),
  },
  label: {
    fontSize: cx(14),
    marginTop: cx(10),
  },
});

export default PickerUnit;
