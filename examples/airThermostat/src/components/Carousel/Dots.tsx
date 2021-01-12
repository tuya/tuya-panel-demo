import React, { SFC } from 'react';
import _ from 'lodash';
import { View, StyleSheet } from 'react-native';

const defaultProps = {
  total: 2,
  current: 0,
};

type IProps = {
  style?: any;
  dotStyle?: any;
  dotActiveStyle?: any;
} & Readonly<typeof defaultProps>;

const Dots: SFC<IProps> = ({ total, current, style, dotActiveStyle, dotStyle }) => {
  return (
    <View style={[styles.dotContainer, style]}>
      {[...new Array(total).keys()].map(i => {
        const active = current % total === i;
        return (
          <View
            key={i}
            style={[styles.dot, dotStyle, active && styles.dotActive, active && dotActiveStyle]}
          />
        );
      })}
    </View>
  );
};

export default Dots;

const styles = StyleSheet.create({
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#313131',
    marginHorizontal: 4,
    marginTop: 8,
  },
  dotActive: {
    backgroundColor: '#fff',
  },
});
