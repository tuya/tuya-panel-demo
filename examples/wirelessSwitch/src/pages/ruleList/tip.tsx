import React, { PureComponent } from 'react';
import _ from 'lodash';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import Icon from '../../icons';

const { convertX: cx } = Utils.RatioUtils;
interface TipProps {
  image: any;
  devName: string;
  actionDisplay: any;
  themeColor: string;
}

export default class Tip extends PureComponent<TipProps> {
  render() {
    const { image, devName, actionDisplay, themeColor } = this.props;
    return (
      <TouchableOpacity activeOpacity={1} style={styles.successItem}>
        <View style={styles.successLeft}>
          <Image source={image} style={styles.imageStyle} resizeMode="contain" />
          <View style={styles.nameTxt}>
            <TYText style={styles.devName} numberOfLines={2}>
              {devName}
            </TYText>
            <TYText style={styles.actionDisplayTxt} numberOfLines={2}>
              {actionDisplay}
            </TYText>
          </View>
        </View>
        <View style={styles.bingo}>
          <IconFont d={Icon.select} color={themeColor} size={cx(10)} />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  successItem: {
    width: '100%',
    minHeight: cx(72),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  nameTxt: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actionDisplayTxt: {
    backgroundColor: 'transparent',
    color: '#81828B',
    fontSize: cx(13),
    maxWidth: cx(166),
  },
  devName: {
    color: '#22242C',
    backgroundColor: 'transparent',
    fontSize: cx(15),
    maxWidth: cx(166),
  },
  bingo: {
    width: cx(20),
    height: cx(20),
    marginRight: cx(20),
  },
  imageStyle: {
    width: cx(56),
    height: cx(56),
  },
});
