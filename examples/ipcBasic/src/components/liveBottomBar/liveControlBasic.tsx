import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { TYIpcNative } from '@tuya/tuya-panel-ipc-sdk';
import { commonConfig, panBasicFeature, commonClick } from '@config';
// import { enableRecord, snapShoot, setScreenOrientation } from '';
import Strings from '../../i18n';

const { cx, isIphoneX } = commonConfig;

interface LiveControlBasicProps {
  defaultShowTabs?: boolean;
  openAnimateHeight: (__: boolean) => void;
}

const LiveControlBasic: React.FC<LiveControlBasicProps> = (props: LiveControlBasicProps) => {
  const [openMoreControl, setOpenMoreControl] = useState(false);
  const [menData, setMenData] = useState([]);

  // redux取值
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeBgc = customTheme[type].background;
  const themeBasicTintColor = customTheme[type].basicTintColor;

  // 根据条件替换菜单
  useEffect(() => {
    const menuList = panBasicFeature.getBasicMenuData(ipcCommonState, openMoreControl);
    setMenData(menuList);
  }, [openMoreControl, ipcCommonState.isSupportMic, ipcCommonState.isTwoWayTalk]);

  const controlBottomDialog = () => {
    setOpenMoreControl(isOpen => {
      props.openAnimateHeight(!isOpen);
      return !isOpen;
    });
  };

  const clickBottomBtn = (key: string) => {
    switch (key) {
      case 'fullScreen':
        commonClick.setScreenOrientation(1);
        break;
      case 'capture':
        commonClick.snapShoot();
        break;
      case 'mic':
        micCamera();
        break;
      case 'video':
        commonClick.enableRecord();
        break;
      case 'more':
        controlBottomDialog();
        break;
      default:
        return false;
    }
  };

  const micCamera = () => {
    if (!ipcCommonState.isTwoWayTalk) {
      TYIpcNative.showToast(Strings.getLang('holdToTalk'));
    } else if (ipcCommonState.isTalking) {
      TYIpcNative.enableStopTalk(ipcCommonState.isTwoWayTalk);
    } else {
      TYIpcNative.showToast(Strings.getLang('clickToCall'));
      TYIpcNative.enableStartTalk(ipcCommonState.isTwoWayTalk);
    }
  };

  const clickInSingleMic = (key: string) => {
    clickBottomBtn(key);
  };

  const clickLongSingleMic = (key: string) => {
    key === 'mic' &&
      !ipcCommonState.isTwoWayTalk &&
      TYIpcNative.enableStartTalk(ipcCommonState.isTwoWayTalk);
  };

  const clickOutSingleMic = (key: string) => {
    key === 'mic' &&
      !ipcCommonState.isTwoWayTalk &&
      TYIpcNative.enableStopTalk(ipcCommonState.isTwoWayTalk);
  };

  const renderMicBtn = (item: any) => {
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        style={[styles.bottomBarItem]}
        activeOpacity={0.5}
        disabled={ipcCommonState.videoStatus !== 6 || ipcCommonState.isRecording}
        onLongPress={() => clickLongSingleMic(item.key)}
        onPressIn={_.debounce(() => clickInSingleMic(item.key), 100)}
        onPressOut={() => clickOutSingleMic(item.key)}
      >
        <Image
          source={item.imgSource}
          style={[
            styles.bottomBarImage,
            {
              tintColor: ipcCommonState.isTalking
                ? ipcCommonState.panelItemActiveColor
                : themeBasicTintColor,
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  const renderNotMicBtn = (item: any) => {
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        style={[styles.bottomBarItem]}
        activeOpacity={item.key !== 'more' ? 0.5 : 1}
        disabled={
          (ipcCommonState.videoStatus !== 6 && item.key !== 'more' && item.key !== 'fullScreen') ||
          (item.key === 'video' && ipcCommonState.isRecordingDisabled)
        }
        onPress={_.debounce(() => clickInSingleMic(item.key), 100)}
      >
        <Image
          source={item.imgSource}
          style={[
            styles.bottomBarImage,
            {
              tintColor:
                ipcCommonState.isRecording && item.key === 'video'
                  ? ipcCommonState.panelItemActiveColor
                  : themeBasicTintColor,
            },
          ]}
        />
      </TouchableOpacity>
    );
  };
  const { defaultShowTabs } = props;
  return (
    <View
      style={[
        styles.liveControlBasicPage,
        {
          paddingBottom: !openMoreControl && isIphoneX ? (defaultShowTabs ? 0 : 20) : 0,
          height: !openMoreControl && isIphoneX ? 92 : 72,
          backgroundColor: themeBgc,
        },
      ]}
    >
      {menData.map((item: any) => {
        return (
          <View key={item.key} style={item.show ? { flex: 1 } : { width: 0 }}>
            {item.show ? (
              <View
                style={{
                  flex: 1,
                  opacity:
                    (ipcCommonState.videoStatus !== 6 &&
                      item.key !== 'more' &&
                      item.key !== 'fullScreen') ||
                    (item.key === 'video' && ipcCommonState.isRecordingDisabled) ||
                    (item.key === 'mic' && ipcCommonState.isRecording)
                      ? 0.2
                      : 1,
                }}
              >
                {item.key === 'mic' && renderMicBtn(item)}
                {item.key !== 'mic' && renderNotMicBtn(item)}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

LiveControlBasic.defaultProps = {
  defaultShowTabs: false,
};

const styles = StyleSheet.create({
  liveControlBasicPage: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarImage: {
    width: cx(36),
    resizeMode: 'contain',
  },
});

export default LiveControlBasic;
