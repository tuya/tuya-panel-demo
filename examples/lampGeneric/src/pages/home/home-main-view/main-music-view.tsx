import throttle from 'lodash/throttle';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Utils, TYSdk, Dialog } from 'tuya-panel-kit';
import { startMic, stopMic, lampPutDpData } from '@api';
import Res from '@res';
import Strings from '@i18n';
import SupportUtils from '../../../utils/support';
import DpCodes from '../../../config/dpCodes';
import { isSendMusicEnabled, musicEnabled, musicDisabled, ColorParser } from '../../../utils';

const DeviceEvent = TYSdk.DeviceEventEmitter;
const { convertY: cy } = Utils.RatioUtils;
const { musicCode: musicDataCode } = DpCodes;
const { isSupportColour, isSupportTemp } = SupportUtils;
const SIZE = 224;

const MainMusicView: React.FC = () => {
  const [waveAnim] = useState(new Animated.Value(0));
  const isMounted = useRef(false);
  const isSupportColor = useRef(isSupportColour());
  const isSupportWhiteTemp = useRef(isSupportTemp());
  const isSupportVoiceAPI = useRef(true);
  useEffect(() => {
    musicEnabled();
    startWaveAnimation();
    isMounted.current = true;
    isSupportVoiceAPI.current = true;

    startMic()
      .then(() => {
        DeviceEvent.addListener('audioRgbChange', _handleRgbChange);
      })
      .catch(() => {
        isSupportVoiceAPI.current = false;
        Dialog.alert({
          title: Strings.getLang('open_mike_failure'),
          subTitle: Strings.getLang('open_mike_error'),
          confirmText: Strings.getLang('confirm'),
          onConfirm: () => {
            Dialog.close();
          },
        });
      });

    return () => {
      isMounted.current = false;
      musicDisabled();
      stopWaveAnimation();
      if (isSupportVoiceAPI.current) {
        DeviceEvent.removeAllListeners('audioRgbChange');
        stopMic();
        _handleRgbChange.cancel();
      }
    };
  }, []);

  const startWaveAnimation = () => {
    waveAnim.setValue(0);
    Animated.timing(waveAnim, {
      toValue: 1,
      duration: 5500,
      easing: Easing.linear,
    }).start(({ finished }) => {
      if (finished) {
        startWaveAnimation();
      }
    });
  };

  const stopWaveAnimation = () => {
    waveAnim.setValue(0);
    waveAnim.stopAnimation();
  };

  const _handleRgbChange = useCallback(
    throttle(({ R, G, B, C: temperature, L: bright }) => {
      if (!isMounted.current || !isSendMusicEnabled()) {
        return;
      }
      let h = 0;
      let s = 0;
      let v = 0;
      let b = 0;
      let t = 0;

      if (isSupportColor.current) {
        [h, s, v] = Utils.ColorUtils.color.rgb2hsb(R, G, B);
      } else {
        // 是否支持白光音乐功能
        if (typeof bright === 'undefined' || typeof temperature === 'undefined') {
          return;
        }
        b = bright * 10;
        t = temperature * 10;
        if (!isSupportWhiteTemp.current) {
          t = 1000;
        }
      }

      const encodedControlColor = ColorParser.encodeControlData(
        0,
        Math.round(h),
        Math.round(s * 10),
        Math.round(v * 10),
        Math.round(b),
        Math.round(t)
      );
      lampPutDpData({ [musicDataCode]: encodedControlColor });
    }, 150),
    [isMounted]
  );

  return (
    <View style={styles.container}>
      <View style={styles.mask}>
        <Animated.Image
          accessibilityLabel="HomeScene_MusicView_Wave"
          style={[
            styles.image,
            {
              transform: [
                {
                  translateX: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -SIZE],
                  }),
                },
              ],
            },
          ]}
          source={Res.wave}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: cy(55),
  },

  mask: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    marginTop: cy(55),
    borderRadius: 112,
    backgroundColor: '#000E20',
    borderColor: '#000',
    borderWidth: 2,
    overflow: 'hidden',
  },

  image: {
    width: 448,
    height: 149,
  },
});

export default MainMusicView;
