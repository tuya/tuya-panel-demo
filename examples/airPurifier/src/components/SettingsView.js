import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import SwitchButton from './SwitchButton';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const Res = {
  arrow: require('../res/arrow.png'),
};

export default class SettingsView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    titleStyle: Text.propTypes.style,
    subTitleStyle: Text.propTypes.style,
    rowStyle: ViewPropTypes.style,
    arrow: PropTypes.number, // eslint-disable-line

    /* data 格式
      [{
       style: [Object], // item row style
       title: [string],
       icon: [number],
       value: [bool, string],
       subTitle: [string],
       hint: [string],
       onPress: [func]
      }, {
      }]
    */
    data: PropTypes.array.isRequired,
    renderItem: PropTypes.func,
  };

  static defaultProps = {
    style: null,
    titleStyle: null,
    subTitleStyle: null,
    rowStyle: null,
    renderItem: null,
  };

  onItemClicked(d) {
    if (d.onPress) d.onPress();
  }

  _renderBoolValue(item) {
    const { rowStyle } = this.props;
    return (
      <View style={[styles.row, rowStyle, item.style]}>
        {this._renderRowInfo(item)}
        <SwitchButton
          accessibilityLabel={item.accessibilityLabel}
          value={item.value}
          onValueChange={item.onPress}
          onTintColor="#44DB5E"
          onThumbTintColor="#fff"
        />
      </View>
    );
  }

  _renderStringValue(item) {
    const { rowStyle, subTitleStyle, arrow } = this.props;
    let string = item.hint;
    if (!string) {
      if (typeof item.value === 'string') {
        string = item.value;
      } else if (typeof item.value === 'number') {
        string = item.value.toString();
      }
    }

    return (
      <TouchableOpacity
        accessibilityLabel={item.accessibilityLabel}
        activeOpacity={0.98}
        onPress={() => this.onItemClicked(item)}
      >
        <View style={[styles.row, rowStyle, item.style]}>
          {this._renderRowInfo(item)}
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <TYText style={[styles.valueStyle, item.subTitleStyle, subTitleStyle]}>{string}</TYText>
            {item.onPress && <Image style={styles.arrow} source={arrow || Res.arrow} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  _renderRowInfo(item) {
    const { titleStyle } = this.props;
    return (
      <View style={styles.info}>
        {item.icon && <Image source={item.icon} />}
        {item.iconView && item.iconView}
        <View style={styles.titleContainer}>
          <TYText style={[styles.title, titleStyle]}>{item.title}</TYText>
          {!!item.subTitle && <TYText style={[styles.subTitle]}>{item.subTitle}</TYText>}
        </View>
      </View>
    );
  }

  _renderItem = ({ item, index }) => {
    if (typeof item.value === 'boolean') {
      return this._renderBoolValue(item, index);
    }
    return this._renderStringValue(item, index);
  };

  render() {
    const { style, data, renderItem } = this.props;
    return (
      <FlatList
        contentContainerStyle={[styles.container, style]}
        data={data}
        keyExtractor={(item, index) => index}
        renderItem={renderItem || this._renderItem}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  row: {
    height: cy(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: cx(15),
    paddingRight: cx(15),
    paddingTop: cx(9),
    paddingBottom: cx(9),
    backgroundColor: '#fff',
  },

  arrow: {
    marginLeft: 5,
  },

  titleContainer: {
    marginLeft: 4,
  },

  title: {
    fontSize: cx(18),
    color: '#303030',
  },

  subTitle: {
    marginTop: 4,
    fontSize: 10,
    color: '#999',
  },

  valueStyle: {
    fontSize: cx(18),
    color: '#9B9B9B',
    alignItems: 'center',
  },
});
