import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SceneDataType } from '@types';
import SceneModes from '@config/default/scene/mode';
import Strings from '@i18n';
import Top from './Top';
import Content from './Content';

interface DiySceneParams {
  isEdit?: boolean;
  sceneData?: SceneDataType;
  onRemove: () => void;
}

const DiyScene: React.FC = () => {
  const {
    isEdit,
    sceneData: sourceSceneData,
    onRemove,
  } = (useRoute().params as DiySceneParams) || {};

  const [sceneData, setSceneData] = useState<SceneDataType>(
    sourceSceneData || {
      id: 0,
      name: Strings.getLang('scene_name_default'),
      value: { ...SceneModes[0].value, id: 0 },
    }
  );

  return (
    <View style={styles.container}>
      <Content
        isEdit={isEdit}
        sceneData={sceneData}
        setSceneData={setSceneData}
        onRemove={onRemove}
      />
      <Top isEdit={isEdit} sceneData={sceneData} setSceneData={setSceneData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DiyScene;
