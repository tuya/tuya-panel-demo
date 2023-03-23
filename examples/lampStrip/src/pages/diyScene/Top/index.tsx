import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, TouchableWithoutFeedback, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useDebounceFn } from 'ahooks';
import { Button, Utils, TabBar, Dialog, Collapsible, useTheme } from 'tuya-panel-kit';
import { BlurView } from '@react-native-community/blur';
import useNavigationBack from '@hooks/useNavigationBack';
import useSelector from '@hooks/useSelector';
import MyTopBar from '@components/MyTopBar';
import LottieView from '@components/LottieView';
import Strings from '@i18n';
import Res from '@res';
import Icons from '@res/icons';
import LottiesJSON from '@res/lotties';
import PresetScenes from '@config/default/scene';
import SceneModes from '@config/default/scene/mode';
import DpCodes from '@config/dpCodes';
import { CommonActions } from '@actions';

const { convertX: cx } = Utils.RatioUtils;
const { handlePutScene, handlePutSceneData } = CommonActions;
const { sceneCode } = DpCodes;

interface DiySceneProps {
  isEdit?: boolean;
  sceneData: any;
  setSceneData: (data: any) => void;
}

const DiySceneTop: React.FC<DiySceneProps> = ({ isEdit, sceneData, setSceneData }) => {
  const navigationBack = useNavigationBack();
  const dispatch = useDispatch();

  const { isDarkTheme, themeColor, fontColor, subFontColor, boxBgColor }: any = useTheme();
  const { scene } = useSelector(({ dpState }) => ({
    scene: dpState[sceneCode],
  }));

  const initSceneRef = useRef(scene);
  const previewedRef = useRef(false);
  const [showMoreSceneModes, setShowMoreSceneModes] = useState(false);

  // 取预设情景中对应变化方式的的第一个情景动效
  const lottieKey = useMemo(
    () =>
      (PresetScenes.find(item => item.value.mode === sceneData?.value?.mode) || PresetScenes[0])
        ?.key,
    [sceneData?.value?.mode]
  );

  const handleSceneChange = (key: string) => {
    setSceneData(d => ({
      ...d,
      value: { ...d.value, mode: +key },
    }));
    setShowMoreSceneModes(false);
  };

  const handleShowMoreSceneModes = () => {
    setShowMoreSceneModes(true);
  };

  const handleEditName = () => {
    Dialog.prompt({
      title: Strings.getLang('scene_edit_name'),
      placeholder: Strings.getLang('scene_name_default'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      defaultValue: sceneData.name,
      selectionColor: themeColor,
      underlineColorAndroid: 'transparent',
      onConfirm: (text, { close }) => {
        close();
        if (!text) {
          Dialog.alert({
            title: Strings.getLang('tip_name_empty'),
            confirmText: Strings.getLang('confirm'),
            onConfirm: (__, { close: alertClose }) => {
              alertClose();
            },
          });
        } else {
          setSceneData((data: any) => ({
            ...data,
            name: text.slice(0, 20),
          }));
        }
      },
    });
  };

  const handleClose = () => {
    if (previewedRef.current && initSceneRef.current?.id !== scene.id) {
      dispatch(handlePutSceneData(initSceneRef.current));
    }
    navigationBack();
  };

  const { run: handleSave } = useDebounceFn(
    () => {
      dispatch(handlePutScene(sceneData, isEdit, true));
      navigationBack();
    },
    { wait: 10000, leading: true, trailing: false }
  );

  const handlePreview = () => {
    previewedRef.current = true;
    dispatch(handlePutScene(sceneData, isEdit, false));
  };

  const handleMaskPress = () => {
    setShowMoreSceneModes(false);
  };

  return (
    <>
      {showMoreSceneModes && (
        <TouchableWithoutFeedback onPress={handleMaskPress}>
          <View style={styles.mask} />
        </TouchableWithoutFeedback>
      )}
      <View style={styles.container}>
        {Platform.OS === 'ios' && !showMoreSceneModes ? (
          <BlurView style={StyleSheet.absoluteFill} blurType={isDarkTheme ? 'dark' : 'xlight'} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: boxBgColor }]} />
        )}
        <MyTopBar
          title={Strings.getLang(isEdit ? 'title_edit' : 'title_add')}
          leftActions={[{ source: Strings.getLang('title_cancel'), onPress: handleClose }]}
          actions={[
            {
              source: Strings.getLang('title_save'),
              color: themeColor,
              onPress: handleSave,
            },
          ]}
        />
        <Collapsible duration={showMoreSceneModes ? 300 : 0} collapsed={!showMoreSceneModes}>
          <View style={styles.allSceneModes}>
            {SceneModes.map(item => {
              const isActive = String(sceneData.value.mode) === item.key;
              return (
                <Button
                  key={item.key}
                  style={[
                    styles.tab,
                    {
                      borderColor: isActive ? fontColor : isDarkTheme ? '#393838' : '#A2A2B8',
                      marginBottom: cx(10),
                    },
                  ]}
                  textStyle={{
                    fontSize: cx(16),
                    color: isActive ? fontColor : isDarkTheme ? '#919090' : '#A2A2B8',
                  }}
                  text={item.title}
                  onPress={() => handleSceneChange(item.key)}
                />
              );
            })}
          </View>
        </Collapsible>
        {!showMoreSceneModes && (
          <View style={styles.content}>
            {LottiesJSON[lottieKey] ? (
              <LottieView
                autoPlay={true}
                loop={true}
                style={styles.lottieView}
                source={LottiesJSON[lottieKey]}
              />
            ) : (
              <Image source={Res.scene_preview} style={styles.sceneLight} />
            )}
            <View style={styles.contentContainer}>
              <View style={styles.contentTopContainer}>
                <TabBar
                  style={styles.tabBar}
                  wrapperStyle={{ paddingLeft: cx(16) }}
                  underlineStyle={{ backgroundColor: 'transparent' }}
                  tabStyle={[styles.tab, { borderColor: isDarkTheme ? '#393838' : '#A2A2B8' }]}
                  tabActiveStyle={{ borderColor: fontColor }}
                  tabTextStyle={{ fontSize: cx(16), color: isDarkTheme ? '#919090' : '#A2A2B8' }}
                  tabActiveTextStyle={{ color: fontColor }}
                  tabs={SceneModes}
                  activeKey={String(sceneData.value.mode)}
                  onChange={handleSceneChange}
                />
                <Image
                  style={[
                    styles.tabBarMask,
                    {
                      tintColor:
                        Platform.OS === 'ios' ? (isDarkTheme ? '#181717' : '#f4f6f9') : boxBgColor,
                    },
                  ]}
                  pointerEvents="none"
                  source={Res.more_mask}
                />
                <Button
                  image={Res.more}
                  size={cx(30)}
                  iconSize={cx(14)}
                  imageColor={fontColor}
                  onPress={handleShowMoreSceneModes}
                />
              </View>
              <View style={styles.contentBottomContainer}>
                <Button
                  wrapperStyle={[{ width: 'auto' }]}
                  textStyle={{ color: fontColor, fontSize: cx(15) }}
                  textDirection="left"
                  text={sceneData.name}
                  iconPath={Icons.edit}
                  iconColor={subFontColor}
                  iconSize={cx(17)}
                  onPress={handleEditName}
                />
                <Button
                  wrapperStyle={[
                    {
                      width: 'auto',
                      height: cx(30),
                      paddingHorizontal: cx(14),
                      borderRadius: cx(15),
                      backgroundColor: isDarkTheme ? themeColor : '#ECF1FF',
                    },
                  ]}
                  textStyle={{
                    color: isDarkTheme ? fontColor : themeColor,
                    fontWeight: 'bold',
                    fontSize: cx(14),
                    marginRight: cx(5),
                  }}
                  textDirection="left"
                  text={Strings.getLang('scene_preview')}
                  image={Res.preview}
                  imageColor={isDarkTheme ? fontColor : themeColor}
                  onPress={handlePreview}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mask: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.6)',
  },
  container: {
    position: 'absolute',
    top: 0,
    width: '100%',
    borderBottomLeftRadius: cx(12),
    borderBottomRightRadius: cx(12),
    overflow: 'hidden',
  },
  allSceneModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: cx(30), // 解决Collapsible高度挤压导致的内容挤压
    paddingTop: cx(8),
    paddingLeft: cx(16),
    paddingBottom: cx(6),
  },
  content: {
    marginTop: cx(8),
  },
  contentContainer: {
    marginBottom: cx(82),
  },
  contentTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: cx(8),
  },
  contentBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: cx(16),
    marginTop: cx(27),
  },
  tabBar: {
    backgroundColor: 'transparent',
    flex: 1,
    marginRight: cx(10),
  },
  tab: {
    backgroundColor: 'transparent',
    width: 'auto',
    borderWidth: cx(1),
    borderRadius: cx(15),
    height: cx(30),
    marginRight: cx(8),
    paddingHorizontal: cx(8),
  },
  tabBarMask: {
    position: 'absolute',
    right: 0,
    width: cx(70),
    height: cx(30),
    resizeMode: 'stretch',
  },
  lottieView: {
    position: 'absolute',
    bottom: cx(3),
    alignSelf: 'center',
    height: cx(96),
  },
  sceneLight: {
    position: 'absolute',
    bottom: cx(30),
    alignSelf: 'center',
    width: cx(287),
    height: cx(20),
    resizeMode: 'stretch',
  },
});

export default DiySceneTop;
