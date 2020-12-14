import _ from 'lodash';
import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { DpSchema, TYFlatList } from 'tuya-panel-kit';
import { useSelector } from '@models';
import DpItemView from './dpItemView';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const ContentLayout: React.FC<Props> = props => {
  const { style } = props;

  const dpState = useSelector(state => state.dpState);
  const dpSchema = useSelector(state => state.devInfo.schema);

  if (_.isEmpty(dpState)) {
    return null;
  }

  const renderItem = ({ item }: { item: DpSchema }) => {
    return (
      <DpItemView
        style={styles.item}
        key={item.code}
        dpState={dpState[item.code]}
        dpSchema={item}
      />
    );
  };

  return (
    <TYFlatList<DpSchema>
      style={style}
      data={Object.values(dpSchema)}
      renderItem={({ item }) => renderItem({ item })}
      keyExtractor={item => item.code}
    />
  );
};

ContentLayout.defaultProps = {
  style: null,
};

const styles = StyleSheet.create({
  item: {
    marginVertical: 5,
  },
});

export default ContentLayout;
