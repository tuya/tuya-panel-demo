import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, Utils, IconFont } from 'tuya-panel-kit';

const { convertX: cx, isIos } = Utils.RatioUtils;

interface IProps {
  tips: string;
  // eslint-disable-next-line react/require-default-props
  onPress?: () => void | undefined;
}

const FindTip = ({ tips = '', onPress }: IProps) => {
  if (tips) {
    return (
      <View style={{ position: 'absolute', top: -50, right: 0 }}>
        <View style={styles.tips}>
          <TYText style={[styles.tipText, isIos && { lineHeight: cx(40) }]}>{tips}</TYText>
          <TouchableOpacity activeOpacity={0.9} onPress={() => onPress && onPress()}>
            <IconFont name="close" size={cx(10)} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.jiao} />
      </View>
    );
  }
  return null;
};

export default FindTip;

const styles = StyleSheet.create({
  tips: {
    height: cx(40),
    borderRadius: cx(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 12,
  },
  tipText: {
    height: cx(40),
    alignItems: 'center',
    color: '#fff',
    fontSize: 14,
    marginRight: cx(16),
    minWidth: cx(112),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  jiao: {
    alignSelf: 'flex-end',
    marginRight: cx(20),
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: 8,
    borderTopColor: '#4A4A4A', // 下箭头颜色
    borderLeftColor: 'transparent', // 右箭头颜色
    borderBottomColor: 'transparent', // 上箭头颜色
    borderRightColor: 'transparent', // 左箭头颜色
  },
});
