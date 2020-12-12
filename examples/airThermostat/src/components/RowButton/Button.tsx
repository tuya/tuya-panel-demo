import { Utils, TYText, SwitchButton } from 'tuya-panel-kit';
import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const { convertY: cy, convertX: cx, height: winHeight, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  label?: string;
  value?: string | boolean;
  disabled?: boolean;
  type?: 'default' | 'switch';
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  theme?: any;
  style?: any;
}

@withTheme
export default class RowButton extends PureComponent<Props> {
  handlePress = () => {
    const { onPress } = this.props;
    if (typeof onPress === 'function') {
      onPress();
    }
  };
  handleChangeSwitch = (v: boolean) => {
    const { onSwitchChange } = this.props;
    if (typeof onSwitchChange === 'function') {
      onSwitchChange(v);
    }
  };

  render() {
    const { label, value, type, style, theme, disabled } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    return (
      <View style={[styles.rowBtn, style, { opacity: disabled ? 0.4 : 1 }]}>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.5}
          disabled={disabled || type === 'switch'}
          onPress={this.handlePress}
        >
          <TYText style={styles.label}>{label}</TYText>
          {type === 'switch' ? (
            <SwitchButton
              value={value as boolean}
              disabled={disabled}
              onValueChange={this.handleChangeSwitch}
            />
          ) : (
            <TYText style={styles.value}>{value}</TYText>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowBtn: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  btn: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: cx(20),
  },
  label: {
    flex: 1,
    fontSize: 16,
    opacity: 0.9,
  },
  value: {
    flex: 1,
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
  },
});
