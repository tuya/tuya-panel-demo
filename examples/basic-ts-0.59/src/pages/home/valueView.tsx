import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Res from '@res';

interface Props {
  style?: StyleProp<ViewStyle>;
  value: number;
  max: number;
  min: number;
  step: number;
  readonly: boolean;
  onChange: (value: number) => void;
}

const ValueView: React.FC<Props> = props => {
  const { style, value, readonly } = props;

  const increment = () => {
    if (readonly) return;
    const { max, min, step, onChange } = props;
    const v = Math.min(max, Math.max(min, value + step));
    if (onChange) {
      onChange(v);
    }
  };

  const decrement = () => {
    const { max, min, step, onChange } = props;
    if (readonly) return;
    const v = Math.min(max, Math.max(min, value - step));
    if (onChange) {
      onChange(v);
    }
  };

  return (
    <View style={[styles.container, style, readonly ? { opacity: 0.5 } : null]}>
      <TouchableOpacity
        onPress={decrement}
        activeOpacity={0.8}
        style={[styles.iconStyle, { paddingRight: 20 }]}
      >
        <Image source={Res.tuya_decrease} />
      </TouchableOpacity>
      <View style={styles.line} />
      <Text style={styles.valueStyle}>{value}</Text>
      <View style={styles.line} />
      <TouchableOpacity
        onPress={increment}
        activeOpacity={0.8}
        style={[styles.iconStyle, { paddingLeft: 20 }]}
      >
        <Image source={Res.tuya_increase} />
      </TouchableOpacity>
    </View>
  );
};

ValueView.defaultProps = {
  style: null,
  readonly: false,
  max: 100,
  min: 0,
  step: 1,
  value: 100,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },

  line: {
    backgroundColor: '#ddd',
    width: 1,
    height: 36,
  },

  iconStyle: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  valueStyle: {
    flex: 1,
    color: '#303030',
    fontSize: 18,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
});

export default ValueView;
