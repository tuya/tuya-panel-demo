import React, { FC } from 'react';
import {
  TouchableOpacity,
  Text,
  Platform,
  TextStyle,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';

interface INativeButtonProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const NativeButton: FC<INativeButtonProps> = ({
  accessibilityLabel,
  disabled,
  style,
  textStyle,
  children,
  onPress,
}) => {
  const renderText = () => {
    if (typeof children !== 'string') {
      return children;
    }
    return (
      <Text
        numberOfLines={1}
        ellipsizeMode={Platform.OS === 'ios' ? 'clip' : 'tail'}
        style={[styles.textButton, textStyle]}
      >
        {children}
      </Text>
    );
  };

  const disabledStyle = disabled ? styles.opacity : {};
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      activeOpacity={1}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, disabledStyle]}
    >
      {renderText()}
    </TouchableOpacity>
  );
};

NativeButton.defaultProps = {
  accessibilityLabel: '',
  disabled: false,
  style: {},
  textStyle: {},
  onPress: () => ({}),
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  textButton: {
    fontSize: 14,
    alignSelf: 'center',
  },
  opacity: {
    opacity: 0.8,
  },
});

export default NativeButton;
