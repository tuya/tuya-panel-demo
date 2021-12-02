/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Utils, UnitText, TYSdk } from 'tuya-panel-kit';
import i18n from '@i18n';
import Res from '../../res';
import { RecordInstance } from '../../recordDataCollection';

const { convertY: cy, convertX: cx, width } = Utils.RatioUtils;

interface IProps {
  cleanTimeTitle: string;
  cleanTimeUnit: string;
  cleanAreaTitle: string;
  cleanAreaUnit: string;
  item: any;
  index: number;
  onDelete: () => void;
  onPress: () => void;
  mapRouteId: string;
  is24Hour: boolean;
  navigation: {
    navigate: (route: string, params) => void;
  };
}

export default class ItemCell extends Component<IProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    index: 0,
    cleanTimeTitle: i18n.getLang('recordTime'),
    cleanTimeUnit: i18n.getLang('recordTimeUnit'),
    cleanAreaTitle: i18n.getLang('recordArea'),
    cleanAreaUnit: i18n.getLang('recordAreaUnit'),
    mapRouteId: 'mapHistory',
    onDelete: () => { },
    onPress: () => { },
  };

  handleRowClick = ({
    title,
    cleanTime,
    cleanArea,
    bucket,
    file,
    mapLen,
    pathLen,
    virtualLen,
  }: any) => () => {
    const {
      mapRouteId,
      cleanTimeTitle,
      cleanAreaTitle,
      cleanTimeUnit,
      cleanAreaUnit,
      navigation,
    } = this.props;
    navigation.navigate(mapRouteId, {
      title,
      cleanTime,
      cleanArea,
      cleanTimeTitle,
      cleanAreaTitle,
      cleanTimeUnit,
      cleanAreaUnit,
      bucket,
      history: {
        file,
        mapLen,
        pathLen,
        virtualLen,
      },
    });
  };

  renderRowItem(value, title, unit) {
    return (
      <Text style={styles.listItemTips}>
        {title}
        <Text style={styles.listItemValue}>{`${value}${unit}`}</Text>
      </Text>
    );
  }

  render() {
    const {
      item,
      index,
      onPress,
      is24Hour,
      cleanTimeTitle,
      cleanAreaTitle,
      cleanAreaUnit,
      cleanTimeUnit,
    } = this.props;
    const parseItem = RecordInstance.instance.parseOneRecord(item);

    const {
      bucket,
      extend,
      file,
      id,
      cleanArea,
      cleanTime,
      mapLen,
      pathLen,
      time12,
      time12Unit,
      time24,
      dateTitle,
      dateTitle24,
      virtualLen,
    } = parseItem;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={this.handleRowClick({
          cleanTime,
          cleanArea,
          bucket,
          file,
          title: is24Hour ? dateTitle24 : dateTitle,
          mapLen,
          pathLen,
          virtualLen,
        })}
      >
        <View>
          <View style={styles.listItemBottom}>
            <UnitText valueSize={cx(24)} valueColor="#4D4D4D" value={is24Hour ? time24 : time12} />
            {!is24Hour && <Text style={styles.textHour12}>{time12Unit}</Text>}
          </View>
          <View style={styles.listItemBottom}>
            {this.renderRowItem(cleanTime, cleanTimeTitle, cleanTimeUnit)}
            {this.renderRowItem(cleanArea, cleanAreaTitle, cleanAreaUnit)}
          </View>
        </View>
        <Image source={Res.arrow} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    height: cy(88),
    paddingHorizontal: cx(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  listItemBottom: {
    marginTop: cy(13),
    flexDirection: 'row',
  },

  listItemTips: {
    color: '#4D4D4D',
    fontSize: cx(12),
    marginRight: cx(10),
  },

  listItemValue: {
    color: '#4D4D4D',
    fontSize: cx(12),
  },

  textHour12: {
    color: '#4D4D4D',
    fontSize: cx(20),
    fontWeight: 'bold',
  },
});
