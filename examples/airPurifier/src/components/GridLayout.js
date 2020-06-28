import _chunk from 'lodash/chunk';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';

export default class GridLayout extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    rowNum: PropTypes.number,
    style: ViewPropTypes.style,
    rowStyle: ViewPropTypes.style,
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    style: null,
    rowNum: 1,
    rowStyle: null,
  };

  /**
   * @param {Number} num - 每一行的Grid数量
   */
  renderGridRow(allData, num) {
    const { rowStyle, children } = this.props;
    return _chunk(allData, num).map((grids, rowIndex) => (
      <View
        key={rowIndex} // eslint-disable-line react/no-array-index-key
        style={[styles.row, rowStyle]}
      >
        {grids.map((data, i) => {
          const index = i + rowIndex * num;
          const key = data.key || index;
          return children(Object.assign(data, { key, index, rowIndex }), allData);
        })}
      </View>
    ));
  }

  render() {
    const { style, data, rowNum } = this.props;
    const num = Math.ceil(data.length / rowNum);
    return <View style={style}>{this.renderGridRow(data, num)}</View>;
  }
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
