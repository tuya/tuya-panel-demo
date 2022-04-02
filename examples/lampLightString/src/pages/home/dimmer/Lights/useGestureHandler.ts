/* eslint-disable import/no-unresolved */
import React, { useRef } from 'react';
import { PanResponder, GestureResponderEvent, GestureResponderHandlers } from 'react-native';
import { useDispatch } from 'react-redux';
import { TopBar, Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { useCreation, usePersistFn } from 'ahooks';
import { useSelector } from '@models';
import { subtract, formatUiData } from '@utils';
import { CommonActions } from '@actions';
import DpCodes from '@config/dpCodes';
import { UIRefPropType } from './UI/interface';
import { uiData } from './UI/config';

const { convertX: cx } = Utils.RatioUtils;
const { smearCode } = DpCodes;
const { handlePressLights } = CommonActions;
interface HandlersType {
  handlers: GestureResponderHandlers;
  uiRef: React.Ref<UIRefPropType>;
}

export default function useGestureHandlers(): HandlersType {
  const dispatch = useDispatch();
  const uiRef = useRef<UIRefPropType>(null);
  const indexDep = useCreation(() => new Set<number>(), []);
  const _uiData = formatUiData(uiData);

  const { smearMode, dimmerMode, smearData, effect, hue, saturation, value, heigthWidhtRatio } =
    useSelector(({ dpState, uiState }) => ({
      smearMode: uiState.smearMode,
      dimmerMode: uiState.dimmerMode,
      smearData: dpState[smearCode],
      effect: uiState.effect,
      hue: uiState.hue,
      saturation: uiState.saturation,
      value: uiState.value,
      heigthWidhtRatio: uiState.heigthWidhtRatio,
    }));
  const handlePress = usePersistFn((e: GestureResponderEvent, isSave = false) => {
    // 只有在开灯、彩光、静态，并且操作是涂抹、橡皮擦的时候, 点击灯带才会更新颜色
    if (effect > 0 || smearMode === 0) {
      return;
    }
    const { pageX, pageY } = e.nativeEvent; // 基于屏幕的坐标

    const { x: uiPageX = 0, y: uiPageY = 0 } = uiRef.current!.layout!;

    const p = [
      subtract(pageX, uiPageX),
      subtract(pageY, TopBar.height, heigthWidhtRatio < 1.75 ? 8 : cx(39), uiPageY),
    ];

    const index = _uiData.findIndex(
      ({ width, height, pos }) =>
        p[0] >= pos[0] && p[0] <= pos[0] + width && p[1] >= pos[1] && p[1] <= pos[1] + height
    );

    if (index > -1) indexDep.add(index);
    if (indexDep.size) {
      let color = { hue, saturation, value };
      if (smearMode === 2) {
        color = { hue: 0, saturation: 0, value: 0 };
      }
      dispatch(
        handlePressLights(
          {
            ...smearData,
            ...color,
            dimmerMode,
            ledNumber: 30,
            smearMode,
            effect: 0,
            indexs: indexDep,
          },
          isSave
        )
      );
    }
  });

  const panResponder = useCreation(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onPanResponderMove: e => {
          handlePress(e);
        },
        onPanResponderRelease: e => {
          handlePress(e, true);
          indexDep.clear();
        },
      }),
    []
  );

  return { handlers: panResponder.panHandlers, uiRef };
}
