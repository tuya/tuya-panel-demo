import React, { FC } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { width } = Utils.RatioUtils;

interface ITabPanelProps {
  /**
   *  内容样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   *  背景色
   */
  background?: string;
}

const TabPanel: FC<ITabPanelProps> = ({ style, background, ...props }) => (
  <View style={[{ width }, { backgroundColor: background }, style]} {...props} />
);

TabPanel.defaultProps = {
  style: null,
  background: 'transparent',
};

export default TabPanel;
