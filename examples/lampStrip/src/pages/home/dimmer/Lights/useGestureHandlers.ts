import React, { useRef } from 'react';
import { PanResponder, GestureResponderEvent, GestureResponderHandlers } from 'react-native';
import { useDispatch } from 'react-redux';
import { TopBar } from 'tuya-panel-kit';
import _ from 'lodash';
import { useCreation, usePersistFn } from 'ahooks';
import useSelector from '@hooks/useSelector';
import { subtract } from '@utils';
import { CommonActions } from '@actions';
import DpCodes from '@config/dpCodes';
import { SmearMode, DimmerMode } from '@types';
import { UIRefPropType } from './UI/interface';

const { handlePressLights } = CommonActions;
const { powerCode } = DpCodes;

interface HandlersType {
  handlers: GestureResponderHandlers;
  uiRef: React.Ref<UIRefPropType>;
}

export default function useGestureHandlers(): HandlersType {
  const dispatch = useDispatch();
  const uiRef = useRef<UIRefPropType>(null);

  const indexDep = useCreation(() => new Set<number>(), []);

  const { power, smearMode, dimmerMode } = useSelector(({ dpState, uiState }) => ({
    power: dpState[powerCode],
    smearMode: uiState.smearMode,
    dimmerMode: uiState.dimmerMode,
  }));

  const handlePress = usePersistFn((e: GestureResponderEvent, isSave = false) => {
    // Only when the light, color light, color TAB is turned on, and the operation is to smear, eraser, click the light band will update the color
    if (
      !(
        power &&
        [SmearMode.single, SmearMode.clear].includes(smearMode) &&
        [DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode)
      )
    )
      return;
    const { pageX, pageY } = e.nativeEvent;
    const { UIData } = uiRef.current!;
    const { x: uiPageX = 0, y: uiPageY = 0 } = uiRef.current!.layout!;
    const p = [subtract(pageX, uiPageX), subtract(pageY, TopBar.height, uiPageY)];
    const index = UIData.findIndex(
      ({ width, height, pos }) =>
        p[0] >= pos[0] && p[0] <= pos[0] + width && p[1] >= pos[1] && p[1] <= pos[1] + height
    );
    if (index > -1) indexDep.add(index);
    if (indexDep.size) dispatch(handlePressLights({ indexs: indexDep }, isSave));
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
