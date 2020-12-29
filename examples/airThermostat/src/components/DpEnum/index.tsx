import React, { SFC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, IconFont, Utils } from 'tuya-panel-kit';
import icons from 'icons';

const {
  ThemeUtils: { withTheme },
  RatioUtils: { convertX: cx },
} = Utils;

interface ItemData {
  label: string;
  value: any;
}

interface Props {
  list: ItemData[];
  value: any;
  theme?: any;
  onChange: (v: string) => void;
}

const DpEnum: SFC<Props> = ({ value: current, list, onChange, theme }) => {
  const {
    global: { brand: themeColor, fontColor },
  } = theme;
  return (
    <View style={styles.box}>
      {list.map(({ value, label }) => {
        const isSelected = current === value;
        return (
          <TouchableOpacity
            key={value}
            activeOpacity={0.7}
            onPress={() => onChange(value)}
            style={styles.item}
          >
            <TYText style={styles.label}>{label}</TYText>
            {isSelected && <IconFont d={icons.right} size={22} color={themeColor} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default withTheme(DpEnum);

const styles = StyleSheet.create({
  box: {
    padding: cx(24),
    alignItems: 'center',
  },
  item: {
    width: cx(327),
    height: cx(62),
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: cx(24),
    paddingRight: cx(20),
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
});
