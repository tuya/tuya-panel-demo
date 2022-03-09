/* eslint-disable indent */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useRef, useState, FC } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { TYText, Utils, Tabs } from 'tuya-panel-kit';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';
import Color from '@components/ColourSlider';
import { actions, useSelector } from '@models';
import { IColour } from '@types';
import useTheme from '@hooks/useTheme';
import Dynamic from './dynamic';
import { store } from '../../../../main';

const { smearCode } = DpCodes;
const { convertX: cx, width: winWidth, isIphoneX } = Utils.RatioUtils;

interface Props {
  dimmerTabChanged: (value: string) => void;
}

const tabPanleArr = [
  {
    value: 'color',
    title: Strings.getLang('lsv3_color'),
    key: 'color',
  },
  {
    value: 'dynamic',
    title: Strings.getLang('lsv3_dynamic'),
    key: 'dynamic',
  },
];

const DimmerBox: FC<Props> = ({ dimmerTabChanged }) => {
  const { dispatch } = store;
  const {
    global: { isDefaultTheme, themeColor },
  } = useTheme();

  const { smearData, effect, smearMode } = useSelector(({ dpState, uiState }: any) => ({
    smearData: dpState[smearCode],
    effect: uiState.effect,
    smearMode: uiState.smearMode,
  }));

  const [colour, setColour] = useState({
    hue: smearData.hue,
    saturation: smearData.saturation,
    value: smearData.value,
  });

  // 彩光/动态
  const [currentTab, setCurrentTab] = useState(
    effect > 0 ? tabPanleArr[1].key : tabPanleArr[0].key
  );
  // 使用橡皮擦时不可调节彩光
  const [disabled, setDisabled] = useState(smearMode === 2);

  const opacityRef = useRef(new Animated.Value(0)).current;

  const dimmerOpacity = useRef(new Animated.Value(smearMode === 2 ? 0.3 : 1)).current;

  const fadeOutAnimated = (name: any, value: number, duration: number) => {
    Animated.timing(name, {
      toValue: value,
      duration,
      easing: Easing.linear,
    }).start();
  };

  useEffect(() => {
    setDisabled(smearMode === 2);
    fadeOutAnimated(dimmerOpacity, smearMode === 2 ? 0.3 : 1, 300);
  }, [smearMode]);

  useEffect(() => {
    const time = setTimeout(() => {
      fadeOutAnimated(opacityRef, 1, 100);
    }, 100);
    return () => {
      clearTimeout(time);
    };
  }, []);

  useEffect(() => {
    dimmerTabChanged(effect > 0 ? tabPanleArr[1].key : tabPanleArr[0].key);
    setCurrentTab(effect > 0 ? tabPanleArr[1].key : tabPanleArr[0].key);
  }, [effect]);

  useEffect(() => {
    dispatch(actions.common.updateUi({ effect: smearData.effect }));
  }, [smearData]);

  // 为灯串设置动效
  const setDynamic = (value: number) => {
    dispatch(actions.common.updateUi({ effect: value }));
    // @ts-ignore
    dispatch(actions.common.handlePressLights({ ...smearData, effect: value }, true));
  };

  const handleColorChange = (data: any) => {
    dispatch(actions.common.updateUi({ ...data }));
    putSmearData(data, true);
  };

  const handleColorComplete = (data: IColour) => {
    dispatch(actions.common.updateUi({ ...data }));
    putSmearData(data, true);
  };

  const putSmearData = (
    cmd: {
      mode?: number;
      hue: any;
      saturation: any;
      value: any;
      brightness?: number;
      temperature?: number;
    },
    isSave: boolean
  ) => {
    // 当color更新后,smearMode为油漆桶时，更新灯串颜色,
    // 进入面板的时候，如果动效===0，才更新灯带
    if ((smearMode === 0 && effect === 0) || (smearData.effect === 0 && smearMode === 0)) {
      // 更新灯带
      // @ts-ignore
      dispatch(
        actions.common.handleToChangeLights(
          { ...smearData, ...cmd, ledNumber: 30, smearMode: 0, effect: 0 },
          isSave
        )
      );
    }
    setColour({ hue: cmd.hue, saturation: cmd.saturation, value: cmd.value });
  };

  const tabPabes = () => {
    return tabPanleArr.map(tab => {
      return (
        <Tabs.TabPanel key={tab.key}>
          {tab.key === 'color' ? (
            <Color
              isCloud={false}
              dimmerOpacity={dimmerOpacity}
              disabled={disabled}
              data={colour}
              handleChange={handleColorChange}
              handleChangeComplete={handleColorComplete}
            />
          ) : (
            <Dynamic setDynamic={setDynamic} />
          )}
        </Tabs.TabPanel>
      );
    });
  };
  const renderTabBar = () => {
    return tabPanleArr.map(item => {
      const isActive = currentTab === item.key;
      return (
        <TouchableWithoutFeedback
          key={item.key}
          onPress={() => {
            handleTabChange(item.key);
          }}
        >
          <View style={styles.newTabMain}>
            <TYText
              style={[
                styles.newTabTitle,
                {
                  color: isActive
                    ? themeColor
                    : isDefaultTheme
                    ? '#fff'
                    : isDefaultTheme
                    ? '#fff'
                    : '#333',
                },
              ]}
            >
              {item.title}
            </TYText>
            <View
              style={[
                styles.newTabUnderLine,
                isActive && {
                  backgroundColor: isActive
                    ? themeColor
                    : isDefaultTheme
                    ? '#fff'
                    : isDefaultTheme
                    ? '#fff'
                    : '#333',
                },
              ]}
            />
          </View>
        </TouchableWithoutFeedback>
      );
    });
  };
  const handleTabChange = (value: any) => {
    dimmerTabChanged(value);
    setCurrentTab(value);
    dispatch(actions.common.updateUi({ effect: value === 'color' ? 0 : smearData.effect }));
  };

  return (
    <Animated.View
      style={[
        styles.dimmerBox,
        {
          backgroundColor: isDefaultTheme ? 'rgba(40,49,65,1)' : 'rgba(255,255,255,1)',
          opacity: opacityRef,
        },
      ]}
    >
      <Tabs
        dataSource={tabPanleArr}
        // @ts-ignore
        animated={true}
        activeKey={currentTab}
        background="transparent"
        swipeable={false}
        tabBarStyle={{
          borderBottomColor: 'transparent',
        }}
        tabBarUnderlineStyle={{
          backgroundColor: 'transparent',
        }}
      >
        {tabPabes()}
      </Tabs>
      <Animated.View style={styles.barContainer}>{renderTabBar()}</Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dimmerBox: {
    width: '100%',
    height: cx(210) + (isIphoneX ? 110 : 90),
    paddingVertical: cx(24),
    borderTopLeftRadius: cx(24),
    borderTopRightRadius: cx(24),
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: isIphoneX ? cx(110) : cx(90),
  },
  newTabMain: {
    marginLeft: cx(16),
    alignSelf: 'center',
    marginTop: cx(24),
  },
  barContainer: {
    position: 'absolute',
    top: 0,
    width: winWidth,
    flexDirection: 'row',
  },
  newTabTitle: {
    fontSize: cx(16),
    lineHeight: cx(18),
    marginBottom: cx(8),
  },
  newTabUnderLine: {
    position: 'absolute',
    bottom: 0,
    width: cx(12),
    height: cx(2),
    marginTop: cx(8),
    alignSelf: 'center',
    borderRadius: cx(2),
  },
});
export default DimmerBox;
