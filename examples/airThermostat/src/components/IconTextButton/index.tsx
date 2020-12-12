import React, { SFC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, IconFont, Utils } from 'tuya-panel-kit';

const {
  ThemeUtils: { withTheme },
  RatioUtils: { convertX: cx },
} = Utils;

interface Props {
  text: string;
  icon: string;
  active: boolean;
  theme?: any;
  onPress: () => void;
}

const IconTextButton: SFC<Props> = ({ text, icon, active, theme, onPress }) => {
  const {
    global: { brand: themeColor, fontColor },
    controllbar: { iconColor, fontSize },
  } = theme;
  return (
    <View style={styles.btn}>
      <TouchableOpacity style={styles.btnContent} activeOpacity={0.5} onPress={onPress}>
        {active ? (
          <TYText style={{ fontSize, fontWeight: '500', color: fontColor }}>{text}</TYText>
        ) : (
          <IconFont d={icon} size={22} color={iconColor} />
        )}
      </TouchableOpacity>
      <View style={[styles.active, { backgroundColor: themeColor, opacity: active ? 1 : 0 }]} />
    </View>
  );
};

export default withTheme(IconTextButton);

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    width: cx(60),
  },
  btnContent: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    height: 5,
    width: 5,
    borderRadius: 3,
    marginTop: 5,
  },
});
