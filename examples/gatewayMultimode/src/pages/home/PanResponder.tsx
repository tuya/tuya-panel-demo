import React, { FC, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Animated,
  FlatList,
  TouchableOpacity,
  Image,
  PanResponderInstance,
} from 'react-native';
import {
  Utils,
  TYText,
  TopBar,
  TYSdk,
  TabBar,
  IconFont,
  Popup,
  DeprecatedNavigator,
} from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { isSigMesh, isBluetooth, isSigMeshGateway, isZigbee, getOnlineState } from '@utils';
import { theme } from '@config';
import { Shadow, UnBindBox, Empty, CustomizeTopBar } from '@components';
import { gatewayApi } from '@tuya/tuya-panel-api';
import { SubDevInfo } from '../../config/interface';

const { bleSubDevRelationUpdate, sigmeshSubDevRelationUpdate } = gatewayApi.relationApi;

interface MainProps {
  devInfo: any;
  navigator: DeprecatedNavigator;
}

interface ListRef {
  [key: string]: any;
}
const { convertX: cx, convertY: cy, isIphoneX } = Utils.RatioUtils;
const { height: screenHeight } = Dimensions.get('window');
const bleKey = '0';
const zigbeeKey = '1';
const themColor = theme.themeColor;

// 子设备项的宽度
const deviceItemWidth = cx(158);
// 子设备项的高度
const deviceItemHeight = Math.floor(cx(120));
// 添加按钮的高度
const addButtonHeight = isIphoneX ? cx(80) : cx(60);
// 列表默认最小上边距
const defaultTop = TopBar.height;
// 屏幕中线 下cy(30)处为 默认最大上边距
// 中线为临界点 超过中线 则为上拉触发 否则弹回
const defaultBottom = screenHeight / 2; // 滑块默认上边距
// 零点以下 cy(50)范围内为下拉边界区 超过则为下拉触发 否则弹回
const boundaryTop = defaultTop + cy(50); // 滑块默认自动吸顶上边界的上边距
const boundaryBottom = defaultBottom - cy(50); // 滑块默认自动吸顶下边界的上边距
const pullDownHeight = TopBar.height; // 顶部下拉view取TopBar高度
const minSpeed = 0.5; // 滑动时自动吸底和吸顶的临界速度
const borderRadius = cx(10);

