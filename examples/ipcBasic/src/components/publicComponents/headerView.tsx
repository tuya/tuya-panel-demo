import React from 'react';
import { StatusBar, View } from 'react-native';
import { useSelector } from 'react-redux';
import { TYIpcTopBar } from '@tuya-smart/tuya-panel-ipc-sdk';
import { commonConfig } from '@config';
import Res from '@res';

const { isIOS, statusBarHeight } = commonConfig;
interface HeaderViewProps {
  isFullScreen?: boolean;
  hasRight?: boolean;
  rightPress?: () => void;
  contentTitle?: string;
  leftPress?: () => void;
}

const HeaderView: React.FC<HeaderViewProps> = (props: HeaderViewProps) => {
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeTextColor = customTheme[type].textColor;
  const themeBgc = customTheme[type].background;
  const themeBarStyleBg = customTheme[type].barStyleBg;
  const themeStatusBackground = customTheme[type].statusBackground;

  const { isFullScreen, hasRight, rightPress, contentTitle, leftPress } = props;
  return (
    <View>
      <StatusBar
        barStyle={themeBarStyleBg}
        translucent={true}
        backgroundColor={ipcCommonState.showPagePreLoading && !isIOS ? '#000000' : 'transparent'}
        hidden={isFullScreen}
      />
      {!isFullScreen && (
        <View
          style={{
            paddingTop: isIOS ? 0 : statusBarHeight,
            backgroundColor: themeStatusBackground,
          }}
        >
          <TYIpcTopBar
            hasRight={hasRight}
            rightPress={rightPress}
            contentTitle={contentTitle}
            leftPress={leftPress}
            background={themeBgc}
            leftBackColor={themeTextColor}
            contentTitleStyle={{ color: themeTextColor }}
            customImgIcon={Res.publicImage.editIcon}
            customImgIconStyle={{ tintColor: themeTextColor }}
          />
        </View>
      )}
    </View>
  );
};

HeaderView.defaultProps = {
  hasRight: true,
  isFullScreen: false,
  contentTitle: 'Title',
  rightPress: () => false,
  leftPress: () => false,
};

export default HeaderView;
