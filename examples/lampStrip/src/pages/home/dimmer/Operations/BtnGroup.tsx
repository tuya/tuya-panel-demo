/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Utils, Button, useTheme } from 'tuya-panel-kit';
import { useControllableValue } from 'ahooks';

const { convertX: cx } = Utils.RatioUtils;

export interface BtnItemType {
  value?: string;
  icon?: string;
  image?: string;
  activedImage?: string;
  hidden?: boolean;
  disabled?: boolean;
}

export interface OperationsBtnGroupProps {
  style?: StyleProp<ViewStyle>;
  dataSource: BtnItemType[];
  value?: string;
  onChange?: (v: string) => void;
}

const OperationsBtnGroup: React.FC<OperationsBtnGroupProps> = props => {
  const { style, dataSource = [] } = props;

  const { themeColor, boxBgColor, fontColor }: any = useTheme();

  const [value, setValue] = useControllableValue(props);

  return dataSource.length ? (
    <View style={[styles.container, { backgroundColor: boxBgColor }, style]}>
      {dataSource.map((item, index, arr) => {
        const activated = item.value === value;
        const color = activated ? themeColor : fontColor;
        return (
          <Button
            key={item.value}
            style={[arr.length > 1 && { marginLeft: cx(index === 0 ? 8 : 16) }]}
            iconPath={item.icon}
            iconColor={color}
            iconSize={cx(30)}
            image={item.activedImage && activated ? item.activedImage : item.image}
            imageColor={item.activedImage ? undefined : color}
            disabled={item.disabled}
            onPress={() => setValue(item.value)}
          />
        );
      })}
    </View>
  ) : null;
};
const niFn = () => null;
OperationsBtnGroup.defaultProps = {
  style: {},
  value: '',
  onChange: niFn,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: cx(12),
    paddingHorizontal: cx(8),
    paddingVertical: cx(4),
  },
});

export default OperationsBtnGroup;
