import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreation } from 'ahooks';
import { Button, useTheme, Utils, Popup, TYSdk } from 'tuya-panel-kit';
import { SupportUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import MyTopBar from '@components/MyTopBar';
import PageBackground from '@components/PageBackground';
import useSelector from '@hooks/useSelector';
import Strings from '@i18n';
import Icons from '@res/icons';
import Countdown from './Countdown';
import Timing from './Timing';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
export const PlanScrollViewContext = React.createContext({});

const Plan: React.FC = () => {
  const navigation = useNavigation();

  const { isDarkTheme, themeColor }: any = useTheme();

  const scrollViewRef = useRef(null);

  const { cloudTimingList } = useSelector(({ uiState }) => ({
    cloudTimingList: uiState.cloudTimingList || [],
  }));

  const supportCountdown = useCreation(
    () => SupportUtils.isSupportCountdown() && !SupportUtils.isGroupDevice(),
    []
  );
  const supportCloudTiming = useCreation(
    () => !!TYSdk.devInfo.panelConfig.bic?.some(item => item?.selected && item?.code === 'timer'),
    []
  );

  const handleTimingAdd = () => {
    const commonPopupItemProps = {
      arrow: true,
      iconSize: cx(15),
      iconColor: '#fff',
      theme: { cellBg: isDarkTheme ? '#1A1A1A' : '#fff' },
      styles: {
        contentLeft: [styles.popupItemContentLeft, { backgroundColor: themeColor }],
      },
      cancelTextStyle: { color: isDarkTheme ? '#fff' : themeColor },
    };
    const dataSource = [
      {
        key: 'cloudTiming',
        value: 'cloudTiming',
        title: Strings.getLang('title_timing_cloud'),
        Icon: Icons.schedule,
        ...commonPopupItemProps,
      },
    ];
    if (dataSource.length === 1 && dataSource[0].value === 'cloudTiming') {
      navigation.navigate('cloudTiming');
      return;
    }
    Popup.list({
      type: 'radio',
      dataSource,
      title: Strings.getLang('title_select_timing_type'),
      cancelText: Strings.getLang('cancel'),
      footerType: 'singleCancel',
      contentCenter: false,
      selectedIcon: <View />,
      onMaskPress: ({ close }) => close(),
      onSelect: (value: string, d) => {
        d?.close();
        navigation.navigate(value);
      },
    });
  };

  return (
    <View style={styles.container}>
      <PageBackground />
      <MyTopBar title={Strings.getLang('title_plan')} />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.listContainer, !cloudTimingList.length && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {supportCountdown && <Countdown />}
        {supportCloudTiming && (
          <PlanScrollViewContext.Provider value={scrollViewRef}>
            <Timing />
          </PlanScrollViewContext.Provider>
        )}
      </ScrollView>
      {supportCloudTiming && (
        <Button
          wrapperStyle={styles.addBtn}
          size={cx(51)}
          iconSize={cx(19)}
          iconColor="#fff"
          iconPath={Icons.plus}
          background={themeColor}
          onPress={handleTimingAdd}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: isIphoneX ? cx(44) : cx(24),
  },
  addBtn: {
    position: 'absolute',
    bottom: cx(58),
    right: cx(16),
  },
  popupItemContentLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(32),
    height: cx(32),
    borderRadius: cx(16),
  },
});

export default Plan;
