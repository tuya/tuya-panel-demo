import React from 'react';
import {
  Text,
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Popup } from 'tuya-panel-kit';
import Res from '@res';

interface Props {
  style?: StyleProp<ViewStyle>;
  values: string[];
  selected: string | number;
  readonly: boolean;
  onChange: (value: string) => void;
}

const EnumView: React.FC<Props> = props => {
  const { style, values, readonly, onChange } = props;
  const [selected, setSelected] = React.useState(props.selected);

  const handlePress = () => {
    if (readonly) return;
    Popup.list({
      type: 'radio',
      maxItemNum: 7,
      dataSource: values.map(value => ({
        key: value,
        title: value,
        value,
      })),
      title: '标题',
      cancelText: '取消',
      confirmText: '确认',
      value: selected,
      onMaskPress: ({ close }) => close(),
      onConfirm: (value, { close }) => {
        setSelected(value);
        onChange(value);
        close();
      },
    });
  };

  return (
    <TouchableOpacity style={style} activeOpacity={0.8} onPress={handlePress}>
      <View style={[styles.container, readonly ? { opacity: 0.5 } : null]}>
        <Text style={styles.text}>{selected}</Text>
        {!readonly && <Image style={styles.icon} source={Res.tuya_select_icon} />}
      </View>
    </TouchableOpacity>
  );
};

EnumView.defaultProps = {
  style: null,
  readonly: false,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 150,
    height: 36,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    flex: 1,
    fontSize: 14,
    color: '#303030',
    marginHorizontal: 10,
  },

  icon: {
    alignItems: 'flex-end',
    margin: 10,
  },
});

export default EnumView;
