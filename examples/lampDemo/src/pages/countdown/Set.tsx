import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Utils, TYText, BrickButton } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import useSelector from '@hooks/useSelector';
import CountdownPicker from '@components/CountdownPicker';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';
import * as TaskManager from '@utils/taskManager';
import { CommonActions } from '@actions';

const { convertX: cx } = Utils.RatioUtils;
const { handlePutCountdown } = CommonActions;
const { powerCode, countdownCode } = DpCodes;

interface CountdownSetProps {
  style?: StyleProp<ViewStyle>;
}

const CountdownSet: React.FC<CountdownSetProps> = ({ style }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { power, countdown } = useSelector(({ dpState }) => ({
    power: dpState[powerCode],
    countdown: dpState[countdownCode],
  }));

  const defaultCountdown = Math.max(1, countdown);
  const [curCountdown, setCurCountdown] = useState<number>(defaultCountdown);

  const handleCountdownChange = (v: number) => {
    setCurCountdown(v);
  };

  const handleSave = () => {
    // 互斥校验
    const taskType = TaskManager.TaskType.COUNTDOWN;
    const [isCheck, checkData] = TaskManager.check(curCountdown, taskType, 'second');
    if (isCheck) {
      TaskManager.showTip(checkData);
      return;
    }
    dispatch(handlePutCountdown(curCountdown));
    navigation.goBack();
  };

  return (
    <View style={[styles.container, style]}>
      <TYText style={styles.subTitle}>
        {Strings.getLang(power ? 'title_countdown_set_off' : 'title_countdown_set_on')}
      </TYText>
      <CountdownPicker
        style={{ flex: 1 }}
        defaultValue={defaultCountdown}
        onChange={handleCountdownChange}
      />
      <BrickButton
        style={styles.saveBtn}
        theme={{ fontSize: cx(16) }}
        text={Strings.getLang('title_save')}
        disabled={!curCountdown}
        onPress={handleSave}
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

export default CountdownSet;
