import _chunk from 'lodash/chunk';
import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';

interface GridLayoutProps {
  children: (data: any[]) => React.ReactElement;
  data: { code: any }[];
  rowNum: number;
}

const GridLayout: FC<GridLayoutProps> = ({ children, data, rowNum }) => {
  const num = Math.ceil(data.length / rowNum);

  /**
   * @param {Number} num - 每一行的Grid数量
   */
  const renderGridRow = (allData, n) => {
    return _chunk(allData, n).map((grids, rowIndex) => (
      <View
        key={rowIndex} // eslint-disable-line react/no-array-index-key
        style={[styles.row, styles.gridRow]}
      >
        {grids.map((d, i) => {
          return children(d);
        })}
      </View>
    ));
  };

  return <View style={styles.gridLayout}>{renderGridRow(data, num)}</View>;
};

export default GridLayout;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  gridRow: {
    flex: 0,
  },
  gridLayout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
