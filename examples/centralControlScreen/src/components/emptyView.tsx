import React, { FC } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { theme } from '@config';

const { convertX: cx } = Utils.RatioUtils;

interface IEmptyProps {
  text: string;
  addText: string;
  hideAddBtn?: boolean;
  icon: ImageSourcePropType;
  btnStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

const EmptyView: FC<IEmptyProps> = ({
  style,
  icon,
  text,
  onPress,
  addText,
  btnStyle,
  hideAddBtn,
  iconStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.emptyMain}>
        <View style={styles.empty}>
          {!!icon && <Image source={icon} style={[styles.icon, iconStyle]} />}
          <TYText text={text} style={styles.textStyle} />
        </View>
      </View>
      {!hideAddBtn && (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={onPress ? 1 : 0.7}
          style={[styles.btn, btnStyle]}
        >
          <TYText text={addText} style={styles.btnText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

EmptyView.defaultProps = {
  hideAddBtn: false,
  btnStyle: {},
  style: {},
  iconStyle: {},
  onPress: () => ({}),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: cx(24),
  },
  emptyMain: {
    flex: 1,
    paddingBottom: cx(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  btn: {
    width: cx(327),
    height: cx(48),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.themeColor,
    borderRadius: cx(24),
  },
  btnText: {
    fontSize: cx(16),
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: '#FFF',
  },

  icon: {
    width: cx(100),
    height: cx(100),
    marginBottom: cx(24),
  },

  textStyle: {
    fontSize: cx(14),
    backgroundColor: 'transparent',
    color: '#A2A3AA',
    textAlign: 'center',
    lineHeight: cx(24),
  },
});

export default EmptyView;
