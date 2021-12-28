import React, { FC } from 'react';
import _ from 'lodash';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { IChooseDpItem } from '@interface';

const { convertX } = Utils.RatioUtils;

interface IButtonListProps {
  choiceItem: IChooseDpItem;
  data?: any;
  color?: string;
  valueChange?: (item: IChooseDpItem) => void;
}

const ButtonList: FC<IButtonListProps> = ({ data, color, valueChange, choiceItem }) => {
  const click = item => {
    const newChoiceItem = _.cloneDeep(choiceItem);
    newChoiceItem.chosenDpInfo = item;
    valueChange && valueChange(newChoiceItem);
  };

  return (
    <View style={styles.center}>
      {data.valueRangeJson.map((item, index) => (
        <TouchableOpacity key={item} onPress={() => click(item)}>
          <View
            style={[
              styles.button,
              item[0] === choiceItem.chosenDpInfo[0] ? { backgroundColor: color } : {},
            ]}
          >
            <TYText style={styles.text}>{item[1]}</TYText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
ButtonList.defaultProps = {
  data: {},
  color: 'pink',
  valueChange: () => ({}),
};

const styles = StyleSheet.create({
  button: {
    height: convertX(36),
    paddingHorizontal: convertX(10),
    alignSelf: 'flex-start',
    borderRadius: convertX(18),
    backgroundColor: '#DEDEE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: convertX(15),
    marginRight: convertX(10),
  },
  text: {
    fontSize: convertX(13),
    color: '#fff',
  },
  center: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ButtonList;
