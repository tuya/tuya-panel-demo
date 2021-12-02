import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, IconFont, Utils } from 'tuya-panel-kit';

const { convertY: cy, convertX: cx } = Utils.RatioUtils;
const checkIconPath =
  'M288.67 374.37l18.69 25.26a5.217 5.217 0 0 0 7.29 1.09c0.02-0.01 0.04-0.03 0.06-0.04l113.01-86.01a5.216 5.216 0 0 1 6.48 0.13l275.9 228.25a5.22 5.22 0 0 0 6.97-0.29l17.32-16.98a5.212 5.212 0 0 0 0.07-7.37l-0.08-0.08-299.65-292.84a5.221 5.221 0 0 0-7.37 0.08l-0.01 0.01-138.22 142.06a5.206 5.206 0 0 0-0.46 6.73z';

interface IProps {
  onPress?: (params: any) => void;
  title: string;
  subTitle?: string;
  value: string | number | boolean;
  arrowColor?: string;
  showArrow?: boolean;
  activeOpacity?: number;
  arrowName?: string;
}

export default class Row extends PureComponent<IProps> {
  render() {
    const {
      onPress,
      title,
      subTitle,
      value,
      arrowColor = '#d5d5d5',
      activeOpacity = 0.7,
      showArrow = true,
      arrowName,
    } = this.props;
    return (
      <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} style={styles.row}>
        <View style={styles.inner}>
          <View style={styles.titleCon}>
            <TYText style={styles.title}>{title}</TYText>
            {subTitle && <TYText style={styles.subtitle}>{subTitle}</TYText>}
          </View>
          <View style={styles.right}>
            <TYText style={styles.text}>{value}</TYText>
            {showArrow && <IconFont name="arrow" size={12} color={arrowColor} />}
            {arrowName === 'tick' ? (
              <IconFont
                style={[!value && { opacity: 0 }]}
                d={checkIconPath}
                color="#44DB5E"
                size={32}
                useART={true}
              />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#fff',
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: cx(16),
    paddingRight: cx(16),
    paddingVertical: cx(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DBDBDB',
  },

  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  titleCon: {
    flexDirection: 'column',
  },
  title: {
    fontSize: cx(16),
  },
  subtitle: {
    fontSize: cx(12),
    color: 'rgb(173,173,173)',
    marginTop: cx(5),
  },
  text: {
    fontSize: 14,
    opacity: 0.7,
  },
});
