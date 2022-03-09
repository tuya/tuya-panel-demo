/* eslint-disable import/no-unresolved */
/* eslint-disable react/require-default-props */
import React, { useState, FC, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableWithoutFeedback } from 'react-native';
import _ from 'lodash';
import { TYText, Utils } from 'tuya-panel-kit';
import DpCodes from '@config/dpCodes';
import Strings from '@i18n';
import _scenes from '@config/default/scenes';
import { RgbSceneData, RgbSceneValue } from '@types';
import { useSelector } from '@models';
import useTheme from '@hooks/useTheme';
import CustomTopBar from '@components/CustomTopBar';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { StackNavigationProp } from '@react-navigation/stack';
import SceneItem from './SceneItem';

const { convertX: cx, width: winWidth, isIphoneX } = Utils.RatioUtils;
const { rgbSceneCode, workModeCode } = DpCodes;

interface SceneViewProps {
  navigation: StackNavigationProp<any>;
  isCloudScene: boolean;
  sceneValue?: RgbSceneValue;
  onSave?: (data: RgbSceneData) => void;
}

const titleArr = [
  { value: 'collection', key: 'collection', title: Strings.getLang('collection') },
  { value: 'scenery', key: 'scenery', title: Strings.getLang('scenery') },
  { value: 'life', key: 'life', title: Strings.getLang('life') },
  { value: 'festival', key: 'festival', title: Strings.getLang('festival') },
  { value: 'mood', key: 'mood', title: Strings.getLang('mood') },
];
const keyList = ['collection', 'scenery', 'life', 'festival', 'mood'];

const SceneView: FC<SceneViewProps> = ({ navigation, isCloudScene, sceneValue, onSave }) => {
  const {
    global: { isDefaultTheme },
  } = useTheme();

  const { collectedIds } = useSelector(({ cloudState }: any) => ({
    collectedIds: cloudState.collectedSceneIds,
  }));

  const [scenes, setScenes] = useState(_scenes);
  const [currentSection, setCurrentSection] = useState('scenery');
  const [cloudSelect, setCloudSelect] = useState(sceneValue?.id || 3);
  const cloudSelectRef = useRef<any>(sceneValue || _scenes[1][0].value);

  useEffect(() => {
    generateCollectedSection();
  }, []);

  useEffect(() => {
    generateCollectedSection(collectedIds);
  }, [collectedIds]);

  const renderTabBar = () => {
    const tabData = collectedIds.length > 0 ? titleArr : titleArr.slice(1, 5);
    return tabData.map(item => {
      const isActive = currentSection === item.key;
      return (
        <TouchableWithoutFeedback
          key={item.key}
          onPress={() => {
            setCurrentSection(item.key);
          }}
        >
          <View style={styles.newTabMain}>
            <TYText
              style={[
                styles.newTabTitle,
                {
                  color: isDefaultTheme ? '#FFF' : '#333',
                },
                isActive && { opacity: 1 },
              ]}
            >
              {item.title}
            </TYText>
            <View
              style={[
                styles.newTabUnderLine,
                isActive && {
                  backgroundColor: isDefaultTheme ? '#FFF' : '#333',
                },
              ]}
            />
          </View>
        </TouchableWithoutFeedback>
      );
    });
  };

  const generateCollectedSection = (updateCollectionIds?: number[]) => {
    let collectedSceneIds: number[] = [];
    if (updateCollectionIds === undefined) {
      collectedSceneIds = collectedIds;
    } else {
      collectedSceneIds = updateCollectionIds;
    }
    if (collectedSceneIds.length === 0) {
      setCurrentSection(currentSection === 'collection' ? 'scenery' : currentSection);
    } else {
      const sceneArr = [..._scenes[1], ..._scenes[2], ..._scenes[3], ..._scenes[4]];
      const collectionArr = sceneArr.filter(sceneItem => {
        return collectedSceneIds.indexOf(sceneItem.sceneId) >= 0;
      });
      _scenes[0] = collectionArr;
      setScenes(_scenes);
    }
  };

  const handlePress = (data: any) => {
    const { value } = data;
    if (isCloudScene) {
      cloudSelectRef.current = value;
      setCloudSelect(data.sceneId);
    } else {
      dragon.putDpData(
        {
          [rgbSceneCode]: value,
          [workModeCode]: WORK_MODE.SCENE,
        },
        {
          updateValidTime: 'syncs',
        }
      );
    }
  };

  const renderListItem = ({ item }: any) => {
    return (
      <SceneItem
        key={item.sceneId}
        data={item}
        isCloudScene={isCloudScene}
        sceneValue={cloudSelect}
        onPressScene={handlePress}
      />
    );
  };
  const renderFooter = () => {
    return <View style={styles.listFooterView} />;
  };

  const handleSave = () => {
    onSave!(cloudSelectRef.current!);
    navigation.goBack();
  };

  const index = keyList.indexOf(currentSection);
  return (
    <View style={styles.main}>
      {isCloudScene && (
        <CustomTopBar
          title={Strings.getLang('timer_scene_title')}
          hasBackIcon={true}
          onBack={() => navigation.goBack()}
          onSave={handleSave}
        />
      )}
      <View style={styles.barContainer}>{renderTabBar()}</View>
      <FlatList
        keyExtractor={item => item.sceneId.toString()}
        data={scenes[index]}
        renderItem={renderListItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnStyle}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    marginTop: cx(12),
  },
  listFooterView: {
    height: isIphoneX ? cx(120) : cx(100),
  },
  newTabMain: {
    marginLeft: cx(16),
    alignSelf: 'center',
  },
  barContainer: {
    width: winWidth,
    height: cx(46),
    flexDirection: 'row',
    marginBottom: cx(16),
  },
  newTabTitle: {
    fontSize: cx(16),
    paddingBottom: cx(8),
    opacity: 0.4,
  },
  newTabUnderLine: {
    position: 'absolute',
    bottom: 0,
    width: cx(12),
    height: cx(2),
    alignSelf: 'center',
    borderRadius: cx(2),
  },
  columnStyle: {
    marginHorizontal: cx(16),
    justifyContent: 'space-between',
  },
});

export default SceneView;
