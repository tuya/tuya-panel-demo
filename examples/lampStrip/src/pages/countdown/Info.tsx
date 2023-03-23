/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Utils, TYText, BrickButton, useTheme } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { usePersistFn } from 'ahooks';
import useSelector from '@hooks/useSelector';
import CountdownClock from '@components/CountdownClock';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';
import { CommonActions } from '@actions';

const { convertX: cx } = Utils.RatioUtils;
const { handlePutCountdown } = CommonActions;
const { powerCode, countdownCode } = DpCodes;

interface CountdownSetProps {
  style: StyleProp<ViewStyle>;
  setContentType: (type: number) => void;
}

const CountdownInfo: React.FC<CountdownSetProps> = ({ style = {}, setContentType }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { isDarkTheme, themeColor, subPageBoxBgColor }: any = useTheme();
  const { power, countdown, totalCountdown } = useSelector(({ dpState, cloudState }) => ({
    power: dpState[powerCode],
    countdown: dpState[countdownCode],
    totalCountdown: cloudState.totalCountdown,
  }));

  const handleReset = usePersistFn(() => {
    setContentType(0);
  });

  const handleCloseCountdown = () => {
    dispatch(handlePutCountdown(0));
    navigation.goBack();
  };

  useEffect(() => {
    countdown === 0 && handleReset();
  }, [countdown]);

  return (
    <View style={[styles.container, style]}>
      <TYText style={styles.subTitle}>
        {Strings.getLang(power ? 'title_countdown_info_off' : 'title_countdown_info_on')}
      </TYText>
      <CountdownClock
        style={{ flex: 1 }}
        countdown={countdown}
        totalCountDown={totalCountdown}
        onReset={handleReset}
        lineHeight={5}
        lineNum={100}
        lineColor="rgba(255,255,255,.05)"
        innerBackgroundColor="rgba(255,255,255,.02)"
        showDot={false}
        timeTextStyle={{ marginTop: cx(36) }}
        resetStyle={{ marginTop: cx(23) }}
      />
      <BrickButton
        style={styles.saveBtn}
        theme={{ fontSize: cx(16), bgColor: isDarkTheme ? subPageBoxBgColor : themeColor }}
        text={Strings.getLang('countdown_turn_off')}
        onPress={handleCloseCountdown}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  subTitle: {
    position: 'absolute',
    top: 0,
    color: '#999',
    fontSize: cx(12),
  },
  saveBtn: {
    alignSelf: 'center',
  },
});

export default CountdownInfo;
