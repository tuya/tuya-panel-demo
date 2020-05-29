import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Dimensions, Text, FlatList, View, Image } from 'react-native';
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

  _renderItem = ({ item, index }) => {
    const { dishes_step_desc, dishes_step_image, picture, stepsdsc } = item;
    const { data } = this.props;
    const img = dishes_step_image || picture;
    const len = data.length;
    const step = `${index + 1}/${len}`;
    return (
      <View style={styles.itemContainer}>
        {img && <Image style={styles.materialImg} source={{ uri: img }} />}
        <Text style={styles.name}>{step}</Text>
        <Text style={[styles.name, step && { marginTop: cy(8) }]}>
          {dishes_step_desc || stepsdsc}
        </Text>
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
    width: width - cx(32),
    justifyContent: 'space-between',
    marginTop: cy(8),
  },

  name: {
    fontSize: cx(15),
    color: '#666',
  },

  materialImg: {
    height: cy(220),
    width: width - cx(32),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});
