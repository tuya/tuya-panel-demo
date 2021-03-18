/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useRef, useCallback } from 'react';
import color from 'color';
import { useSelector } from '@models';
import { View, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYSdk, TYText, IconFont } from 'tuya-panel-kit';
import Res from '@res';
import { lampPutDpData } from '@api';
import Strings from '@i18n';
import SupportUtils from '../../../utils/support';
import Button from '../../../components/Button';
import DpCodes from '../../../config/dpCodes';
import icons from '../../../res/iconfont';

const TYNative = TYSdk.native;
const { inMaxMin } = Utils.NumberUtils;
const { withTheme } = Utils.ThemeUtils;
const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;
const { sceneCode: sceneValueCode, workModeCode } = DpCodes;
const { isSupportColour, isSignMeshDivice } = SupportUtils;
const SINGLE_SCENE_WIDTH = winWidth / 4.5;

interface MainSceneViewProps {
  theme?: any;
}

const MainSceneView: React.FC<MainSceneViewProps> = ({
  theme: {
    global: { fontColor },
  },
}) => {
  const isSupportColourMode = useRef(isSupportColour());
  const isSigMesh = useRef(isSignMeshDivice());
  const flatListRef = useRef<FlatList<unknown>>(null);
  const sceneValue = useSelector(state => state.dpState[sceneValueCode]) as string;
  const sceneDatas = useSelector(state => state.cloudState.sceneDatas) || [];
  const currSceneId = sceneValue.slice(0, 2);

  useEffect(() => {
    TYSdk.event.on('NAVIGATOR_ON_WILL_FOCUS', handleNavigatorFocus);
    // 定位显示当前选中场景(安卓下flatList中的item渲染比较慢，需要加timeout并且有50ms延迟，以确保安卓下有足够的时间把flatlist中的item渲染出来))
    setTimeout(() => {
      scrollToIndex();
    }, 50);
    return () => {
      TYSdk.event.off('NAVIGATOR_ON_WILL_FOCUS', handleNavigatorFocus);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollToIndex();
    }, 50);
  }, [sceneValue]);

  const handleNavigatorFocus = route => {
    // 从场景编辑页面返回时，需要下发模式帮助固件知道预览模式结束
    if (route.id === 'main') {
      lampPutDpData({ [workModeCode]: 'scene' });
    }
  };

  const scrollToIndex = useCallback(() => {
    if (flatListRef) {
      const minIdx = 0;
      const maxIdx = Math.max(0, sceneDatas.length - 4);
      // 场景删除再添加后，会成为无序数组
      const arrayIdx = sceneDatas.findIndex(d => d.value.slice(0, 2) === sceneValue.slice(0, 2));
      const scrollToIdx = arrayIdx - 3;
      const index = inMaxMin(minIdx, maxIdx, scrollToIdx);
      if (flatListRef && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          viewOffset: index === 4 ? SINGLE_SCENE_WIDTH * 0.5 : 0,
        });
      }
    }
  }, [sceneValue]);

  const getScenePic = (id: string) => {
    const num = parseInt(id, 16) % 8;
    const picSource = Res[`dp_scene_data_${num}`] || Res.dp_scene_data_0;
    return picSource;
  };

  const handleScenePress = (id: string, value: string) => () => {
    if (id === currSceneId && sceneValue) {
      return;
    }
    let sceneData = value;
    // 在sign mesh下，只发送场景号（sign mesh 对数据包在长度有限制，所以最终定在切换场景时只传场景号）
    if (isSigMesh.current) {
      sceneData = value.slice(0, 2);
    }
    lampPutDpData({ [workModeCode]: 'scene', [sceneValueCode]: sceneData });
  };

  const navToCustomScene = (isEdit: boolean) => () => {
    if (!isEdit && sceneDatas.length >= 8) {
      return TYNative.simpleTipDialog(Strings.getLang('exceedMaxLength'), () => {});
    }
    TYSdk.Navigator.push({
      id: 'customScene',
      title: ' ', // 使用一个空格不显示标题
      isEdit,
    });
  };

  const renderItem = ({ item }) => {
    const { name, value } = item;
    if (name === 'addScene') {
      return (
        <View style={styles.addScene}>
          <Button
            accessibilityLabel="HomeScene_SceneView_AddScene"
            style={styles.btn}
            label={Strings.getLang('addScene')}
            icon={Res.addScene}
            imageStyle={styles.imageBtn}
            labelStyle={[styles.label, { color: fontColor }]}
            onPress={navToCustomScene(false)}
          />
        </View>
      );
    }
    const id = value.slice(0, 2);
    const active = id === currSceneId;
    const picSource = getScenePic(id);
    return (
      <Button
        accessibilityLabel={`HomeScene_SceneView_${id}`}
        style={styles.btn}
        label={`${name}`}
        icon={picSource}
        iconStyle={[styles.icon, active && styles.iconActive]}
        imageStyle={styles.imageBtn}
        labelStyle={[styles.label, { color: fontColor }]}
        onPress={handleScenePress(id, value)}
      />
    );
  };

  const getCurrentIndex = useCallback(() => {
    let currentIndex = 0;
    const currentId = currSceneId;
    sceneDatas.findIndex((d: any, index) => {
      if (+d.value.slice(0, 2) === +currentId) {
        currentIndex = index;
        return true;
      }
      return false;
    });
    currentIndex = Math.min(currentIndex, sceneDatas.length - 4);
    return currentIndex;
  }, [sceneDatas]);

  const getDataSource = useCallback(() => {
    // 彩灯默认已经八个场景，不再显示可添加更多
    const datas = [...sceneDatas, !isSupportColourMode.current && { name: 'addScene' }].filter(
      v => !!v
    );
    return datas;
  }, [sceneDatas]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionDisplay}>
        <TouchableOpacity
          accessibilityLabel="HomeScene_SceneView_Edit"
          activeOpacity={0.9}
          style={[styles.editView, { backgroundColor: color(fontColor).alpha(0.1).rgbString() }]}
          onPress={navToCustomScene(true)}
        >
          <IconFont d={icons.edit} size={cx(14)} fill={fontColor} stroke={fontColor} />
          <TYText style={[styles.text, { color: fontColor, marginLeft: cx(6) }]}>
            {Strings.getLang('edit')}
          </TYText>
        </TouchableOpacity>
        <Image style={styles.image} source={getScenePic(currSceneId)} />
      </View>
      <View style={styles.sectionSceneList}>
        <FlatList
          accessibilityLabel="HomeScene_SceneView_FlatListRef"
          ref={flatListRef}
          initialScrollIndex={getCurrentIndex()}
          contentContainerStyle={styles.scrollContent}
          horizontal={true}
          data={getDataSource()}
          getItemLayout={(data, index) => ({
            length: SINGLE_SCENE_WIDTH,
            offset: SINGLE_SCENE_WIDTH * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(_, idx) => `${idx}`}
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
    justifyContent: 'center',
    marginTop: cy(40),
  },

  sectionDisplay: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addScene: {
    width: SINGLE_SCENE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageBtn: {
    width: cx(50),
    height: cx(50),
    borderRadius: cx(25),
  },

  editView: {
    position: 'absolute',
    top: cx(28),
    right: cx(16),
    flexDirection: 'row',
    height: cx(29),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: cx(15),
    paddingHorizontal: cx(14),
  },

  text: {
    fontSize: cx(12),
    color: '#fff',
  },

  image: {
    width: cx(224),
    height: cx(224),
    borderRadius: cx(112),
  },

  sectionSceneList: {
    height: cy(80),
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: cy(52),
  },

  scrollContent: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  btn: {
    width: SINGLE_SCENE_WIDTH,
    height: cx(80),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  icon: {
    width: cx(56),
    height: cx(56),
    borderRadius: cx(28),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconActive: {
    backgroundColor: '#fff',
  },

  label: {
    marginTop: cy(6),
    fontSize: Math.max(12, cx(12)),
    color: '#fff',
  },
});

export default withTheme(MainSceneView);
