/* eslint-disable prettier/prettier */
import React, { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SwitchButton, TYListItem, useTheme, Utils } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import Strings from '@i18n';
import useSelector from '@hooks/useSelector';
import Icons from '@res/icons';
import DpCodes from '@config/dpCodes';
import { CommonActions } from '@actions';

const { convertX: cx } = Utils.RatioUtils;
const { handlePutCountdown } = CommonActions;
const { powerCode, countdownCode } = DpCodes;

const Countdown: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { isDarkTheme, themeColor, fontColor, boxBgColor }: any = useTheme();
  const { power, countdown } = useSelector(({ dpState }) => ({
    power: dpState[powerCode],
    countdown: dpState[countdownCode],
  }));

  const handlePress = () => {
    navigation.navigate('countdown', { contentType: +!!countdown });
  };

  const handleCountdownSwitch = (v: boolean) => {
    if (v) {
      navigation.navigate('countdown', { contentType: 0 });
    } else {
      dispatch(handlePutCountdown(0));
    }
  };

  const countdownData = useMemo(() => {
    const time = moment.duration(countdown || 0, 'seconds');
    return [time.days() * 24 + time.hours(), time.minutes(), time.seconds()];
  }, [countdown]);

  return (
    <TYListItem
      theme={{
        cellBg: boxBgColor,
        cellRadius: cx(16),
        margin: [cx(16), cx(16), cx(16), cx(16)],
      }}
      styles={{ content: { height: cx(88) } }}
      Icon={Icons.countdown}
      iconSize={cx(24)}
      iconColor={isDarkTheme ? fontColor : themeColor}
      title={Strings.getLang('title_countdown')}
      subTitle={
        countdown
          ? Strings.formatValue(
            power ? 'info_countdown_close' : 'info_countdown_open',
            ...countdownData
          )
          : undefined
      }
      Action={<SwitchButton value={!!countdown} onValueChange={handleCountdownSwitch} />}
      onPress={handlePress}
    />
  );
};

export default Countdown;
