/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, Animated, Keyboard, Easing } from 'react-native';
import { Utils, TYText, TopBar } from 'tuya-panel-kit';
// @ts-ignore
import Stepper from '@components/stepper';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import { dpCodes } from '@config';
import color from 'color';
import Strings from '@i18n';
import LightAnimationView from '@components/lightAnimationView';
import { useDispatch } from 'react-redux';
import { actions, useSelector } from '@models';

const { withTheme } = Utils.ThemeUtils;
const Screen = Dimensions.get('screen');
const { lightLengthSetCode, workModeCode } = dpCodes;
const { convertX: cx } = Utils.RatioUtils;
interface Props {
  nums: number;
  // eslint-disable-next-line react/require-default-props
  theme?: any;
}
const SetLampNums: React.FC<Props> = props => {
  const { theme, nums } = props;
  const dispatch = useDispatch();
  const { viewHeigth, heigthWidhtRatio, isShowSetLampNums, workMode, number } = useSelector(
    ({ uiState, dpState }) => {
      return {
        viewHeigth: uiState.viewHeight,
        heigthWidhtRatio: uiState.heigthWidhtRatio,
        isShowSetLampNums: uiState.isShowSetLampNums,
        workMode: dpState[workModeCode],
        number: dpState[lightLengthSetCode],
      };
    }
  );
  const {
    global: { themeColor },
  } = theme;
  const disableColor = `rgba(${color(themeColor).red()},${color(themeColor).green()},${color(
    themeColor
  ).blue()}, 0.4)`;
  const [lampNums, setLampNums] = useState(nums);
  const [keyBordHeight, setKeyBordHeight] = useState(0);
  const [topOffset, setTopOffset] = useState(
    (viewHeigth - keyBordHeight - cx(380) - TopBar.height) / 2
  );
  const topOffsetRef = useRef(new Animated.Value(topOffset)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.95)).current;

  const handleAnimated = (name: any, value: number, speed: number) => {
    Animated.timing(name, {
      toValue: value,
      duration: speed,
      easing: Easing.linear,
    }).start();
  };

  useEffect(() => {
    handleAnimated(opacity, isShowSetLampNums ? 1 : 0, 300);
    handleAnimated(scaleValue, 1, 300);
  }, []);

  useEffect(() => {
    setTopOffset(
      heigthWidhtRatio < 1.75 && keyBordHeight !== 0
        ? -cx(80)
        : (viewHeigth - keyBordHeight - cx(380) - TopBar.height) / 2
    );
  }, [keyBordHeight]);

  useEffect(() => {
    handleAnimated(topOffsetRef, topOffset, 200);
  }, [topOffset]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', e => handleBord(e.endCoordinates.height, true));
    Keyboard.addListener('keyboardDidHide', () => handleBord(0, true));
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      Keyboard.removeListener('keyboardDidShow', () => {});
      Keyboard.removeListener('keyboardDidHide', () => handleBord(0, true));
      clearTimeout(timeId1);
    };
  }, []);

  const handleBord = (v: number, flag: boolean) => {
    if (flag) {
      setKeyBordHeight(v);
    }
  };

  let timeId1 = 0;
  const handlePress = () => {
    const n = parseInt(String(lampNums), 10);
    if (n > 200 || n < 20) {
      handleAnimated(opacity, 0, 300);

      timeId1 = setTimeout(() => {
        dispatch(actions.common.updateUi({ isShowSetLampNums: false }));
      }, 300);
    } else {
      handleAnimated(opacity, 0, 300);
      timeId1 = setTimeout(() => {
        dispatch(actions.common.updateUi({ isShowSetLampNums: false }));
      }, 300);
      if (number === lampNums) {
        return;
      }
      if (workMode === 'colour') {
        dragon.putDpData(
          {
            [lightLengthSetCode]: n,
          },
          { checkCurrent: false, useThrottle: false, clearThrottle: true }
        );
      } else {
        dragon.putDpData(
          {
            [lightLengthSetCode]: n,
            [workModeCode]: 'colour',
          },
          { checkCurrent: false, useThrottle: false, clearThrottle: true }
        );
      }
    }
  };

  return (
    <Animated.View style={styles.root}>
      <Animated.View
        style={[
          styles.content,
          {
            top: topOffsetRef,
            opacity,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <LightAnimationView />
        <TYText style={styles.title} text={Strings.getLang('set_lamp_tip')} />
        <TYText text={Strings.getLang('lamp_nums_tip')} style={styles.subTitle} />
        <Stepper
          style={styles.stepper}
          disabledColor={disableColor}
          buttonStyle={[
            styles.stepperBtn,
            {
              backgroundColor: themeColor,
            },
          ]}
          autoFocus={false}
          min={20}
          max={200}
          selectionColor={themeColor}
          inputStyle={{ width: cx(50) }}
          value={lampNums}
          stepValue={1}
          ellipseIconColor="#FFFFFF"
          onValueChange={(value: React.SetStateAction<number>) => {
            setLampNums(value);
          }}
          editable={true}
        />
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.confirmButton, { backgroundColor: themeColor }]}
        >
          <TYText text={Strings.getLang('determine')} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 10,
    width: Screen.width,
    height: Screen.height,
    alignItems: 'center',
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    width: cx(327),
    minHeight: cx(380),
    borderRadius: cx(20),
    backgroundColor: '#FFFFFF',
    paddingBottom: cx(34),
    paddingTop: cx(38),
    paddingHorizontal: cx(24),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  confirmButton: {
    width: '100%',
    height: cx(48),
    borderRadius: cx(24),
    paddingHorizontal: cx(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepper: {
    marginBottom: cx(24),
    width: '100%',
    height: cx(58),
    borderRadius: cx(29),
    paddingHorizontal: cx(16),
    backgroundColor: 'rgba(235,246,255,1)',
  },
  title: {
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: cx(32),
    marginBottom: cx(8),
    color: '#000',
  },
  subTitle: {
    marginBottom: cx(24),
    textAlign: 'center',
    color: '#a0a0a0',
  },
  stepperBtn: {
    width: cx(88),
    height: cx(48),
    borderRadius: cx(24),
    marginHorizontal: cx(4),
  },
});
export default withTheme(SetLampNums);
