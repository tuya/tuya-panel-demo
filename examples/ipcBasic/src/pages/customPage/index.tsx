import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderView } from '@components';
import { TYIpcNative } from '@tuya-smart/tuya-panel-ipc-sdk';
import { TYText } from 'tuya-panel-kit';
import Strings from '@i18n';

interface CustomPageProps {}

const CustomPage: React.FC<CustomPageProps> = (props: CustomPageProps) => {
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeNotLiveBackground = customTheme[type].notLiveBackground;

  useEffect(() => {
    return () => {
      TYIpcNative.backLivePlayWillUnmount();
    };
  }, []);

  const leftPress = () => {
    TYIpcNative.backNavigatorLivePlay();
  };

  return (
    <View style={[styles.customPage, { backgroundColor: themeNotLiveBackground }]}>
      <HeaderView
        hasRight={false}
        leftPress={leftPress}
        contentTitle={Strings.getLang('ipc_panel_button_custom_page')}
      />
      <TYText>Custom Page333</TYText>
    </View>
  );
};

const styles = StyleSheet.create({
  customPage: {
    flex: 1,
  },
});

export default CustomPage;
