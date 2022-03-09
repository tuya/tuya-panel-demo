/* eslint-disable import/no-unresolved */
import React, { useState } from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Utils, Button } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { dpCodes } from '@config';
import { CommonActions } from '@actions';
import { BtnItemType } from '@types';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { powerCode, smearCode, colourCode } = dpCodes;
const { updateUi } = CommonActions;
export interface OperationsBtnGroupProps {
  style?: StyleProp<ViewStyle>;
  dataSource?: BtnItemType[];
  value?: string;
  onChange?: (v: string) => void;
  theme?: any;
  dispatch?: any;
}

const OperationsBtnGroup: React.FC<OperationsBtnGroupProps> = props => {
  const { style, dataSource = [], dispatch, theme, value } = props;
  const {
    global: { themeColor, isDefaultTheme },
  } = theme;
  const [currentValue, setCurrentValue] = useState(value);
  return dataSource.length ? (
    <View
      style={[
        styles.container,
        { backgroundColor: isDefaultTheme ? 'rgba(40,49,65,1)' : 'rgba(255,255,255,01)' },
        style,
      ]}
    >
      {dataSource.map((item, index, arr) => {
        const activated = item.value === currentValue;
        const color = activated ? themeColor : isDefaultTheme ? '#fff' : '#7E868D';
        return (
          <Button
            key={item.value}
            style={[arr.length > 1 && { marginLeft: cx(index === 0 ? 8 : 16) }]}
            iconPath={item.icon}
            iconColor={color}
            iconSize={cx(30)}
            disabled={item.smearDisable}
            onPress={() => {
              // 切换涂抹模式时，不下发dp，只更新ui
              dispatch(updateUi({ smearMode: index }));
              setCurrentValue(item.value);
            }}
          />
        );
      })}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: cx(12),
    paddingHorizontal: cx(8),
    paddingVertical: cx(4),
  },
});

export default connect(({ dpState, uiState }: any) => ({
  power: dpState[powerCode],
  smearData: dpState[smearCode],
  smearMode: uiState[smearCode],
  colourData: dpState[colourCode],
}))(withTheme(OperationsBtnGroup));
