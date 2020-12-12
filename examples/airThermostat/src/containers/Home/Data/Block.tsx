import React, { SFC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import Color from 'color';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProp {
  value: number;
  unit: string;
  label: string;
  icon: string;
  theme?: any;
}

const Block: SFC<IProp> = ({ value, unit, label, icon, theme }) => {
  const {
    global: { brand: themeColor, fontColor },
  } = theme;
  return (
    <View
      style={[
        styles.box,
        {
          borderColor: Color(themeColor)
            .alpha(0.5)
            .rgbaString(),
        },
      ]}
    >
      <View style={styles.valueBox}>
        <TYText style={[styles.value, { color: themeColor }]}>{value}</TYText>
        <TYText style={[styles.unit, { color: themeColor }]}>{unit}</TYText>
      </View>
      <View style={styles.labelBox}>
        <TYText style={styles.label}>{label}</TYText>
        <IconFont d={icon} size={14} color={fontColor} />
      </View>
    </View>
  );
};
export default withTheme(Block);

const styles = StyleSheet.create({
  box: {
    marginTop: 16,
    width: cx(155),
    height: 131,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: cx(28),
  },
  valueBox: {
    marginTop: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 40,
    fontWeight: '500',
  },
  unit: { fontSize: 12, marginLeft: cx(7) },
  labelBox: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    marginRight: cx(6),
  },
});
