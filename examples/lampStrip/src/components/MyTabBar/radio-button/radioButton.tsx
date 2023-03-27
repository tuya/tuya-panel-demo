import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { TYText } from 'tuya-panel-kit';

interface Iprops {
  title: string;
  isActive?: boolean;
  accessibilityLabel?: string;
  textAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<ViewStyle>;
  onItemPress: (t: any) => void;
}
const RadioButton = (props: Iprops) => {
  const {
    title,
    onItemPress,
    style,
    isActive,
    textStyle,
    activeTextStyle,
    accessibilityLabel,
    textAccessibilityLabel,
  } = props;
  const customTextStyle = [
    styles.textStyle,
    textStyle && textStyle,
    isActive && styles.activeTextStyle,
    isActive && activeTextStyle && activeTextStyle,
  ];
  return (
    <TouchableOpacity onPress={onItemPress} style={style} accessibilityLabel={accessibilityLabel}>
      {typeof title === 'string' || typeof title === 'number' ? (
        <TYText
          style={customTextStyle}
          numberOfLines={1}
          accessibilityLabel={textAccessibilityLabel}
        >
          {title}
        </TYText>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
};

RadioButton.defaultProps = {
  isActive: false,
  style: {},
  textStyle: {},
  activeTextStyle: {},
  accessibilityLabel: '',
  textAccessibilityLabel: '',
};
const styles = StyleSheet.create({
  textStyle: {
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  activeTextStyle: {
    color: '#5190F3',
  },
});
export default RadioButton;
