import React from 'react';
import { View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { IconFont } from 'tuya-panel-kit';

/* eslint-disable no-nested-ternary */
const Button = d => {
  const {
    label,
    icon,
    style,
    iconStyle,
    imageStyle,
    labelStyle,
    iconColor,
    children,
    accessibilityLabel,
    ...props
  } = d;
  const child = children ? <View style={style}>{children}</View> : null;
  const iconProps = {
    fill: iconColor,
    stroke: iconColor,
    ...props,
  };
  const first =
    typeof icon === 'number' || typeof icon === 'object' ? (
      <Image style={[imageStyle, { tintColor: iconColor }]} source={icon} />
    ) : typeof icon === 'string' && icon ? (
      <IconFont useART={true} d={icon} {...iconProps} />
    ) : (
      undefined
    );

  const second = label && (
    <Text style={labelStyle} numberOfLines={1}>
      {label}
    </Text>
  );

  return (
    <TouchableWithoutFeedback accessibilityLabel={accessibilityLabel} {...props}>
      {child || (
        <View style={style}>
          <View style={iconStyle}>{first}</View>
          {second}
        </View>
      )}
    </TouchableWithoutFeedback>
  );
};

export default Button;
