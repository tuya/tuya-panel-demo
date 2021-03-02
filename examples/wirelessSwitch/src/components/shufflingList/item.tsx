import React from 'react';
import _ from 'lodash';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

interface ItemProps {
  themeColor?: string;
  marginRight: number;
  itemWidth: number;
  idx: number;
  selectIndex: number;
  numberOfLines?: number;
  itemStyles?: { [key: string]: number | string };
  isDefaultTheme: boolean;
  switchChange: (val: number) => void;
  item: { [key: string]: string };
}

const Item: React.FC<ItemProps> = datas => {
  const {
    item,
    isDefaultTheme,
    idx,
    selectIndex,
    themeColor,
    itemWidth,
    marginRight,
    switchChange,
    numberOfLines,
    itemStyles,
  } = datas;
  const style = [itemStyle.container, itemStyles];
  const isSelected = selectIndex === idx;
  const { key, title } = item;
  const notSelect = isDefaultTheme ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)';
  return (
    <TouchableOpacity
      key={key}
      style={[
        style,
        {
          height: cx(22),
          width: itemWidth,
        },
      ]}
      onPress={() => switchChange(idx)}
    >
      <TYText
        style={[
          itemStyle.title,
          {
            width: itemWidth - marginRight,
            color: isSelected ? themeColor : notSelect,
          },
          isSelected && {
            fontWeight: 'bold',
          },
        ]}
        numberOfLines={numberOfLines}
      >
        {title}
      </TYText>
    </TouchableOpacity>
  );
};

const itemStyle = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    color: 'rgba(0,0,0,.5)',
    fontSize: cx(16),
    backgroundColor: 'transparent',
  },
});

export default Item;
