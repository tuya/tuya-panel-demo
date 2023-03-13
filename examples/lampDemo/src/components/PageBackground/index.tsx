import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from 'tuya-panel-kit';
import Res from '@res';

const PageBackground: React.FC = () => {
  const { isDarkTheme }: any = useTheme();

  return !isDarkTheme ? (
    <Image style={StyleSheet.absoluteFill} resizeMode="stretch" source={Res.background} />
  ) : null;
};

export default PageBackground;
