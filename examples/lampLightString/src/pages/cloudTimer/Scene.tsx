/* eslint-disable import/no-unresolved */
import React, { FC } from 'react';
import Scene from '@components/SceneComponent';
import { StackNavigationProp } from '@react-navigation/stack';
import { RgbSceneData } from '@types';

interface SceneViewProps {
  navigation: StackNavigationProp<any>;
  route: any;
}
const SceneView: FC<SceneViewProps> = ({
  navigation,
  route: {
    params: { rgbSceneValue, onSave },
  },
}) => {
  const handleSave = (data: RgbSceneData) => {
    onSave(data);
  };

  return (
    <Scene
      navigation={navigation}
      onSave={handleSave}
      isCloudScene={true}
      sceneValue={rgbSceneValue}
    />
  );
};

export default SceneView;
