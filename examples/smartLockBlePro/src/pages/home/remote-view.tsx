import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  DeviceEventEmitter,
  GestureResponderEvent,
} from 'react-native';
import { TYSdk, TYText, Utils, DpValue, DevInfo } from 'tuya-panel-kit';
import { useGetState } from '@hooks';
import { actions } from '@models';
import Res from '@res';
import { bleManager } from '@utils';
import Strings from '@i18n';
import { dpCodes } from '@config';
import { ArrowWave, AnimatedBtn } from '@components';
import { IsOpening, MoveDire } from '@interface';

const { winWidth, convertX: cx, isIphoneX } = Utils.RatioUtils;
const TYEvent = TYSdk.event;
const { manualLock, lockMotorState, remoteNoDpKey, bleUnlockCheck } = dpCodes;

const overTime = 10000;
const distance = 50;

const RemoteView: React.FC = () => {
  const { devInfo, themeColor, existDps } = useGetState();
  const { dpManualLock, dpLockMotorState } = existDps;
  const { deviceOnline, devId } = devInfo;
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTouchConnectBtn, setIsTouchConnectBtn] = useState(false);
  const [isOpening, setIsOpening] = useState<IsOpening>('none'); // 表示是否在开锁中
  const [btnLoading, seBtnLoading] = useState<boolean>(false);
  const btnLoadingRef = useRef<boolean>(btnLoading);
  const changeBleReConnectTimer = useRef<number>(-1);
  const dpTimeOutTimer = useRef<number>(-1);
  const startTimer = useRef<number>(-1);
  const supportManualLock = useRef<boolean>(!!dpManualLock).current;
  const startValue = supportManualLock ? cx(239) / 2 : -cx(18);
  const moveDire = useRef<MoveDire>('right');
  const leftX = useRef<Animated.Value>(
    new Animated.Value(supportManualLock ? cx(239) / 2 : -cx(18))
  );

  const setTimeOutStart = () => {
    startTimer.current = setTimeout(() => {
      Animated.timing(leftX.current, {
        toValue: startValue,
        duration: 500,
      }).start();
      setIsOpening('none');
      seBtnLoading(false);
    }, 2000);
  };

  const onReceiveDpTimer = () => {
    clearTimeout(dpTimeOutTimer.current);
    // 监听dp上报超时的处理
    dpTimeOutTimer.current = setTimeout(() => {
      setIsOpening('openTimeOut');
      setTimeOutStart();
    }, overTime);
  };

  // 关锁操作
  const closeRemote = async () => {
    TYSdk.device.putDeviceData({
      [manualLock]: true,
    });
    setTimeOutStart();
    onReceiveDpTimer();
  };

  // 开锁操作：先判断有无dp
  const openRemote = async () => {
    setTimeOutStart();
  };

  const handleRemoteOpen = async () => {
    seBtnLoading(true);
    openRemote();
  };
  /**
   * 手势相关
   */
  useEffect(() => {
    btnLoadingRef.current = btnLoading;
  }, [btnLoading]);

  // 开始滑动判断
  const onStartShouldSetPanResponder = () => {
    return !btnLoadingRef.current;
  };

  // 滑动中触发事件
  const onPanResponderMove = (
    e: GestureResponderEvent,
    gestureState: { moveX: number; dx: number }
  ) => {
    const { dx } = gestureState;
    let _distance = startValue + dx;
    if (supportManualLock) {
      if (distance < -cx(18)) {
        _distance = -cx(18);
      }
      if (distance > cx(258)) {
        _distance = cx(258);
      }
      leftX.current.setValue(_distance);
    } else {
      if (distance > cx(258)) {
        _distance = cx(258);
      }
      leftX.current.setValue(_distance);
    }
  };

  // 滑动结束触发事件
  const onPanResponderRelease = async (
    e: GestureResponderEvent,
    gestureState: { moveX: number; dx: number }
  ) => {
    const { dx } = gestureState;
    if (dx > -distance && dx < distance) {
      leftX.current.setValue(startValue);
      return;
    }
    if (supportManualLock) {
      if (dx <= -distance) {
        moveDire.current = 'left';
        leftX.current.setValue(-cx(18));
      }
      if (dx >= distance) {
        moveDire.current = 'right';
        leftX.current.setValue(cx(258));
      }
      if (dx >= 0) {
        setIsOpening('opening');
        seBtnLoading(true);
        await handleRemoteOpen();
      } else {
        setIsOpening('closing');
        seBtnLoading(true);
        await closeRemote();
      }
    } else {
      if (dx < 0) {
        leftX.current.setValue(-cx(18));
      }
      if (dx >= distance) {
        leftX.current.setValue(cx(258));
        setIsOpening('opening');
        seBtnLoading(true);
        await handleRemoteOpen();
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder,
      onPanResponderMove,
      onPanResponderRelease,
      onPanResponderTerminate: onPanResponderRelease,
    })
  ).current;

  const reConnectBlue = () => {
    if (!deviceOnline && !isConnecting) {
      setIsConnecting(true);
      setIsTouchConnectBtn(true);
      // 超时后可再次重连
      changeBleReConnectTimer.current = setTimeout(() => {
        setIsConnecting(false);
        setIsTouchConnectBtn(false);
      }, overTime);
      return bleManager.startConnectBleDevice(devId);
    }
  };

  const dpDataChangeHandle = (data: Record<string, DpValue>) => {
    // 全dp上报不去处理
    if (Object.keys(data).length > 10) return;
    // 手机开锁的返回dp61(网关开门)
    const remoteNoDpKeyState = data[remoteNoDpKey] as string;
    // 带随机数蓝牙开锁的反馈dp71（1.0.7版本）
    const remoteNewUnlock = data[bleUnlockCheck] as string;

    clearTimeout(dpTimeOutTimer.current);
    if (!dpLockMotorState) {
      if (
        (remoteNoDpKeyState && remoteNoDpKeyState.slice(0, 2) === '00') ||
        (remoteNewUnlock && remoteNewUnlock.slice(-2) === '00')
      ) {
        setIsOpening('operateSuccess');
      }
      if (
        (remoteNoDpKeyState && remoteNoDpKeyState.slice(0, 2) !== '00') ||
        (remoteNewUnlock && remoteNewUnlock.slice(-2) !== '00')
      ) {
        setIsOpening('operateFailed');
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, lockMotorState)) {
      const lockMotor = data[lockMotorState];
      setIsOpening(lockMotor ? 'lockOpen' : 'lockClose');
    }
    setTimeOutStart();
  };

  const dpDataChange = (data: {
    type: 'dpData' | 'devInfo' | 'deviceOnline';
    payload: Record<string, DpValue> | DevInfo | boolean;
  }) => {
    switch (data.type) {
      case 'dpData':
        dpDataChangeHandle(data.payload as Record<string, DpValue>);
        break;
      default:
        break;
    }
  };

  const bleConnectStatusChange = () => {
    actions.common.getBLEOnlineState();
  };

  useEffect(() => {
    TYEvent.on('deviceDataChange', dpDataChange);
    DeviceEventEmitter.addListener('bleConnectStatusChange', bleConnectStatusChange);

    return () => {
      TYEvent.off('deviceDataChange', dpDataChange);
      DeviceEventEmitter.removeListener('bleConnectStatusChange', bleConnectStatusChange);
      clearTimeout(dpTimeOutTimer.current);
      changeBleReConnectTimer.current && clearTimeout(changeBleReConnectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (deviceOnline && btnLoading) {
      seBtnLoading(false);
    }
  }, [deviceOnline]);

  const openText = useMemo(
    () => (isOpening !== 'none' ? Strings.getLang(isOpening) : ''),
    [isOpening]
  );

  const arrowRender = (isLeft = false) => {
    return (
      <ArrowWave
        arrowColor="#FFF"
        arrowStyle={{ transform: [{ rotate: isLeft ? '45deg' : '225deg' }] }}
        reverse={isLeft}
        arrowNum={3}
        containerStyle={styles.slide}
      />
    );
  };

  const touchBar = () => {
    return (
      <View style={styles.slideView}>
        <Image source={Res.closeLock} style={styles.lockImg} />
        {arrowRender(true)}
        <TYText style={styles.lockStateText} size={cx(14)} color="#fff" text={openText} />
        {arrowRender(false)}
        <Image source={Res.openLock} style={styles.lockImg} />
        <View style={styles.slideThumbView} {...panResponder.panHandlers}>
          <AnimatedBtn
            leftX={leftX.current}
            btnLoading={btnLoading}
            moveDire={moveDire.current}
            themeColor={themeColor}
          />
        </View>
      </View>
    );
  };

  const singleTouchBar = () => {
    return (
      <View style={styles.slideView}>
        <View />
        {isOpening === 'none' ? (
          <ArrowWave
            arrowColor="#FFF"
            arrowStyle={{ transform: [{ rotate: '225deg' }] }}
            arrowNum={4}
            containerStyle={styles.singleSlide}
          />
        ) : (
          <TYText size={cx(14)} color="#fff" text={Strings.getLang(isOpening)} />
        )}
        <Image source={Res.openLock} style={styles.lockImg} />
        <View style={styles.slideThumbView} {...panResponder.panHandlers}>
          <AnimatedBtn
            leftX={leftX.current}
            btnLoading={btnLoading}
            moveDire={moveDire.current}
            themeColor={themeColor}
          />
        </View>
      </View>
    );
  };

  const renderTouchBar = () => {
    if (supportManualLock) {
      return touchBar();
    }
    return singleTouchBar();
  };

  const connectText = isTouchConnectBtn
    ? isConnecting
      ? Strings.getLang('bleConnecting')
      : Strings.getLang('noConnectDevice')
    : Strings.getLang('noConnectDevice');

  return (
    <View style={styles.outView}>
      <Image
        source={isIphoneX ? Res.bench : Res.mxBench}
        style={[styles.outViewBg, { tintColor: themeColor }]}
      />
      {deviceOnline ? (
        renderTouchBar()
      ) : (
        <TouchableOpacity
          style={styles.connectView}
          onPress={() => reConnectBlue()}
          accessibilityLabel="Home_Remote_Connect"
        >
          <TYText text={connectText} numberOfLines={2} style={styles.clickText} />
        </TouchableOpacity>
      )}
    </View>
  );
};
export default RemoteView;

const styles = StyleSheet.create({
  outView: {
    width: winWidth,
    height: isIphoneX ? cx(142) : cx(108),
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
  },
  outViewBg: {
    width: winWidth,
    height: isIphoneX ? cx(142) : cx(108),
    position: 'absolute',
  },
  connectView: {
    width: winWidth,
    height: isIphoneX ? cx(142) : cx(108),
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideView: {
    width: winWidth,
    height: isIphoneX ? cx(142) : cx(108),
    paddingHorizontal: cx(10),
    paddingBottom: isIphoneX ? cx(42) : cx(8),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  lockStateText: {
    minWidth: cx(60),
    textAlign: 'center',
  },
  clickText: {
    textAlign: 'center',
    fontSize: cx(16),
    color: '#fff',
    marginBottom: cx(30),
  },
  lockImg: {
    width: cx(28),
    height: cx(28),
  },
  slide: {
    width: cx(60),
    height: cx(9),
  },
  singleSlide: {
    width: cx(91),
    height: cx(9),
  },
  slideThumbView: {
    width: cx(355),
    height: isIphoneX ? cx(142) : cx(108),
    left: cx(10),
    position: 'absolute',
  },
});
