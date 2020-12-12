import { Utils, Divider } from 'tuya-panel-kit';
import React, { Children, cloneElement, SFC } from 'react';
import { View, StyleSheet } from 'react-native';

const { withTheme } = Utils.ThemeUtils;

interface Props {
  theme?: any;
  style?: any;
}

const Group: SFC<Props> = ({ theme, style, children }) => {
  const list = Children.toArray(children) || [];
  return (
    <View style={[styles.group, style]}>
      {list.map((child, index) => {
        const isMore = index > 0;
        return (
          <View key={index}>
            {isMore && <Divider />}
            {cloneElement(child, { ...child.props, style: styles.child })}
          </View>
        );
      })}
    </View>
  );
};
export default withTheme(Group);

const styles = StyleSheet.create({
  group: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  child: { borderRadius: 0 },
});
