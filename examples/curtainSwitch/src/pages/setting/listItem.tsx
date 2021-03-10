import React, { PureComponent } from 'react';
import colors from 'color';
import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import _parseInt from 'lodash/parseInt';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText, IconFont, SwitchButton } from 'tuya-panel-kit';
import { ACTIVEOPACITY } from '../../utils';

const { convertX: cx } = Utils.RatioUtils;

interface ListItemProps {
  keyIndex: string;
  themeColor: string;
  value: string | number;
  title: string;
  arrow: boolean;
  valueTxt: string;
  onPress: any;
  disable: boolean;
}

export default class ListItem extends PureComponent<ListItemProps> {
  render() {
    const { keyIndex, themeColor, value, title, arrow, valueTxt, onPress, disable } = this.props;
    return (
      <TouchableOpacity
        activeOpacity={ACTIVEOPACITY}
        key={keyIndex}
        style={[styles.itemContent, { opacity: disable ? 0.5 : 1 }]}
        disabled={disable}
        onPress={onPress}
      >
        <View style={styles.rightTxt}>
          <TYText style={styles.title} numberOfLines={2}>
            {title}
          </TYText>
        </View>
        {arrow ? (
          <View style={styles.right}>
            <TYText style={styles.value} numberOfLines={2}>
              {valueTxt}
            </TYText>
            <IconFont name="arrow" color="#C8C8C8" size={cx(12)} />
          </View>
        ) : (
          <SwitchButton
            disabled={disable}
            value={Boolean(value)}
            onTintColor={disable ? colors(themeColor).alpha(0.5).rgbString() : themeColor}
            onValueChange={onPress}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  itemContent: {
    height: 48,
    width: cx(360),
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: cx(16),
  },
  title: {
    backgroundColor: 'transparent',
    color: '#333333',
    fontSize: cx(16),
    maxWidth: cx(150),
    marginRight: cx(3),
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: cx(14),
    backgroundColor: 'transparent',
    color: 'rgba(51,51,51,.5)',
    marginRight: cx(6),
    maxWidth: cx(150),
  },
  rightTxt: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
