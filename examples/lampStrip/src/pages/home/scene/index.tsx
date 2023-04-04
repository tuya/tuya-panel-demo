/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable indent */
import React, { useState, useMemo, useRef } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Rect } from 'react-native-svg';
import { useDispatch } from 'react-redux';
import { Button, TYText, LinearGradient, Utils, Swipeout, TopBar, useTheme } from 'tuya-panel-kit';
import { useMount, usePersistFn } from 'ahooks';
import { useNavigation } from '@react-navigation/native';
import color from 'color';
import { SceneDataType, SceneCategory, SceneCategoryTab, SceneValueType } from '@types';
import useSelector from '@hooks/useSelector';
import LottieView from '@components/LottieView';
import { getStops, hsv2rgba, checkArray } from '@utils';
import { CommonActions } from '@actions';
import Strings from '@i18n';
import Res from '@res';
import LottiesJSON from '@res/lotties';
import DpCodes from '@config/dpCodes';
import PresetScenes from '@config/default/scene';
import Top from './Top';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { handleRemoveScene, getCloudStates, handlePutSceneData } = CommonActions;
const { sceneCode } = DpCodes;

const Scene: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useMount(() => {
    dispatch(getCloudStates());
  });

  const topRef = useRef(null);
  const sceneListRef = useRef(null);

  const { isDarkTheme, themeColor, fontColor, boxBgColor }: any = useTheme();
  const { scene, presetScenes, diyScenes } = useSelector(({ dpState, uiState, cloudState }) => ({
    scene: dpState[sceneCode] as SceneValueType,
    presetScenes: uiState.presetScenes,
    diyScenes: (cloudState.scenes as SceneDataType[]) || [],
  }));

  const scenes: SceneDataType[] = useMemo(
    () => [...diyScenes].reverse().concat(presetScenes),
    [diyScenes, presetScenes]
  );
  const hasDiyScene = useMemo(() => checkArray(diyScenes), [diyScenes]);

  const handleSceneSelect = item => {
    dispatch(handlePutSceneData(item.value));
  };

  const handleEditScene = (item, index: number) => {
    navigation.navigate('diyScene', {
      isEdit: true,
      sceneData: item,
      onRemove: () => handleRemove(item, index),
    });
  };

  const handleRemove = async (item, index: number) => {
    if (diyScenes.length === 1) setTopTab(SceneCategory[0] as SceneCategoryTab);
    // @ts-ignore
    sceneListRef.current?.setNativeProps?.({ scrollEnabled: true });
    await dispatch(handleRemoveScene(item));
    if (scene.id === item.id) dispatch(handlePutSceneData(scenes[index === 0 ? 1 : 0].value));
  };

  const renderItem = ({ item, index }) => {
    const { name, id, value } = item;
    const { colors, brightness } = value || {};
    const isDIY = id >= 200;
    const bgColorData = colors?.map(c => hsv2rgba(c.hue, c.saturation, brightness));
    const isActive = scene.id === id;
    return (
      <Swipeout
        key={id}
        backgroundColor="transparent"
        style={{
          marginVertical: cx(7),
          height: cx(96),
        }}
        disabled={!isDIY}
        autoClose={true}
        onOpen={() => {
          // @ts-ignore
          sceneListRef.current?.setNativeProps?.({ scrollEnabled: false });
        }}
        // @ts-ignore
        onClose={() => sceneListRef.current?.setNativeProps?.({ scrollEnabled: true })}
        right={[
          {
            type: 'delete',
            text: Strings.getLang('timerDelete'),
            backgroundColor: 'transparent',
            content: (
              <Button
                background="#DA3737"
                style={{
                  width: cx(52),
                  height: '100%',
                  borderRadius: cx(12),
                }}
                wrapperStyle={{ alignSelf: 'flex-end' }}
                image={Res.deletes}
                imageStyle={{ width: cx(16), height: cx(18) }}
                onPress={() => handleRemove(item, index)}
              />
            ),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.items}
          onPress={() => handleSceneSelect(item)}
        >
          {isActive && (
            <LinearGradient
              style={styles.backgroundImage}
              stops={getStops(bgColorData)}
              x2="100%"
              y2="100%"
            >
              <Rect width={cx(343)} height={cx(96)} />
            </LinearGradient>
          )}
          <View
            style={[
              styles.itemContent,
              {
                width: isActive ? cx(343 - 4) : cx(343),
                backgroundColor: boxBgColor,
              },
            ]}
          />
          <View style={StyleSheet.absoluteFill}>
            {LottiesJSON[item.key || PresetScenes[0].key] ? (
              <LottieView
                autoPlay={true}
                loop={true}
                style={styles.lottieView}
                source={LottiesJSON[item.key || PresetScenes[0].key]}
              />
            ) : (
              <Image source={Res.scene_preview} style={styles.sceneLight} />
            )}
          </View>
          <View style={[StyleSheet.absoluteFill, styles.topView]}>
            <TYText style={styles.title} numberOfLines={1}>
              {name}
            </TYText>
            <View>
              {isDIY && (
                <Button
                  style={[
                    styles.diyBtn,
                    {
                      backgroundColor: isDarkTheme
                        ? isActive
                          ? themeColor
                          : 'rgba(255,255,255,0.1)'
                        : // @ts-ignore
                          color(themeColor).alpha(0.1).rgbaString(),
                    },
                  ]}
                  textStyle={{
                    color: isDarkTheme ? fontColor : themeColor,
                    fontSize: cx(14),
                  }}
                  text={Strings.getLang('btn_diy')}
                  onPress={() => handleEditScene(item, index)}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeout>
    );
  };

  const sceneListDragTag = useRef(false);

  const [topTab, setTopTab] = useState<SceneCategoryTab>(
    (hasDiyScene ? SceneCategory[4] : SceneCategory[0]) as SceneCategoryTab
  );

  const scrollToIndex = usePersistFn((index: number) => {
    if (index === -1) return;
    // @ts-ignore
    sceneListRef.current?.scrollToIndex?.({ index, viewOffset: cx(141) });
  });

  const handleTabSelect = usePersistFn((tab: SceneCategoryTab) => {
    const targetIndex = Math.max(
      0,
      scenes.findIndex((item: any) => (item.category || SceneCategory[4]) === tab)
    );
    setTopTab(tab);
    scrollToIndex(targetIndex);
  });

  const handleSceneListScroll = ({ nativeEvent }) => {
    const { y } = nativeEvent.contentOffset;
    // The blurring effect is displayed when the scene content is scroll below Top
    // @ts-ignore
    topRef.current?.blurRef?.current?.setNativeProps?.({
      style: { opacity: y > cx(7) ? 1 : 0 },
    });
    if (!sceneListDragTag.current) return;

    const tabIndex1 = scenes.findIndex(
      item => (item.category || SceneCategory[4]) === SceneCategory[0]
    );
    const tabIndex2 = scenes.findIndex(
      item => (item.category || SceneCategory[4]) === SceneCategory[1]
    );
    const tabIndex3 = scenes.findIndex(
      item => (item.category || SceneCategory[4]) === SceneCategory[2]
    );
    const tabIndex4 = scenes.findIndex(
      item => (item.category || SceneCategory[4]) === SceneCategory[3]
    );
    let targetTab;
    if (hasDiyScene && y <= tabIndex1 * cx(110)) {
      targetTab = SceneCategory[4];
    } else if (y <= tabIndex2 * cx(110)) {
      targetTab = SceneCategory[0];
    } else if (y <= tabIndex3 * cx(110)) {
      targetTab = SceneCategory[1];
    } else if (y <= tabIndex4 * cx(110)) {
      targetTab = SceneCategory[2];
    } else {
      targetTab = SceneCategory[3];
    }
    setTopTab(targetTab as SceneCategoryTab);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={sceneListRef}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContainerStyle}
        showsVerticalScrollIndicator={false}
        data={scenes}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        extraData={scene}
        onScroll={handleSceneListScroll}
        onScrollBeginDrag={() => {
          sceneListDragTag.current = true;
        }}
        onScrollEndDrag={() => {
          sceneListDragTag.current = false;
        }}
      />
      <Top
        hasDiyScene={hasDiyScene}
        activeTab={topTab}
        onTabSelect={handleTabSelect}
        innerRef={topRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {},
  flatListContainerStyle: {
    paddingTop: TopBar.height + cx(46),
    paddingRight: cx(16),
    paddingBottom: isIphoneX ? cx(105) : cx(75),
  },
  itemContent: {
    width: cx(343 - 4),
    height: cx(96 - 4),
    borderRadius: cx(13),
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: cx(16),
  },
  title: {
    fontSize: cx(14),
    maxWidth: cx(196),
  },
  sceneLight: {
    position: 'absolute',
    bottom: cx(22),
    alignSelf: 'center',
    width: cx(287),
    height: cx(20),
    resizeMode: 'stretch',
  },
  diyBtn: {
    width: cx(44),
    height: cx(20),
    paddingHorizontal: cx(10),
    borderRadius: cx(10),
  },
  backgroundImage: {
    width: cx(343),
    height: cx(96),
    borderRadius: cx(14),
    overflow: 'hidden',
  },
  items: {
    width: cx(343),
    height: cx(96),
    // borderRadius: cx(12),
    alignSelf: 'flex-end',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieView: {
    height: cx(96),
    alignSelf: 'center',
  },
});

export default Scene;