const Index: FC<MainProps> = ({ devInfo, navigator }) => {
  let movingTop = defaultBottom; // 滑块的顶部位置
  let vy = 0;
  let direction = 'down'; // 手势方向
  let panResponder: PanResponderInstance | any = {};

  const tabConfig = [
    {
      key: bleKey,
      title: Strings.getLang('bleDevices'),
      activeTextStyle: { color: themColor },
      textStyle: { color: '#000' },
    },
    {
      key: zigbeeKey,
      title: Strings.getLang('zigDevices'),
      activeTextStyle: { color: themColor },
      textStyle: { color: '#000' },
    },
  ];
  // 当前选择tab的下标
  const [tab, setTab] = useState('0');
  // 滑块的borderRadius值
  const [radius, setRadius] = useState(borderRadius);
  // 滑块当前顶部位置
  const [releaseTop, setReleaseTop] = useState(defaultBottom);
  const animatedTop = useRef(new Animated.Value(defaultBottom)).current;
  const pullDownTop = useRef(new Animated.Value(-pullDownHeight)).current;
  const releaseTopRef = useRef(defaultBottom);
  const flaListRef = useRef({} as ListRef);
  const contentOffset = useRef(0);

  const dispatch = useDispatch();
  const list: SubDevInfo[] = useSelector(state => state.deviceStore.subDevList);

  // 根据当前tab显示对应列表
  const displayList = useMemo(() => {
    const isShowBle = tab === bleKey;
    const isShowZigbee = tab === zigbeeKey;
    return list.filter(
      ({ capability }: any) =>
        ((isBluetooth(capability) || isSigMesh(capability)) && isShowBle) ||
        (isZigbee(capability) && isShowZigbee)
    );
  }, [list, tab]);

  // 设置滑动列表的top值
  const setTop = (top: number) => {
    return Animated.timing(animatedTop, {
      toValue: top,
      duration: movingTop > boundaryBottom && movingTop < defaultBottom ? 500 : 200,
    });
  };
  // topMask 显示
  const showPullDown = Animated.timing(pullDownTop, {
    toValue: 0,
    duration: 200,
  });
  // 隐藏topmask
  const hidePullDown = Animated.timing(pullDownTop, {
    toValue: -pullDownHeight,
    duration: 150,
  });
  const enterItem = (item: any) => {
    TYSdk.native.pushToNextPageWithDeviceId(item.devId);
  };
  const onScroll = (event: any) => {
    const { y } = event.nativeEvent.contentOffset;
    contentOffset.current = y;
  };
  const pullDown = () => {
    animatedToTop(defaultBottom);
    setTimeout(() => hidePullDown.start(), 200);
  };
  /**
   * 吸顶和吸底动画
   */
  const animatedToTop = (top: number) => {
    setTop(top).start(() => {
      setRadius(top === defaultTop ? 0 : borderRadius);
      setReleaseTop(top);
      releaseTopRef.current = top;

      // 滑块到底部后，强制列表滚动到顶部
      if (contentOffset.current > 0 && top === defaultBottom) {
        flaListRef.current.scrollToOffset(0);
      }
      // 顶部下拉按钮展示逻辑
      if (top === defaultTop) {
        showPullDown.start();
      } else if (top === defaultBottom) {
        hidePullDown.start();
      }
      // 每次释放后重置方向
      direction = 'down';
    });
  };
  // 添加设备
  const addDevice = () => {
    Popup.list({
      title: Strings.getLang('addDevices'),
      titleTextStyle: { color: '#999999' },
      onSelect: (option: string) => {
        if ('connectBle' === option) {
          navigator.push({
            id: 'addBle',
          });
        } else {
          TYSdk.native.jumpTo(`tuyaSmart://device_only_search_config_gw_sub?gwId=${devInfo.devId}`);
        }
        Popup.close();
      },
      cancelText: Strings.getLang('cancel'),
      footerType: 'singleCancel',
      dataSource: [
        {
          key: '1',
          title: Strings.getLang('addReference'),
          value: 'connectBle',
        },
        {
          key: '2',
          title: Strings.getLang('addBle'),
          value: 'addBle',
        },
      ],
    });
  };
  // 取消蓝牙关联
  const removeReference = (item: any) => {
    Popup.list({
      type: 'radio',
      dataSource: [
        {
          key: '1',
          title: Strings.getLang('removeReference'),
          value: 'removeReference',
        },
      ],
      title: Strings.getLang('cancelReference'),
      titleTextStyle: { color: '#999999', fontSize: 14 },
      cancelText: Strings.getLang('cancel'),
      value: 1,
      footerType: 'singleCancel',
      onMaskPress: ({ close }) => close(),
      onSelect: () => {
        Popup.close();
        handleDelete(item);
      },
    });
  };

  // 解绑蓝牙设备
  const handleDelete = item => {
    Popup.custom(
      {
        content: (
          <UnBindBox
            onCancel={Popup.close}
            onConfirm={_.throttle(() => deleteItem(item), 2000, {
              trailing: false,
            })}
          />
        ),
        footer: <View />,
        title: <View />,
        onMaskPress: ({ close }) => close(),
        wrapperStyle: { backgroundColor: 'transparent' },
      },
      { alignContainer: 'center' }
    );
  };
  const deleteItem = (item: any) => {
    const { meshId, sigmeshId, capability, devId } = devInfo;
    // 是否是sigMesh网关
    const unBindMeshId = isSigMeshGateway(capability) ? sigmeshId : meshId;
    const successCallback = () => {
      Popup.close();
      dispatch(actions.customize.getSubDevList());
    };
    // 是否是sigMesh子设备
    if (isSigMesh(item.capability)) {
      sigmeshSubDevRelationUpdate(devId, [item.nodeId], unBindMeshId)
        .then(() => {
          successCallback();
        })
        .catch((err: any) => {
          __DEV__ && console.log(err);
          Popup.close();
        });
      // 否则认为是蓝牙设备
    } else {
      const data = [{ uuid: item.uuid, devId: item.devId }];
      bleSubDevRelationUpdate(devId, data, null)
        .then(() => {
          successCallback();
        })
        .catch((err: any) => {
          __DEV__ && console.log(err);
          Popup.close();
        });
    }
  };

  const renderItem = ({ item }: any) => {
    const { iconUrl, icon, name, isOnline: online, pcc = '' } = item;
    const isOnline = getOnlineState(pcc) || online;
    const itemOpacity = isOnline ? 1 : 0.3;
    return (
      <View style={styles.itemContainer}>
        <Shadow
          shadowStyle={{
            borderRadius: 5,
            shadowRadius: 5,
            shadowColor: '#2B2B2B',
            shadowOpacity: 0.1,
            height: deviceItemHeight,
            width: deviceItemWidth,
            backgroundColor: '#ffffff',
            shadowOffset: {
              width: 0,
              height: 0,
            },
          }}
        >
          <TouchableOpacity style={styles.itemContent} onPress={() => enterItem(item)}>
            <View style={styles.iconContainer}>
              {tab === bleKey && (
                <TouchableOpacity
                  style={{ marginTop: -6, opacity: itemOpacity }}
                  onPress={() => removeReference(item)}
                >
                  <IconFont size={cx(20)} name="moreH" />
                </TouchableOpacity>
              )}
            </View>
            <Image
              source={{ uri: iconUrl || icon }}
              style={[styles.itemImage, { opacity: itemOpacity }]}
            />
            <TYText
              text={name}
              numberOfLines={1}
              style={[styles.itemText, { opacity: itemOpacity }]}
            />
          </TouchableOpacity>
        </Shadow>
      </View>
    );
  };

  const onPanResponderRelease = () => {
    let finalTop = defaultBottom;
    // 滑动速度大于最小速度时
    if (vy >= minSpeed) {
      if (direction === 'up') {
        // 自动吸顶
        finalTop = defaultTop;
      } else {
        // 自动吸底
        finalTop = defaultBottom;
      }
      // 滑动前滑块处于自动吸顶下边界以下并且滑动到下边界以上时
    } else if (
      (releaseTopRef.current < boundaryTop && movingTop < boundaryTop) ||
      (releaseTopRef.current > boundaryBottom && movingTop < boundaryBottom)
    ) {
      // 自动吸顶
      finalTop = defaultTop;
    } else {
      // 滑动未超出自动吸顶下边界，自动吸底
      finalTop = defaultBottom;
    }

    // 吸顶和吸底动画
    animatedToTop(finalTop);
  };

  panResponder = useRef(
    PanResponder.create({
      // 捕获阶段
      onStartShouldSetPanResponderCapture: () => false,
      onStartShouldSetPanResponder: () => false,
      // 释放时
      onMoveShouldSetPanResponderCapture: (__, gestureState) => {
        // 未滑到顶部时，响应者为当前组件
        if (releaseTopRef.current > defaultTop) {
          // 滑动距离少于5时，视为点击事件
          if (Math.abs(gestureState.dy) < 5) {
            return false;
          }
          return true;
        }
        // 滚动条和当前组件同时置顶时
        if (contentOffset.current <= 0 && releaseTopRef.current === defaultTop) {
          // 向下滑动时，响应者为当前组件
          if (gestureState.dy > 0) {
            return true;
          }
          // 向上滑动时，响应者为FlatList
          return false;
        }
        return false;
      },
      onMoveShouldSetPanResponder: (__, _gestureState) => false,
      onPanResponderMove: (__, gestureState) => {
        const { vy: gsVy, dy } = gestureState;
        vy = Math.abs(gsVy);
        // 当前滑动方向
        direction = dy >= 0 ? 'down' : 'up';
        // 当前滑块离顶部上边距
        const finalValue = releaseTopRef.current + dy;

        // finalValue在滑动设定范围内时
        if (finalValue <= defaultBottom && finalValue >= defaultTop) {
          animatedTop.setValue(finalValue);
          movingTop = finalValue;
          releaseTopRef.current = finalValue;
          // setRadius(finalValue > defaultTop ? cx(10) : 0);
          // 动态设置滑块上边距动画值
        }
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease,
      onPanResponderTerminate: onPanResponderRelease,
    })
  ).current;

  // 顶部栏
  const renderTopBar = () => {
    return <CustomizeTopBar devInfo={devInfo} />;
  };
  // 在线状态
  const renderOnlineState = () => {
    return (
      <View style={styles.onlineState}>
        <TYText
          text={Strings.getLang(devInfo.deviceOnline ? 'deviceOnline' : 'deviceOffline')}
          style={styles.onlineStateText}
        />
      </View>
    );
  };

  // 网关的图片
  const renderGatewayImage = () => {
    return (
      <View style={styles.gatewayImageContainer}>
        <Image source={Res.main} />
      </View>
    );
  };
  // 顶部的pull down
  const renderPullDown = () => {
    return (
      <Animated.View style={[styles.pullDown, { top: pullDownTop }]}>
        <TouchableOpacity onPress={pullDown} style={styles.pullDownButton}>
          <IconFont
            name="arrow"
            size={16}
            style={{
              transform: [
                {
                  rotate: '90deg',
                },
              ],
            }}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  // 手势区域
  const renderPanResponder = () => {
    return (
      <Animated.View
        style={[styles.scrollMain, { top: animatedTop, borderRadius: radius }]}
        {...(panResponder && panResponder.panHandlers ? panResponder.panHandlers : {})}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.tabMain}>
            <TouchableOpacity
              style={[
                styles.tabMainIcon,
                {
                  backgroundColor: radius !== 0 ? 'rgb(235,235,235)' : 'rgba(0,0,0,0)',
                },
              ]}
            />
            <TabBar
              tabs={tabConfig}
              activeKey={tab}
              onChange={value => setTab(value)}
              underlineStyle={{ width: 20 }}
              type="radio"
              style={{ backgroundColor: 'rgb(235,235,235)' }}
            />
          </View>
          {renderDeviceList()}
        </View>
        <View style={{ height: addButtonHeight }} />
      </Animated.View>
    );
  };
  // 设备列表
  const renderDeviceList = () => {
    return (
      <FlatList
        ref={(el: FlatList<SubDevInfo>) => {
          flaListRef.current = el;
        }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: cx(24) }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onScroll={onScroll}
        data={displayList}
        keyExtractor={item => item.devId}
        renderItem={renderItem}
        ListEmptyComponent={() => <Empty />}
        scrollEnabled={releaseTop === defaultTop}
      />
    );
  };

  // 底部添加按钮
  const renderAddButton = () => {
    return (
      <TouchableOpacity style={styles.addButton} onPress={addDevice} activeOpacity={0.9}>
        <Image style={{ tintColor: themColor }} source={Res.add} />
        <TYText text={Strings.getLang('addDevices')} style={styles.addButtonText} />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      {renderTopBar()}
      {renderOnlineState()}
      {renderGatewayImage()}
      {renderPullDown()}
      {renderPanResponder()}
      {renderAddButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pullDown: {
    position: 'absolute',
    height: pullDownHeight,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-end',
    width: '100%',
  },
  tabMain: {
    marginBottom: cx(10),
    height: cx(56),
    alignSelf: 'center',
    paddingHorizontal: cx(24),
    width: '100%',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },
  scrollMain: {
    position: 'absolute',
    backgroundColor: '#FAFAFA',
    bottom: 0,
    width: '100%',
  },
  addButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    paddingBottom: isIphoneX ? cx(20) : 0,
    width: '100%',
    height: addButtonHeight,
    backgroundColor: '#fff',
    borderTopColor: '#E5E5E5',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  onlineState: {
    position: 'absolute',
    top: TopBar.height,
    marginTop: cy(20),
    width: '100%',
    alignItems: 'center',
  },
  onlineStateText: {
    color: 'rgba(255,255,255,.5)',
    fontSize: cx(12),
  },
  gatewayImageContainer: {
    position: 'absolute',
    top: pullDownHeight,
    width: '100%',
    height: defaultBottom - pullDownHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pullDownButton: {
    marginLeft: cx(10),
    width: cx(30),
    height: cx(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabMainIcon: {
    marginTop: cx(5),
    alignSelf: 'center',
    width: cx(27),
    height: cx(4),
  },
  addButtonText: {
    marginLeft: cx(5),
  },
  itemContainer: {
    height: deviceItemHeight + 12,
    width: deviceItemWidth + 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    margin: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemImage: {
    height: cx(48),
    width: cx(48),
    resizeMode: 'stretch',
  },
  itemText: {
    fontSize: cx(12),
  },
});

export default Index;
