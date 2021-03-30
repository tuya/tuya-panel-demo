import color from 'color';
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYSdk, TabBar } from 'tuya-panel-kit';
import { useSelector } from '@models';
import { lampPutDpData } from '@api';
import { WORKMODE } from '@config';
import { actions } from '../../../models/modules/common';
import SupportUtils from '../../../utils/support';
import Strings from '../../../i18n';
import DpCodes from '../../../config/dpCodes';
import MainWhiteView from './main-white-view';
import MainColourView from './main-colour-view';
import MainSceneView from './main-scene-view';
import MainMusicView from './main-music-view';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { powerCode, workModeCode } = DpCodes;
const { isSupportWhite, isSupportColour, isSupportScene, isSupportMusic } = SupportUtils;

interface HomeMainViewProps {
  theme?: any;
}

const HomeMainView: React.FC<HomeMainViewProps> = ({
  theme: {
    global: { themeColor, fontColor },
  },
}) => {
  const led = useSelector(state => state.dpState[powerCode]);
  const ledMode = useSelector(state => state.dpState[workModeCode]) as string;
  const supportOption = useRef({
    white: isSupportWhite(),
    colour: isSupportColour(),
    scene: isSupportScene(),
    music: isSupportMusic(),
  });

  const generateTabRange = () => {
    const { range = [] } = TYSdk.device.getDpSchema(workModeCode);
    const tabRangs = range
      .map((code: string) => ({
        key: code,
        title: Strings.getDpLang(workModeCode, code),
      }))
      .filter(item => !!supportOption.current[item.key]);

    return tabRangs;
  };

  const handleTabChange = (key: string) => {
    if (key !== ledMode) {
      if (ledMode === WORKMODE.MUSIC) {
        // 如果前一个是音乐模式，则直接更新模式，以做到取消音乐dp的监听
        actions.updateDp({
          [workModeCode]: key,
        });
      }

      lampPutDpData({ [workModeCode]: key });
    }
  };

  const renderTab = () => {
    return (
      <View style={[styles.sectionTab, { borderColor: color(themeColor).alpha(0.3).rgbString() }]}>
        <View>
          <TabBar
            style={{ backgroundColor: 'transparent' }}
            tabStyle={{ backgroundColor: 'transparent' }}
            tabTextStyle={[styles.textTab, { color: fontColor }]}
            activeKey={ledMode}
            tabs={generateTabRange()}
            onChange={handleTabChange}
          />
        </View>
      </View>
    );
  };

  const renderView = () => {
    // 三路灯下，群组、虚拟设备及调试助手默认值为white的问题
    let workMode = ledMode;
    if (
      ledMode === WORKMODE.WHITE &&
      supportOption.current.colour &&
      !supportOption.current.white
    ) {
      workMode = WORKMODE.COLOUR;
    }
    let el = <View />;
    switch (workMode) {
      case WORKMODE.WHITE:
        if (supportOption.current.white) el = <MainWhiteView />;
        break;
      case WORKMODE.COLOUR:
        if (supportOption.current.colour) el = <MainColourView />;
        break;
      case WORKMODE.SCENE:
        if (supportOption.current.scene) el = <MainSceneView />;
        break;
      case WORKMODE.MUSIC:
        if (supportOption.current.music) el = <MainMusicView />;
        break;
      default:
        break;
    }

    return el;
  };

  return (
    <View style={styles.container}>
      {workModeCode && renderTab()}
      {renderView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  sectionTab: {
    width: '100%',
    backgroundColor: 'transparent',
    height: cx(40),
    borderBottomWidth: 1,
    alignItems: 'center',
  },

  textTab: {
    fontSize: cx(12),
    textAlign: 'center',
  },
});

export default withTheme(HomeMainView);
