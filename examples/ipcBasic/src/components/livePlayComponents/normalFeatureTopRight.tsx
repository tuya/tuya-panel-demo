import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, UIManager } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { commonConfig, commonClick } from '@config';
import { actions } from '@models';
import Res from '@res';

const { listHight, cx, winWidth, isIOS } = commonConfig;

interface NormalFeatureTopRightProps {
  // zoomStatus: number;
}

const NormalFeatureTopRight: React.FC<NormalFeatureTopRightProps> = (
  props: NormalFeatureTopRightProps
) => {
  const [menuArr, setMenuArr] = useState([]);
  const dispatch = useDispatch();
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);

  useEffect(() => {
    getRightMenu(ipcCommonState);
  }, [ipcCommonState.voiceStatus, ipcCommonState.scaleStatus]);

  const getRightMenu = (nextProps: any) => {
    const initMenu: any = [
      {
        show: true,
        test: 'tuya_ipc_speaker_on',
        key: 'mute',
        imgSource:
          ipcCommonState.voiceStatus === 'OFF'
            ? Res.publicImage.basicMute
            : Res.publicImage.basicNotMute,
      },
      {
        show: true,
        test:
          nextProps.scaleStatus === -2
            ? 'tuya_ipc_size_adjust_height'
            : 'tuya_ipc_size_adjust_width',
        key: 'size',
        imgSource:
          nextProps.scaleStatus === -2
            ? Res.publicImage.basicPlayerSizeHeight
            : Res.publicImage.basicPlayerSizeWidth,
      },
    ];
    setMenuArr(initMenu);
  };

  const menuClick = (key: string) => {
    switch (key) {
      case 'mute':
        if (commonClick.isRecordingChangeMute() || commonClick.isMicTalking()) {
          return false;
        }
        commonClick.enableMute();
        break;
      case 'size':
        // 这里用redux过渡一下，监听按宽按高变更主动传值,避免bug
        dispatch(
          actions.ipcCommonActions.isActiveScale({
            isActiveScale: true,
          })
        );
        break;
      default:
        return false;
    }
  };

  return (
    <View style={styles.normalFeatureTopRightPage}>
      {menuArr.map((item: any) => (
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.menuItem, item.key === 'size' && { marginRight: 0 }]}
          key={item.key}
          onPress={() => menuClick(item.key)}
          accessibilityLabel={item.test || ''}
        >
          {item.show && <Image source={item.imgSource} style={styles.menuItemImg} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  normalFeatureTopRightPage: {
    position: 'absolute',
    top: 0,
    right: cx(15),
    height: listHight,
    alignItems: 'center',
    flexDirection: 'row',
  },
  menuItemImg: {
    width: cx(24),
    resizeMode: 'contain',
  },
  menuItem: {
    marginRight: 15,
  },
});

export default NormalFeatureTopRight;
