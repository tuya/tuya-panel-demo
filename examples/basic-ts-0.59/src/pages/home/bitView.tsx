import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { getFaultStrings } from '@utils';
import StringView from './stringView';

const getFaultLabel = (fault: number, labels: string[]) => {
  let label = `Unknow Label: ${fault}`;
  for (let index = 0; index < labels.length; index++) {
    // eslint-disable-next-line no-bitwise
    if (fault & (index + 1)) {
      label = labels[index];
      break;
    }
  }
  return label;
};

interface Props {
  style?: StyleProp<ViewStyle>;
  code: string;
  value: number;
  label: string[];
  readonly: boolean;
  onChange: (...args: any[]) => void;
}

const BitView: React.FC<Props> = props => {
  const { style, code, readonly, value, label, onChange } = props;
  const faultText = getFaultStrings(code, value) || 'Unknow error';
  const strText = value > 0 ? `${getFaultLabel(value, label)}: ${faultText}` : 'No error!';
  const height = value > 0 || !readonly ? 'auto' : 35;

  const handleChange = (v: string) => {
    if (onChange) {
      onChange(parseInt(v, 10));
    }
  };

  return (
    <View style={[styles.container, style, { flexDirection: 'column', height }]}>
      <Text style={[styles.textInput]}>{strText}</Text>
      {!readonly && <StringView readonly={false} value={`${value}`} onChange={handleChange} />}
    </View>
  );
};

BitView.defaultProps = {
  style: null,
  readonly: true,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 150,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 4,
    opacity: 0.5,
  },

  textInput: {
    flex: 1,
    margin: 1,
    fontSize: 10,
    lineHeight: 16,
    color: '#303030',
  },
});

export default BitView;
