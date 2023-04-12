import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Utils } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import color from 'color';
import { DimmerMode, DimmerTab, DimmerValue, SmearMode } from '@types';
import DimmerBox from '@components/DimmerBox';
import useSelector from '@hooks/useSelector';
import { CommonActions } from '@actions';
import DpCodes from '@config/dpCodes';
import Lights from './Lights';
import Operations from './Operations';

const { handleDimmerModeChange, handleDimmerValueChange } = CommonActions;
const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { powerCode } = DpCodes;

const Mask: React.FC = () => {
  const { background }: any = useTheme();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { backgroundColor: color(background).alpha(0.6).rgbString() },
      ]}
    />
  );
};

const Dimmer: React.FC = () => {
  const dispatch = useDispatch();

  const { isDarkTheme, boxBgColor }: any = useTheme();
  const { power, smearMode, dimmerMode, dimmerValue } = useSelector(({ dpState, uiState }) => ({
    power: dpState[powerCode],
    smearMode: uiState.smearMode,
    dimmerMode: uiState.dimmerMode,
    dimmerValue: uiState.dimmerValue,
  }));

  const handleTabChange = (tab: DimmerTab) => {
    dispatch(handleDimmerModeChange(DimmerMode[tab]));
  };

  const handleColorChange = (data: DimmerValue) => {
    dispatch(handleDimmerValueChange(data));
  };

  return (
    <View style={styles.container}>
      <Lights style={styles.lights} />
      <Operations />
      {!power && <Mask />}
      <DimmerBox
        style={[styles.dimmerBox, { borderBottomColor: isDarkTheme ? '#2E2E2E' : '#EEEEEE' }]}
        background={boxBgColor}
        disabled={smearMode === SmearMode.clear}
        powerOff={!power}
        blured={true}
        tab={DimmerMode[dimmerMode] as DimmerTab}
        onTabChange={handleTabChange}
        value={dimmerValue}
        onChange={handleColorChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: isIphoneX ? cx(105) : cx(75),
  },
  lights: {
    flex: 1,
  },
  dimmerBox: {
    height: cx(266),
    borderBottomWidth: cx(1),
  },
});

export default Dimmer;
