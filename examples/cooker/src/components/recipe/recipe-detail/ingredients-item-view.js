import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, Text, FlatList, View } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { MagicFlatList } from 'react-native-magic-list';

const { RatioUtils } = Utils;
const { convertX: cx, convertY: cy } = RatioUtils;
const { width } = Dimensions.get('window');

export default class IngredientsItem extends Component {
  // 初始化模拟数据
  static propTypes = {
    data: PropTypes.array,
    ...FlatList.propTypes,
  };

  static defaultProps = {
    data: [],
  };

  _renderItem = ({ item }) => {
    const { material_name, material_weight } = item;
    return (
      <View style={styles.itemContainer}>
        <Text style={[styles.name, { flexBasis: '60%' }]}>{material_name}</Text>
        <Text style={styles.weight}>{material_weight}</Text>
      </View>
    );
  };

  render() {
    const { data, ...listProps } = this.props;
    return (
      <MagicFlatList
        // eslint-disable-next-line no-return-assign
        ref={ref => (this._section = ref)}
        style={styles.container}
        data={data}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={this._renderItem}
        keyExtractor={(item, index) => item + index}
        {...listProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: '#fff',
  },

  contentContainerStyle: {
    paddingHorizontal: cx(16),
  },

  itemContainer: {
    flexDirection: 'row',
    minHeight: cy(44),
    width: width - cx(32),
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: cx(15),
    color: '#666',
  },

  weight: {
    fontSize: cx(15),
    color: '#666',
  },
});
