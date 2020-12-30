import React, { useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { TYSdk } from 'tuya-panel-kit';
import Res from '@res';

const TYDevice = TYSdk.device;

interface ZoomFullScreenProps {
  stopMenuAnim: () => void;
}

const ZoomFullScreen: React.FC<ZoomFullScreenProps> = (props: ZoomFullScreenProps) => {
  // const ipcCommonState = useSelector( (state: any) => state.)
  const timeoutHandle: any = useRef();

  const zoomAddPress = () => {
    TYDevice.putDeviceData({ zoom_control: '1' });
    props.stopMenuAnim();
  };
  const zoomAddPressOut = () => {
    clearInterval(timeoutHandle.current);
    TYDevice.putDeviceData({ zoom_stop: true });
  };

  const zoomAddLongPress = () => {
    props.stopMenuAnim();
    timeoutHandle.current = setInterval(() => {
      TYDevice.putDeviceData({ zoom_control: '1' });
    }, 1000);
  };

  const zoomDownPress = () => {
    TYDevice.putDeviceData({ zoom_control: '0' });
    props.stopMenuAnim();
  };

  const zoomDownPressOut = () => {
    props.stopMenuAnim();
    clearInterval(timeoutHandle.current);
    TYDevice.putDeviceData({ zoom_stop: true });
  };

  const zoomDownLongPress = () => {
    props.stopMenuAnim();
    timeoutHandle.current = setInterval(() => {
      TYDevice.putDeviceData({ zoom_control: '0' });
    }, 1000);
  };
  return (
    <View style={styles.focusPage}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={[styles.focusImgBox, { left: 5 }]}
          onPressIn={zoomAddPress}
          onPressOut={zoomAddPressOut}
          onLongPress={zoomAddLongPress}
          activeOpacity={0.7}
        >
          <Image source={Res.ptzZoomFull.zoomAdd} style={styles.focusImg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.focusImgBox, { left: 5, top: 2 }]}
          onPressIn={zoomDownPress}
          onPressOut={zoomDownPressOut}
          onLongPress={zoomDownLongPress}
          activeOpacity={0.7}
        >
          <Image source={Res.ptzZoomFull.zoomCut} style={styles.focusImg} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  focusPage: {
    width: 50,
    backgroundColor: 'transparent',
  },
  focusImgBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusImg: {
    width: 35,
    resizeMode: 'contain',
  },
});

export default ZoomFullScreen;
