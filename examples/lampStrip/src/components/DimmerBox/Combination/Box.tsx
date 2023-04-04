import React, { FC } from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Image } from 'react-native';
import { Utils, useTheme } from 'tuya-panel-kit';
import ColorCircle, { ColorsType } from '@components/ColorCircle';
import Res from '@res';

const { convertX: cx } = Utils.RatioUtils;

export interface CombinationBoxProps {
  style?: StyleProp<ViewStyle>;
  radius: number;
  colors: ColorsType;
  selected?: boolean;
  onPress?: (colors: ColorsType) => void;
}

const CombinationBox: FC<CombinationBoxProps> = ({
  style,
  radius = 0,
  colors = [],
  selected = false,
  onPress,
}) => {
  const { borderWidth = cx(2) } = StyleSheet.flatten(style);
  const width = (radius + borderWidth) * 2;

  const { isDarkTheme }: any = useTheme();

  const handlePress = () => {
    onPress?.(colors);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.container,
        style,
        { width, height: width, borderRadius: width, borderWidth },
        selected && { borderColor: isDarkTheme ? '#fff' : '#E8EDFB' },
      ]}
      onPress={handlePress}
    >
      <ColorCircle radius={radius} colors={colors} />
      {selected && (
        <Image
          width={radius}
          height={radius}
          style={StyleSheet.absoluteFill}
          source={Res.circle_selected}
        />
      )}
    </TouchableOpacity>
  );
};
const niFn = () => null;
CombinationBox.defaultProps = {
  style: {},
  selected: false,
  onPress: niFn,
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
  },
});

export default CombinationBox;
