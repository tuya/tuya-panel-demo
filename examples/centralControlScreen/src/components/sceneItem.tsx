import React, { FC } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { TYText, IconFont, Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

interface ISceneItemProps {
  name: string;
  displayColor: string;
  isSelect?: boolean;
  background?: string;
  coverIcon?: string;
  tintColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const SceneItem: FC<ISceneItemProps> = ({
  displayColor,
  name,
  style,
  isSelect,
  background,
  coverIcon,
  tintColor,
  onPress,
  onLongPress,
}) => {
  return (
    <View style={[styles.item, { backgroundColor: `#${displayColor}` }, style]}>
      {!!background && <Image source={{ uri: background }} style={[styles.absolute]} />}
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={1}
        onLongPress={onLongPress}
      >
        <View style={styles.row}>
          {!!coverIcon && (
            <Image source={{ uri: coverIcon }} style={[styles.icon, { tintColor }]} />
          )}
          <TYText style={[styles.name, { width: cx(220) }]} numberOfLines={1}>
            {name}
          </TYText>
        </View>
        {isSelect !== undefined && (
          <IconFont
            name={isSelect ? 'correct' : 'unselected'}
            color={isSelect ? '#C5D013' : 'rgba(255,255,255,0.5)'}
            size={cx(20)}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

SceneItem.defaultProps = {
  style: {},
  isSelect: undefined,
  background: '',
  coverIcon: '',
  tintColor: '#FFF',
  onPress: () => ({}),
  onLongPress: () => ({}),
};

const styles = StyleSheet.create({
  item: {
    width: cx(343),
    height: cx(74),
    borderRadius: cx(12),
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: cx(18),
  },
  name: {
    color: '#FFF',
    fontSize: 16,
  },
  icon: {
    marginRight: cx(18),
    width: cx(22),
    height: cx(22),
  },
});

export default SceneItem;
