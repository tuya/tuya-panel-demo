/* eslint-disable import/no-unresolved */
import React from 'react';
import { View } from 'react-native';
import DpCodes from '@config/dpCodes';
import { useSelector, actions } from '@models';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { ControlTabs } from '@config/default';
import SceneView from '@components/SceneComponent';
import { TYSdk } from 'tuya-panel-kit';
import CustomTopBar from '@components/CustomTopBar';
import { StackNavigationProp } from '@react-navigation/stack';
import ControllerBar from './controllerBar';
import ColourView from './dimmer';
import MainMusicView from './music';
import ScheduleView from './schedule';
import SetLampNums from './dimmer/setLampNums';
import { store } from '../../main';

interface IProps {
  navigation: StackNavigationProp<any>;
}
const { rgbSceneCode, lightLengthSetCode } = DpCodes;

const Home: React.FC<IProps> = ({ navigation }) => {
  const { showTab, lightLength, isShowSetLampNums } = useSelector(({ dpState, uiState }) => {
    return {
      showTab: uiState.showTab,
      lightLength: dpState[lightLengthSetCode],
      isShowSetLampNums: uiState.isShowSetLampNums,
    };
  });
  const isSupportColor = SupportUtils.isSupportColour();
  const isSupportScene = SupportUtils.isSupportDp(rgbSceneCode);
  const isSupportMusic = SupportUtils.isSupportMusic();

  return (
    <View style={{ flex: 1 }}>
      <CustomTopBar
        title={TYSdk.devInfo.name}
        hasBackIcon={true}
        hasSaveIcon={true}
        onBack={() => TYSdk.mobile.back()}
      />
      <View
        style={{ flex: 1 }}
        onLayout={e => {
          store.dispatch(
            actions.common.updateUi({
              viewHeight: e.nativeEvent.layout.height,
              viewWidth: e.nativeEvent.layout.width,
              heigthWidhtRatio: e.nativeEvent.layout.height / e.nativeEvent.layout.width,
            })
          );
        }}
      >
        {isShowSetLampNums && <SetLampNums nums={lightLength} />}
        {showTab === ControlTabs.dimmer && isSupportColor && <ColourView navigation={navigation} />}
        {showTab === ControlTabs.scene && isSupportScene && (
          <SceneView navigation={navigation} isCloudScene={false} />
        )}
        {showTab === ControlTabs.music && isSupportMusic && <MainMusicView />}
        {showTab === ControlTabs.schedule && <ScheduleView navigation={navigation} />}
        <ControllerBar />
      </View>
    </View>
  );
};

export default Home;
