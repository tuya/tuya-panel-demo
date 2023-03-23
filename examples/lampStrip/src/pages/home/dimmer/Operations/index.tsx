import React, { FC, useMemo } from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@actions';
import useSelector from '@hooks/useSelector';
import { DimmerMode, SmearMode } from '@types';
import Res from '@res';
import Icons from '@res/icons';
import DpCodes from '@config/dpCodes';
import { dimmerModeSmeaModeMaps } from '@config/default';
import BtnGroup, { BtnItemType } from './BtnGroup';

const { convertX: cx } = Utils.RatioUtils;
const { updateUI, handleSmearEffectSwitch } = CommonActions;
const { smearCode } = DpCodes;

interface OperationsProps {
  style?: StyleProp<ViewStyle>;
}

const Operations: FC<OperationsProps> = ({ style }) => {
  const dispatch = useDispatch();

  const { gradient, dimmerMode, smearMode, afterSmearAll, afterSmearAllWhite } = useSelector(
    ({ dpState, uiState }) => ({
      gradient: dpState[smearCode]?.effect === 1,
      dimmerMode: uiState.dimmerMode,
      smearMode: uiState.smearMode,
      afterSmearAll: uiState.afterSmearAll,
      afterSmearAllWhite: uiState.afterSmearAllWhite,
    })
  );

  const handleSmearBtnPress = (value: keyof typeof SmearMode) => {
    dispatch(updateUI({ smearMode: SmearMode[value] }));
  };

  const handleGradientBtnPress = (value: string) => {
    if (value === 'gradient') dispatch(handleSmearEffectSwitch());
  };

  const smearBtnGroups: BtnItemType[] = useMemo(
    () =>
      [
        { value: SmearMode[0], icon: Icons.all },
        { value: SmearMode[1], icon: Icons.single, disabled: afterSmearAllWhite },
        { value: SmearMode[2], icon: Icons.clear },
      ].filter(
        item =>
          !item.hidden &&
          dimmerModeSmeaModeMaps[dimmerMode]?.includes(
            SmearMode[item.value as keyof typeof SmearMode]
          )
      ),
    [dimmerMode, afterSmearAllWhite]
  );

  const gradientBtnBtnGroups: BtnItemType[] = useMemo(
    () =>
      [
        {
          value: 'gradient',
          image: Res.gradientBtn,
          disabled: afterSmearAll,
          hidden: dimmerMode === DimmerMode.white,
        },
      ].filter(item => !item.hidden),
    [dimmerMode, afterSmearAll]
  );

  return (
    <View style={[styles.container, style]}>
      <BtnGroup
        value={SmearMode[smearMode]}
        dataSource={smearBtnGroups}
        onChange={handleSmearBtnPress}
      />
      <BtnGroup
        style={styles.group}
        value={gradient ? 'gradient' : ''}
        dataSource={gradientBtnBtnGroups}
        onChange={handleGradientBtnPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    height: cx(38),
    marginBottom: cx(12),
    marginRight: cx(12),
  },
  group: {
    marginLeft: cx(8),
  },
});

export default Operations;
