import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Utils, TYSdk, Popup } from 'tuya-panel-kit';
import throttle from 'lodash/throttle';
import _ from 'lodash';
import color from 'color';
import { useSelector } from '@models';
import Strings from '@i18n';
import { lampPutDpData } from '@api';
import SupportUtils from '../../utils/support';
import DpCodes from '../../config/dpCodes';
import icons from '../../res/iconfont';
import Button from '../../components/Button';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { isSupportCountdown } = SupportUtils;
const { powerCode, countdownCode } = DpCodes;

interface HomeBottomViewProps {
  theme?: any;
}

const HomeBottomView: React.FC<HomeBottomViewProps> = ({
  theme: {
    global: { themeColor, fontColor },
  },
}) => {
  const [isSupportCloudTimer, setIsSupportCloudTimer] = useState(false);
  const power = useSelector(state => state.dpState[powerCode]);
  const countdown = useSelector(state => state.dpState[countdownCode]) as number;

  useEffect(() => {
    TYSdk.devInfo.panelConfig.bic.forEach(i => {
      if (i.code === 'timer' && i.selected) {
        setIsSupportCloudTimer(true);
      }
    });
  }, []);

  const _handleTogglePower = useCallback(
    throttle(() => {
      lampPutDpData({ [powerCode]: !power });
    }, 200),
    [power]
  );

  const formatCountdown = useCallback(() => {
    const time = Math.ceil(countdown / 60);
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const value = `${_.padStart(`${hours}`, 2, '0')}:${_.padStart(`${minutes}`, 2, '0')}`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Strings.formatValue(power ? 'countdownOffTip' : 'countdownOnTip', value);
  }, [countdown, power]);

  const _handleCountdownPress = useCallback(() => {
    Popup.countdown({
      switchValue: true,
      title: Strings.getDpLang(countdownCode),
      value: +countdown / 60,
      max: Math.floor(_.get(TYSdk.devInfo, 'schema.countdown.max', 86400) / 60),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      hourText: Strings.getLang('t_hour'),
      minuteText: Strings.getLang('t_minute'),
      onConfirm: ({ value }) => {
        const newCountdown = value;
        lampPutDpData({ [countdownCode]: newCountdown * 60 });
        Popup.close();
      },
    });
  }, [countdown]);

  return (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor: color(fontColor).alpha(0.06).rgbString() }]}>
        {isSupportCountdown() ? (
          <TouchableOpacity
            accessibilityLabel="HomeScene_BottomView_Countdown"
            style={styles.textView}
            activeOpacity={0.9}
            onPress={_handleCountdownPress}
          >
            <Text style={[styles.text, { color: fontColor }]}>
              {countdown > 0 ? formatCountdown() : Strings.getDpLang('countdown')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.textView} />
        )}
        <Button
          accessibilityLabel="HomeScene_BottomView_Power"
          style={styles.btnView}
          size={cx(28)}
          icon={icons.power}
          iconColor={power ? fontColor : themeColor}
          iconStyle={[
            styles.icon,
            { backgroundColor: power ? themeColor : color(themeColor).alpha(0.1).rgbString() },
          ]}
          onPress={_handleTogglePower}
        />
        {isSupportCloudTimer ? (
          <TouchableOpacity
            accessibilityLabel="HomeScene_BottomView_Schedule"
            style={styles.textView}
            activeOpacity={0.9}
            onPress={() => {
              TYSdk.native.gotoDpAlarm({
                category: powerCode,
                repeat: 0,
                data: [
                  {
                    dpId: TYSdk.device.getDpIdByCode(powerCode),
                    dpName: Strings.getDpLang(powerCode),
                    selected: 0,
                    rangeKeys: [true, false],
                    rangeValues: [
                      Strings.getDpLang(powerCode, true),
                      Strings.getDpLang(powerCode, false),
                    ],
                  },
                ],
              });
            }}
          >
            <Text style={[styles.text, { color: fontColor }]}>{Strings.getLang('schedule')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.textView} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },

  content: {
    flexDirection: 'row',
    height: isIphoneX ? 99 : 69,
    paddingBottom: isIphoneX ? 20 : 0,
  },

  textView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnView: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(54),
    height: cx(54),
    borderRadius: cx(27),
  },

  text: {
    backgroundColor: 'transparent',
    fontSize: cx(14),
  },
});

export default withTheme(HomeBottomView);
