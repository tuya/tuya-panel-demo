import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText, IconFont, Dialog } from 'tuya-panel-kit';
import PopBody from './PopBody';

const { convertY: cy, convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProp {
  value: string;
  dataSource: { icon: string; label: string; value: string }[];
  title: string;
  theme?: any;
  disabled: boolean;
  style?: any;
  onChange: (value: string) => void;
}

@withTheme
export default class ModeBox extends PureComponent<IProp> {
  handleShow = (hsv: IColour) => {
    const { value, title, dataSource, theme, onChange } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    Dialog.custom(
      {
        style: { width: cx(310), backgroundColor: 'transparent' },
        title: title,
        titleStyle: { color: '#fff', fontSize: 24 },
        headerStyle: { marginBottom: 30, borderBottomWidth: 0 },
        footer: () => null,
        content: (
          <PopBody
            value={value}
            dataSource={dataSource}
            onChange={v => {
              Dialog.close();
              onChange(v);
            }}
          />
        ),
      },
      {
        onMaskPress: () => {
          Dialog.close();
        },
      }
    );
  };
  render() {
    const { title, value, dataSource, theme, disabled, style } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    const exist = dataSource.find(({ value: x }) => x === value) || { icon: '', label: '' };
    return (
      <View style={[styles.box, style]}>
        <TouchableOpacity disabled={disabled} onPress={this.handleShow} activeOpacity={0.5}>
          <TYText style={styles.title}>{title}</TYText>
          <IconFont d={exist.icon} size={40} color={themeColor} />
          <TYText style={[styles.value, { color: themeColor }]}>{exist.label}</TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: {
    width: cx(155),
    borderRadius: cx(20),
    backgroundColor: '#fff',
    paddingHorizontal: cx(16),
    paddingVertical: cx(28),
  },
  title: {
    fontSize: 14,
    marginBottom: 16,
  },
  value: {
    marginTop: 30,
    fontSize: 18,
  },
});
