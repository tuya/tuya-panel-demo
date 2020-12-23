import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

interface FullFeatureBottomLeftProps {}

const FullFeatureBottomLeft: React.FC<FullFeatureBottomLeftProps> = (
  props: FullFeatureBottomLeft
) => {
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeContentBgc = customTheme[type].contentBgc;
  return <View style={[styles.fullFeatureBottomLeftPage, { backgroundColor: themeContentBgc }]} />;
};

const styles = StyleSheet.create({
  fullFeatureBottomLeftPage: {
    // flex: 1,
  },
});

export default FullFeatureBottomLeft;
