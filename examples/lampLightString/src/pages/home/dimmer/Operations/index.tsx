/* eslint-disable import/no-unresolved */
import React from 'react';
import { View } from 'react-native';
import DpCodes from '@config/dpCodes';
import { BtnItemType, SmearMode } from '@types';
import Icons from '@res/iconfont';
import { Utils } from 'tuya-panel-kit';
import { CommonActions } from '@actions';
import { connect } from 'react-redux';
import BtnGroup from './buttonGroup';
import NumsBtn from './NumsBtn';

const { powerCode, smearCode, colourCode } = DpCodes;
const { updateUi } = CommonActions;
const { convertX: cx } = Utils.RatioUtils;
interface Props {
  nums: number;
  smearMode: number;
  dispatch: any;
  smearDisable: boolean;
}

const Operations: React.FC<Props> = props => {
  const { nums, smearMode, dispatch, smearDisable } = props;
  // 选择涂抹模式的按钮
  const smearBtnGroups: BtnItemType[] = [
    { value: SmearMode[0], icon: Icons.all, smearDisable },
    { value: SmearMode[1], icon: Icons.single, smearDisable },
    { value: SmearMode[2], icon: Icons.clear, smearDisable },
  ];
  const handlePress = () => {
    dispatch(updateUi({ isShowSetLampNums: true }));
  };

  return (
    <View
      style={{
        width: '100%',
        height: cx(38),
        paddingHorizontal: cx(16),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: cx(16),
      }}
    >
      <BtnGroup value={smearBtnGroups[smearMode].value} dataSource={smearBtnGroups} />
      <NumsBtn nums={nums} onPress={handlePress} />
    </View>
  );
};
export default connect(({ dpState, uiState }: any) => ({
  power: dpState[powerCode],
  smearData: dpState[smearCode],
  colourData: dpState[colourCode],
  smearMode: uiState.smearMode,
}))(Operations);
