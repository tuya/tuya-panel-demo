/* eslint-disable react/require-default-props */
/* eslint-disable import/no-unresolved */
import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, Utils, IconFont } from 'tuya-panel-kit';
import Strings from '@i18n';
import CustomTopBar from '@components/CustomTopBar';
import { useSelector } from '@models';

const {
  RatioUtils: { convertX: cx, winWidth },
} = Utils;
const weekData = [...new Array(7).keys()].map(i => ({
  key: i,
  name: Strings.getLang(`execute_cycle_custom_week${i}` as any),
}));

interface IProps {
  weeks: number[];
  disabled?: boolean;
  onChange?: (weeks: number[]) => void;
  accessibilityLabel?: string;
  navigation: any;
  route: any;
}
const ExecuteCycle: FC<IProps> = props => {
  const {
    route: {
      params: { weeks, onChange, disabled, accessibilityLabel },
    },
    navigation,
  } = props;
  const weeksIsAllTheSameNumber = (a: number[], num: number) => {
    return a.every((item: number) => item === num);
  };
  const [currWeeks, setCurrWeeks] = useState<number[]>(
    weeksIsAllTheSameNumber(weeks, 1) ? [0, 0, 0, 0, 0, 0, 0] : weeks
  );
  const theme = useSelector(state => state.theme);

  const handleClick = (index: any) => () => {
    const newWeeks = [...currWeeks];
    newWeeks[index] = newWeeks[index] ? 0 : 1;
    setCurrWeeks(newWeeks);
  };
  const handleBack = () => {
    onChange(weeks);
    navigation.goBack();
  };
  const handleSave = () => {
    onChange(currWeeks);
    navigation.goBack();
  };

  const selectedBorder = theme.type === 'dark' ? 'rgba(229,229,229,0.4)' : 'rgba(0,0,0,0.4)';
  const borderBottomColor = theme.type === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const backgroundColor = theme.type === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const mainBackGroundColor = theme.type === 'dark' ? '#1E2436' : '#F0F6F9';
  const tipColor = theme.type === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <View style={[styles.main, { backgroundColor: mainBackGroundColor }]}>
      {/* 头部栏 */}
      <CustomTopBar
        hasBackIcon={true}
        backText=""
        backTextColor={theme.type === 'dark' ? '#FFF' : '#000'}
        onBack={handleBack}
        onSave={handleSave}
        title={Strings.getLang('execute_cycle_custom')}
      />
      {/* 执行周期选择提示 */}
      <TYText style={[styles.executeCycleSelectTip, { color: tipColor }]}>
        {Strings.getLang('execute_cycle_custom_tip')}
      </TYText>
      {/* 渲染执行周期数据 */}
      <View style={[styles.weeks, { backgroundColor }]} accessibilityLabel={accessibilityLabel}>
        {weekData.map(({ key, name }, index) => {
          const isActive = !!currWeeks[key];
          return (
            <TouchableOpacity
              style={{ width: '100%' }}
              disabled={disabled}
              accessibilityLabel={`week_button${key}`}
              key={key}
              onPress={handleClick(key)}
            >
              <View
                style={[
                  styles.week,
                  index === 6 && { borderBottomWidth: 0 },
                  { borderBottomColor },
                ]}
              >
                <TYText style={[styles.weekName]}>{name}</TYText>
                {isActive ? (
                  <IconFont
                    style={styles.icon}
                    name="correct"
                    size={cx(18)}
                    color={theme.global.brand}
                  />
                ) : (
                  <View style={[styles.selectedBorder, { borderColor: selectedBorder }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

ExecuteCycle.defaultProps = {
  disabled: false,
};

export default ExecuteCycle;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
  },
  executeCycleSelectTip: {
    fontSize: cx(12),
    width: winWidth - cx(60),
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  weeks: {
    width: cx(327),
    height: cx(476),
    marginTop: cx(16),
    alignItems: 'center',
    borderRadius: cx(16),
    paddingLeft: cx(24),
  },
  week: {
    width: '100%',
    height: cx(67),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingRight: cx(24),
  },
  weekName: {
    fontSize: cx(14),
  },
  selectedBorder: {
    width: cx(18),
    height: cx(18),
    borderRadius: cx(9),
    borderWidth: 1,
  },
  icon: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: cx(9),
  },
});
