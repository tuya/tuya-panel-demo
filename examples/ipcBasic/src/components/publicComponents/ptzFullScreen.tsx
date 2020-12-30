import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import Res from '@res';

const TYDevice = TYSdk.device;

interface PtzFullScreenProps {
  stopMenuAnim: () => void;
}

const PtzFullScreen: React.FC<PtzFullScreenProps> = (props: PtzFullScreenProps) => {
  const [upState, setUpState] = useState(false);
  const [downState, setDownState] = useState(false);
  const [leftState, setLeftState] = useState(false);
  const [rightState, setRightState] = useState(false);
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const dpState = useSelector((state: any) => state.dpState);
  const devInfo = useSelector((state: any) => state.devInfo);

  useEffect(() => {
    dpState.ptz_control !== undefined && ptzControlRange();
  }, []);

  // 判定是否显示某方向的点
  const ptzControlRange = () => {
    const { schema } = devInfo;
    const ptzSchema = schema.ptz_control;
    const ptz = ptzSchema.range;
    // 判定是否具有某方向的云台控制
    ptz.includes('0') && setShowUp(true);
    ptz.includes('4') && setShowDown(true);
    ptz.includes('6') && setShowLeft(true);
    ptz.includes('2') && setShowRight(true);
  };

  const ptzDpControl = (state, dpValue?: string) => {
    props.stopMenuAnim();
    if (state) {
      dpValue === '0' && setUpState(true);
      dpValue === '4' && setDownState(true);
      dpValue === '6' && setLeftState(true);
      dpValue === '2' && setRightState(true);
      TYDevice.putDeviceData({
        ptz_control: dpValue,
      });
    } else {
      TYDevice.putDeviceData({
        ptz_stop: true,
      });
      setUpState(false);
      setDownState(false);
      setLeftState(false);
      setRightState(false);
    }
  };
  return (
    <View style={styles.container}>
      {dpState.ptz_control !== undefined && (
        <ImageBackground source={Res.ptzZoomFull.ptzBgcImg} style={[styles.bgcBox]}>
          {upState && <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickTop} />}
          {showUp && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.up_style}
              onPressIn={() => {
                ptzDpControl(true, '0');
              }}
              onPressOut={() => {
                ptzDpControl(false);
              }}
            >
              <Image source={Res.ptzZoomFull.ptzDot} style={styles.ptzDot} />
            </TouchableOpacity>
          )}
          {downState && <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickBottom} />}
          {showDown && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.down_style}
              onPressIn={() => ptzDpControl(true, '4')}
              onPressOut={() => ptzDpControl(false)}
            >
              <Image source={Res.ptzZoomFull.ptzDot} style={styles.ptzDot} />
            </TouchableOpacity>
          )}
          {leftState && <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickLeft} />}
          {showLeft && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.left_style}
              onPressIn={() => ptzDpControl(true, '6')}
              onPressOut={() => ptzDpControl(false)}
            >
              <Image source={Res.ptzZoomFull.ptzDot} />
            </TouchableOpacity>
          )}

          {rightState && <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickRight} />}
          {showRight && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.right_style}
              onPressIn={() => ptzDpControl(true, '2')}
              onPressOut={() => ptzDpControl(false)}
            >
              <Image source={Res.ptzZoomFull.ptzDot} />
            </TouchableOpacity>
          )}
        </ImageBackground>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  bgcBox: {
    width: 120,
    height: 120,
  },
  shadowImg: {
    width: 120,
    height: 120,
  },
  ptzDot: {
    width: 20,
    resizeMode: 'contain',
  },
  up_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    top: 0,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    height: 40,
  },
  down_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    height: 40,
  },
  left_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    left: 0,
    width: 40,
    height: 100,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
  },

  right_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    right: 0,
    width: 40,
    height: 100,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
  },
});
export default PtzFullScreen;
