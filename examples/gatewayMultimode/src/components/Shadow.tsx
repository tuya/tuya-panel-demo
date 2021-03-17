import React, { FC } from 'react';
import { View, Platform } from 'react-native';
import { BoxShadow } from 'react-native-shadow';

interface ShadowProps {
  children?: React.ReactElement;
  shadowStyle: any;
}

const Shadow: FC<ShadowProps> = ({ children, shadowStyle }) => {
  const __getAndroidShadowSetting = () => {
    const {
      width,
      height,
      shadowColor,
      shadowOffset,
      shadowRadius,
      shadowOpacity,
      borderRadius,
    } = shadowStyle;
    return {
      width,
      height,
      color: shadowColor,
      border: shadowRadius,
      x: shadowOffset.width,
      y: shadowOffset.height,
      opacity: shadowOpacity,
      radius: borderRadius,
    };
  };
  const __getAndroidShadowStyle = () => {
    const {
      margin,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      marginVertical,
      marginHorizontal,
      padding,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      paddingVertical,
      paddingHorizontal,
    } = shadowStyle;
    return {
      margin,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      marginVertical,
      marginHorizontal,
      padding,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      paddingVertical,
      paddingHorizontal,
    };
  };
  const __getAndroidViewStyle = () => {
    const {
      margin,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      marginVertical,
      marginHorizontal,
      padding,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      paddingVertical,
      paddingHorizontal,
      width,
      height,
      shadowColor,
      shadowOffset,
      shadowRadius,
      shadowOpacity,
      ...rest
    } = shadowStyle;
    return {
      ...rest,
      width,
      height,
    };
  };
  return Platform.OS === 'ios' ? (
    <View style={[shadowStyle]}>{children || null}</View>
  ) : (
    <BoxShadow
      setting={{
        ...__getAndroidShadowSetting(),
        style: __getAndroidShadowStyle(),
      }}
    >
      <View style={[__getAndroidViewStyle()]}>{children || null}</View>
    </BoxShadow>
  );
};
export default Shadow;
