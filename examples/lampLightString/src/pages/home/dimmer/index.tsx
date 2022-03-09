/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DpCodes from '@config/dpCodes';
import { connect } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { ISmearData } from '@types';
import DimmerBox from './DimmerBox';
import Operations from './Operations';
import Lights from './Lights';

const { smearCode, lightLengthSetCode } = DpCodes;
interface Props {
  smearData: ISmearData;
  lightLength: number;
  smearMode: number;
  effect: number;
  navigation: StackNavigationProp<any>;
}
const ColourView: React.FC<Props> = props => {
  const { smearData, lightLength } = props;
  const [lightNums, setLightNums] = useState(lightLength);
  const [smearDisable, setSmearDisable] = useState(false);

  const handleTabChanged = (value: 'color' | 'dynamic') => {
    setSmearDisable(value !== 'color');
  };
  useEffect(() => {
    setLightNums(lightLength);
  }, [lightLength]);

  return (
    <View style={{ justifyContent: 'center' }}>
      <Lights />
      <Operations nums={lightNums} smearDisable={smearDisable} />
      <DimmerBox dimmerTabChanged={handleTabChanged} />
    </View>
  );
};

export default connect(({ dpState, uiState }: any) => ({
  smearData: dpState[smearCode],
  lightLength: dpState[lightLengthSetCode],
  smearMode: uiState.smearMode,
  effect: uiState.effect,
}))(ColourView);
