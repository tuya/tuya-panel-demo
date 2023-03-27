/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { TopBar, TYSdk, TopBarActionProps } from 'tuya-panel-kit';
import useNavigationBack from '@hooks/useNavigationBack';

interface TopBarProps {
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  absolute?: boolean;
  title?: string;
  leftActions?: TopBarActionProps[];
  actions?: TopBarActionProps[];
}

const MyTopBar: React.FC<TopBarProps> = ({
  style,
  title = TYSdk.devInfo.name,
  absolute,
  ...restProps
}) => {
  const navigationBack = useNavigationBack();

  return (
    <TopBar
      background="transparent"
      onBack={navigationBack}
      {...restProps}
      title={title}
      style={[absolute && styles.absoluteTopbar, style]}
    />
  );
};

const styles = StyleSheet.create({
  absoluteTopbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default MyTopBar;
