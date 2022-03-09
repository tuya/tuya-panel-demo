/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, Button } from 'tuya-panel-kit';
import useTheme from '../../../../hooks/useTheme';

const { convertX: cx } = Utils.RatioUtils;
interface Props {
  onPress: () => void;
  nums: number;
}
const NumsBtn: React.FC<Props> = ({ onPress, nums }) => {
  const {
    global: { isDefaultTheme, themeColor },
  } = useTheme();

  const [lampNums, setLampNums] = useState(nums);
  useEffect(() => {
    setLampNums(nums);
  }, [nums]);

  return (
    <View
      style={[
        styles.main,
        {
          backgroundColor: isDefaultTheme ? 'rgba(40,49,65,1)' : 'rgba(255,255,255,1)',
        },
      ]}
    >
      <Button
        text={`${lampNums}`}
        style={styles.style}
        iconColor="#fff"
        textStyle={[styles.text, { color: themeColor }]}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    marginLeft: cx(8),
    borderRadius: cx(12),
  },
  style: {
    width: cx(38),
    height: cx(38),
  },
  text: {
    fontSize: cx(16),
    fontWeight: 'bold',
  },
});

export default NumsBtn;
