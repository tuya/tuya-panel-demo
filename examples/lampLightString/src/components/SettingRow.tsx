/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { IconFont, TYText, Utils, SwitchButton } from 'tuya-panel-kit';
import color from 'color';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface SettingRowProps {
  theme?: any;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  rightType: 'switch' | 'arrow';
  title: string;
  subTitle?: string;
  icon?: any;
  iconColor?: string;
  arrowIconColor?: string;
  valueText?: string;
  value?: any;
  valueTextStyle?: StyleProp<TextStyle>;
  onPress?: (args?: any) => void;
  onPressRight?: (args?: any) => void;
  onSwitchChange?: (value: any) => void;
}

class SettingRow extends React.Component<SettingRowProps, any> {
  renderRight = () => {
    const { theme, valueText, onPressRight, arrowIconColor, valueTextStyle } = this.props;
    const {
      global: { fontColor },
    } = theme;
    if (onPressRight) {
      return (
        <TouchableOpacity style={styles.rowValue} activeOpacity={0.8} onPress={onPressRight}>
          <TYText
            style={[
              styles.rowValueText,
              {
                // @ts-ignore
                color: color(fontColor).alpha(0.4).rgbString(),
              },
              valueTextStyle,
            ]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {valueText}
          </TYText>
          <IconFont
            name="arrow"
            size={cx(8)}
            color={arrowIconColor || '#fff'}
            style={{ marginLeft: cx(8) }}
          />
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.rowValue}>
        <TYText
          style={[
            styles.rowValueText,
            {
              color: color(fontColor).alpha(0.4).rgbString(),
            },
            valueTextStyle,
          ]}
        >
          {valueText}
        </TYText>
        <IconFont
          name="arrow"
          size={cx(8)}
          color={arrowIconColor || '#fff'}
          style={{ marginLeft: cx(8) }}
        />
      </View>
    );
  };

  render() {
    const {
      theme,
      style,
      contentStyle,
      rightType,
      icon,
      iconColor,
      title,
      subTitle,
      value,
      onPress,
      onSwitchChange = (v: any) => {},
    } = this.props;
    const {
      global: { fontColor },
    } = theme;
    return (
      <TouchableOpacity
        style={[styles.row, style]}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress || (() => {})}
      >
        <View style={[styles.rowContent, contentStyle]}>
          <View style={styles.rowRight}>
            {!!icon && (
              <View style={styles.rowLabel}>
                {icon && (
                  <Image
                    style={[styles.mainIcon, { tintColor: iconColor }]}
                    source={icon}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
            <View style={{ justifyContent: 'center' }}>
              <TYText style={[styles.titleText, { color: fontColor }]}>{title}</TYText>
              {subTitle && (
                <TYText
                  style={[
                    styles.subTitleText,
                    {
                      color: color(fontColor).alpha(0.4).rgbString(),
                    },
                  ]}
                >
                  {subTitle}
                </TYText>
              )}
            </View>
          </View>
          {rightType === 'arrow' && this.renderRight()}
          {rightType === 'switch' && <SwitchButton value={value} onValueChange={onSwitchChange} />}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    paddingHorizontal: cx(16),
  },

  rowContent: {
    minHeight: cx(70),
    paddingVertical: cx(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
  },

  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: cx(240),
  },

  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: cx(8),
  },

  rowValue: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  rowValueText: {
    fontSize: cx(14),
  },

  titleText: {
    fontSize: cx(14),
  },

  subTitleText: {
    fontSize: cx(12),
    marginTop: cx(4),
  },

  mainIcon: {
    width: cx(24),
    height: cx(24),
    marginLeft: cx(8),
  },
});

export default withTheme(SettingRow);
