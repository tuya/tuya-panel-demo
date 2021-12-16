import React, { FC } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { TYText, IconFont, Utils } from 'tuya-panel-kit';
import { theme } from '@config';

const { convertX: cx } = Utils.RatioUtils;

const WIDTH = cx(343);
const HEIGHT = cx(92);

interface IDeviceItemProps {
  name: string;
  roomName?: string;
  isSelect?: boolean;
  iconUrl?: string;
  tintColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const DeviceItem: FC<IDeviceItemProps> = ({
  style,
  isSelect,
  roomName,
  name,
  iconUrl,
  tintColor,
  onPress,
  onLongPress,
}) => {
  return (
    <View style={[styles.item, style]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={1}
        onLongPress={onLongPress}
      >
        <View style={[styles.row, { flex: 1 }]}>
          {!!iconUrl && (
            <Image
              source={{ uri: iconUrl }}
              style={[styles.icon, tintColor ? { tintColor } : {}]}
            />
          )}
          <View style={{ flex: 1 }}>
            <TYText style={styles.name} numberOfLines={1}>
              {name}
            </TYText>
            {!!roomName && <TYText style={styles.text}>{roomName}</TYText>}
          </View>
        </View>
        {isSelect !== undefined && (
          <IconFont
            name={isSelect ? 'correct' : 'unselected'}
            color={isSelect ? theme.themeColor : '#A5A5A5'}
            size={cx(20)}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

DeviceItem.defaultProps = {
  style: {},
  isSelect: undefined,
  iconUrl: '',
  tintColor: '',
  roomName: '',
  onPress: () => ({}),
  onLongPress: () => ({}),
};

const styles = StyleSheet.create({
  item: {
    width: WIDTH,
    height: HEIGHT,
    overflow: 'hidden',
    borderRadius: cx(8),
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: cx(18),
  },
  name: {
    color: '#495054',
    fontSize: 16,
    lineHeight: cx(22),
  },
  text: {
    fontSize: 11,
    color: '#A2A3AA',
    lineHeight: cx(13),
    marginTop: cx(6),
  },
  icon: {
    width: cx(48),
    height: cx(48),
    marginRight: cx(10),
  },
});

export default DeviceItem;
