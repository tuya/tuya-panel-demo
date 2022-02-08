import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Animated,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import _ from 'lodash';
import { TYSdk, TopBar, Utils, Button } from 'tuya-panel-kit';
import Res from '@res';
import Strings from '@i18n';
import { useGetState, useNav } from '@hooks';
import { FindTip } from '@components';
import { navManager } from '@utils';
import { StatusData, Battery } from '@interface';
import { getEleIcon, getGuideFlag, saveGuideFlag, getDpsWithDevId } from './utils';
import HomeTopView from './home-top-view';
import SwipePop from '../../components/swipe-pop';
import HomeListView from './home-list-view';
import RemoteView from './remote-view';

const { winWidth, winHeight, convertX: cx, convertY: cy, isIphoneX } = Utils.RatioUtils;

const HomePage = () => {
  const { navigationPush } = useNav();
  const { themeColor, themeImage, dpState, existDps, extraInfo, devInfo } = useGetState();
  const {
    residual_electricity: electricity,
    closed_opened: closedOpened,
    battery_state: battery,
    anti_lock_outside: lockOutside,
    reverse_lock: reverseLock,
    child_lock: childLock,
  } = dpState;
  const {
    dpBatteryState,
    dpResidualElectricity,
    dpClosedOpened,
    dpAntiLockOutside,
    dpReverseLock,
    dpChildLock,
    dpFinddev,
    dpGuidePageAct,
    dpAlarmSwitch,
  } = existDps;
  const { productId } = devInfo;

  const [popShow, setPopShow] = useState(false);
  const timer = useRef<null | number>(null);

  useEffect(() => {
    const { type: extraType } = extraInfo;
    guidePage();
    if (extraType === 'family') {
      navigationPush({
        id: 'family',
        ...extraInfo,
      });
    }
    BackHandler.addEventListener('hardwareBackPress', back);

    // 面板主动拉取报警开关dp值
    if (dpAlarmSwitch) {
      getDpsWithDevId([85]);
    }

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', back);
      timer.current && clearTimeout(timer.current);
    };
  }, []);

  const back = () => {
    return true;
  };

  const guidePage = async () => {
    const guideFlag = await getGuideFlag();
    if (!guideFlag && dpGuidePageAct) {
      TYSdk.mobile.jumpSubPage({ uiId: '0000009uve' }, { productId });
      saveGuideFlag(true);
    }
  };

  const getStatusData = (): StatusData[] => {
    const showBat = dpBatteryState || dpResidualElectricity;
    const ele = (dpResidualElectricity ? electricity : battery) as number | Battery;
    return [
      {
        key: 'doorStatus' && dpClosedOpened && closedOpened !== 'unknown',
        text: Strings.getDpLang('closed_opened', closedOpened),
        image: closedOpened === 'open' ? Res.temp : Res.temp,
      },
      {
        key: 'lockOutside' && dpAntiLockOutside,
        text: Strings.getDpLang('anti_lock_outside', lockOutside),
        image: lockOutside ? Res.temp : Res.temp,
      },
      {
        key: 'reverseLock' && dpReverseLock,
        text: Strings.getDpLang('reverse_lock', reverseLock),
        image: reverseLock ? Res.temp : Res.temp,
      },
      {
        key: 'childLock' && dpChildLock,
        text: Strings.getDpLang('child_lock', childLock),
        image: childLock ? Res.temp : Res.temp,
      },
      {
        key: 'bat' && showBat,
        text:
          typeof ele === 'number'
            ? ele < 0
              ? '--'
              : `${ele}%`
            : Strings.getDpLang('battery_state', battery),
        image: getEleIcon(ele),
        showEle: true,
      },
    ];
  };

  const goToLostPage = () => {
    TYSdk.mobile.jumpSubPage({ uiId: '0000019gjs' }, { themeColor });
  };

  const handleKeyChange = (key: 'full' | 'none') => {
    const visible = key === 'full';
    setPopShow(visible);
  };

  const statusData = getStatusData().filter(({ key }) => !!key);
  const showEle = () => {
    let _showEle = true;
    if (statusData.length === 1 && statusData[0].showEle) {
      _showEle = false;
    }
    return _showEle;
  };

  const themeImg = useMemo(
    () => (typeof themeImage === 'string' ? { uri: themeImage } : themeImage),
    [themeImage]
  );
  return (
    <View style={styles.container}>
      <TopBar
        style={{ position: 'absolute', width: winWidth, zIndex: 100 }}
        background="transparent"
        title={devInfo.name}
        titleStyle={{ fontSize: 17 }}
        color="#000"
        actions={[
          {
            style: { position: 'absolute', zIndex: 100 },
            name: 'pen',
            color: '#000',
            onPress: () => TYSdk.native.showDeviceMenu(),
          },
        ]}
        onBack={() => navManager.closeAllPanels()}
      />
      <ImageBackground source={themeImg || Res.themeImage} style={styles.themeImage} />
      <ImageBackground source={Res.themeMask} style={styles.themeImage}>
        <View style={styles.eleWrap}>
          {!showEle() && (
            <Button
              wrapperStyle={{ marginTop: 80 }}
              style={{ width: cx(24), height: cx(24) }}
              text={statusData[0].text}
              textDirection="right"
              textStyle={{ color: '#666666', fontSize: 12, marginLeft: 4 }}
              image={statusData[0].image}
              imageStyle={{ transform: [{ rotate: '90deg' }] }}
            />
          )}
        </View>
      </ImageBackground>
      <Animated.View style={[styles.savePosition, { bottom: winHeight - 440 }]}>
        {/* 离家布防标签 */}
        <HomeTopView />
        {dpFinddev && (
          <View>
            {/* 找不到锁点这里的tip提示 */}
            <FindTip tips={Strings.getLang('home_findDev')} />
            <TouchableOpacity onPress={goToLostPage}>
              <ImageBackground source={Res.tempBg} style={styles.searchBg}>
                <Image source={Res.temp} style={[styles.search, { tintColor: themeColor }]} />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
      <SwipePop
        style={styles.swipePop}
        showMask={false}
        activeKey={popShow ? 'full' : 'none'}
        sections={[{ key: 'full', height: winHeight - 220 }]}
        showHeight={winHeight - 440}
        startValidHeight={300}
        onKeyChange={handleKeyChange}
      >
        <ScrollView
          style={{ marginBottom: isIphoneX ? cx(142) : cx(108) }}
          showsVerticalScrollIndicator={false}
          pointerEvents="box-none"
        >
          <HomeListView showEle={showEle()} statusData={statusData} />
        </ScrollView>
        <RemoteView />
      </SwipePop>
    </View>
  );
};
export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eleWrap: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeImage: {
    position: 'absolute',
    top: 0,
    width: cx(375),
    height: cx(430),
  },
  savePosition: {
    position: 'absolute',
    width: winWidth,
    height: cx(60),
    paddingLeft: cx(24),
    paddingRight: cx(12),
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  searchBg: {
    width: cy(48),
    height: cy(48),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  search: {
    marginBottom: 6,
    marginLeft: 2,
    width: cx(48),
    height: cx(48),
  },
  swipePop: {
    backgroundColor: '#f8f8f8',
    // overflow: 'hidden',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
});
