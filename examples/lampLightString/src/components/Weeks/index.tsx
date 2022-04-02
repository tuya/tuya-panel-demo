import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
// eslint-disable-next-line import/no-unresolved
import Strings from '@i18n';

const {
  ThemeUtils: { withTheme },
  RatioUtils: { convertX: cx },
} = Utils;
const weekData = [...new Array(7).keys()].map(i => ({
  key: i,
  name: Strings.getLang(`week${i}` as any),
}));

interface Props {
  theme?: any;
  weeks: number[];
  disabled?: boolean;
  onChange?: (weeks: number[]) => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

class Weeks extends React.Component<Props> {
  handleClick = (index: any) => () => {
    const { weeks, onChange } = this.props;
    const newWeeks = [...weeks];
    newWeeks[index] = newWeeks[index] ? 0 : 1;
    if (typeof onChange === 'function') {
      onChange(newWeeks);
    }
  };

  render() {
    const { weeks, disabled, theme, style, accessibilityLabel } = this.props;
    const { brand: themeColor, isDefaultTheme } = theme.global || {};
    const {
      item: itemStyle,
      active: activeStyle,
      text: textStyle,
      activeText: activeTextStyle,
    } = theme.weeks || {};
    return (
      <View style={[styles.weeks, style]} accessibilityLabel={accessibilityLabel}>
        {weekData.map(({ key, name }) => {
          const isActive = !!weeks[key];
          return (
            <TouchableOpacity
              disabled={disabled}
              accessibilityLabel={`week_button${key}`}
              key={key}
              onPress={this.handleClick(key)}
            >
              <View
                style={[
                  styles.week,
                  {
                    backgroundColor: isDefaultTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  },
                  itemStyle,
                  isActive && {
                    backgroundColor: themeColor,
                  },
                  isActive && activeStyle,
                ]}
              >
                <TYText
                  style={[
                    styles.weekName,
                    textStyle,
                    isActive && activeTextStyle,
                    isActive && {
                      color: '#fff',
                    },
                  ]}
                >
                  {name}
                </TYText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

export default withTheme(Weeks);

const styles = StyleSheet.create({
  weeks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  week: {
    width: cx(40),
    height: cx(40),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekName: {
    fontSize: cx(12),
  },
});
