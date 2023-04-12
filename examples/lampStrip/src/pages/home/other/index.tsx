import React, { FC, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TYFlatList, Utils, useTheme, TYSdk } from 'tuya-panel-kit';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import Strings from '@i18n';
import DpCodes from '@config/dpCodes';

const { convertX: cx } = Utils.RatioUtils;
const { lightPixelNumberSetCode, countdownCode } = DpCodes;

const Other: FC = () => {
  const navigation = useNavigation();

  const { boxBgColor }: any = useTheme();

  const list = useMemo(() => {
    const commonItemProps = {
      arrow: true,
      theme: {
        cellBg: boxBgColor,
        cellRadius: cx(16),
        margin: [cx(16), cx(16), 0, cx(16)],
        padding: [cx(26), cx(24), cx(26), cx(24)],
      },
    };

    const isSupportTimer =
      SupportUtils.isSupportDp('rtc_timer') ||
      !!TYSdk.devInfo.panelConfig.bic?.some(item => item?.selected && item?.code === 'timer');

    const isSupportCountdown = SupportUtils.isSupportDp(countdownCode);

    return [
      {
        key: '0',
        title: Strings.getLang('title_plan'),
        ...commonItemProps,
        hidden: !isSupportCountdown && !isSupportTimer,
        onPress: () => navigation.navigate('plan'),
      },
      {
        key: '1',
        title: Strings.getLang('title_light_strip_length'),
        ...commonItemProps,
        hidden: !SupportUtils.isSupportDp(lightPixelNumberSetCode) || SupportUtils.isGroupDevice(),
        onPress: () => navigation.navigate('light_strip_length'),
      },
    ].filter(item => !item.hidden);
  }, []);

  return (
    <TYFlatList
      contentContainerStyle={styles.listContainer}
      separatorStyle={{ backgroundColor: 'transparent' }}
      data={list}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: 'transparent',
  },
});

export default Other;
