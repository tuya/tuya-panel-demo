import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, Image } from 'react-native';
import { TYText, TYSdk } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { gridFeatureInitData, commonConfig, commonClick } from '@config';

const { cx, smallScreen, middlleScreen, is7Plus } = commonConfig;

const TYDevice = TYSdk.device;

let panelPadding = 28;
if (smallScreen) {
  panelPadding = 4;
} else if (middlleScreen) {
  if (is7Plus) {
    panelPadding = 24;
  } else {
    panelPadding = 10;
  }
}

interface LiveGridProps {}

const LiveGrid: React.FC<LiveGridProps> = (props: LiveGridProps) => {
  const [menuArr, setMenuArr] = useState([]);
  const [hoverMenu, setHoverMenu] = useState('none');
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const dpState = useSelector((state: any) => state.dpState);
  const devInfo = useSelector((state: any) => state.devInfo);
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeContentBgc = customTheme[type].contentBgc;
  const themeFeatureHoverBgc = customTheme[type].contentBgc;
  const themeFeatureNormalTintColor = customTheme[type].featureNormalTintColor;

  useEffect(() => {
    const gridMenu: any = gridFeatureInitData.getGridMenu(
      devInfo.schema,
      ipcCommonState.isSupportedCloudStorage
    );
    setMenuArr(gridMenu);
  }, [ipcCommonState.isSupportedCloudStorage]);

  const panelFeature = (key: string, fatureType: string) => {
    if (fatureType === 'basic') {
      switch (key) {
        case 'generalAlbum':
          commonClick.toggleNativePage('paramAlbum');
          break;
        case 'sd_status':
          commonClick.toggleNativePage('paramPlayBack');
          break;
        case 'cloudStorage':
          commonClick.toggleNativePage('paramCloudBack');
          break;
        case 'telephone_alarm':
          commonClick.callTelephoneAlarm();
          break;
        case 'generalTheme':
          commonClick.changePanelTheme(key);
          break;
        default:
          return false;
      }
    } else if (fatureType === 'switch') {
      const sendValue = !dpState[key];
      if (key === 'basic_private') {
        if (commonClick.isRecordingNow() || commonClick.isMicTalking()) {
          return false;
        }
      }
      TYDevice.putDeviceData({
        [key]: sendValue,
      });
    } else if (fatureType === 'switchDialog') {
      commonClick.savePopDataToRedux(key, dpState[key]);
    } else if (fatureType === 'customDialog') {
      commonClick.saveCustomDialogDataToRedux(key);
    } else if (fatureType === 'switchPage') {
      key === 'rnCustomPage' && commonClick.enterFirstRnPage('customPage');
    }
  };

  const pressInPanel = (key: string) => {
    setHoverMenu(key);
  };

  const pressOutPanel = () => {
    setHoverMenu('none');
  };

  return (
    <View style={[styles.liveGridPage, { backgroundColor: themeContentBgc }]}>
      <ScrollView
        contentContainerStyle={styles.panelViewPage}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        {menuArr.map((item: any) => (
          <TouchableWithoutFeedback
            key={item.key}
            onPress={_.throttle(() => panelFeature(item.key, item.type), 500)}
            onPressIn={() => pressInPanel(item.key)}
            onPressOut={pressOutPanel}
            disabled={!commonClick.getPanelOpacity(item.key)}
          >
            <View
              style={[
                styles.itemBox,
                {
                  paddingVertical: panelPadding,
                  backgroundColor: hoverMenu === item.key ? themeFeatureHoverBgc : 'transparent',
                  opacity: commonClick.getPanelOpacity(item.key) ? 1 : 0.2,
                },
              ]}
            >
              <Image
                source={item.imgSource}
                style={[
                  styles.panelImg,
                  {
                    tintColor: commonClick.getPanelTintColor(item.key, item.type)
                      ? ipcCommonState.panelItemActiveColor
                      : themeFeatureNormalTintColor,
                  },
                ]}
              />
              <View style={styles.panelTextBox}>
                <TYText style={[styles.panelText, { color: themeFeatureNormalTintColor }]}>
                  {item.imgTitle}
                </TYText>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  liveGridPage: {
    flex: 1,
  },
  panelViewPage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemBox: {
    width: '25%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  panelImg: {
    width: cx(40),
    resizeMode: 'contain',
  },
  panelTextBox: {
    marginTop: cx(4),
    width: cx(60),
  },
  panelText: {
    fontSize: cx(12),
    textAlign: 'center',
  },
});

export default LiveGrid;
