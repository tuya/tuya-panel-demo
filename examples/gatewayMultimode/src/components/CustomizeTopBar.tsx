import React, { FC, useCallback } from 'react';
import { Platform } from 'react-native';
import { TopBar, TYSdk } from 'tuya-panel-kit';

interface MainProps {
  devInfo: any;
}

const backIcon = Platform.OS === 'ios' ? 'backIos' : 'backAndroid';

const CustomizeTopBar: FC<MainProps> = ({ devInfo }) => {
  const themeStyleColor = '#ffffff';
  const back = useCallback(() => TYSdk.native.back(), []);
  const showDeviceMenu = useCallback(() => TYSdk.native.showDeviceMenu(), []);

  return (
    <TopBar
      background="transparent"
      color={themeStyleColor}
      leftActions={[
        {
          name: backIcon,
          color: themeStyleColor,
          onPress: back,
        },
      ]}
      actions={[
        {
          name: 'pen',
          color: themeStyleColor,
          onPress: showDeviceMenu,
        },
      ]}
      title={devInfo.name}
    />
  );
};

export default CustomizeTopBar;
