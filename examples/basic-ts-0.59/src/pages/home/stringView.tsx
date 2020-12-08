import React from 'react';
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Res from '@res';
import Strings from '@i18n';

interface Props {
  style?: StyleProp<ViewStyle>;
  value: string;
  readonly: boolean;
  onChange: (value: string) => void;
}

const StringView: React.FC<Props> = props => {
  const { style, readonly, onChange } = props;

  const [text, setText] = React.useState(props.value);

  React.useEffect(() => setText(props.value), [props.value]);

  const handlePress = () => {
    if (readonly) return;
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <View style={[styles.container, readonly ? { opacity: 0.5 } : null, style]}>
      <View
        style={[
          styles.textBorder,
          readonly ? { borderRadius: 4, borderRightWidth: 1 } : { borderRightWidth: 0 },
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholder={readonly ? Strings.getLang('hit_empty') : Strings.getLang('hit_input')}
          multiline={false}
          onChangeText={v => setText(v)}
          value={text}
          editable={!readonly}
          onSubmitEditing={handlePress}
        />
      </View>
      {!readonly && (
        <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handlePress}>
          <Image source={Res.tuya_goto_icon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

StringView.defaultProps = {
  style: null,
  readonly: false,
  value: '',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 150,
    height: 35,
  },

  textBorder: {
    flex: 1,
    borderColor: '#DDDDDD',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },

  textInput: {
    flex: 1,
    padding: 0,
    fontSize: 14,
    color: '#303030',
    paddingLeft: 4,
  },

  button: {
    backgroundColor: '#FF5800',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StringView;
