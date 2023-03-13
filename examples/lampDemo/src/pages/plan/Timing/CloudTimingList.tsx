import React, { useState, useMemo, useContext, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { useCreation } from 'ahooks';
import {
  TYText,
  useTheme,
  Utils,
  TYListItem,
  SwitchButton,
  Collapsible,
  GlobalToast,
  Swipeout,
  Divider,
  TYSdk,
} from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import Strings from '@i18n';
import useSelector from '@hooks/useSelector';
import Res from '@res';
import Icons from '@res/icons';
import { CommonActions } from '@actions';
import DpCodes from '@config/dpCodes';
import { CloudTimingCategory } from '@config';
import { is24Hour, parseHour12Data } from '@utils';
import * as TaskManager from '@utils/taskManager';
import { PlanScrollViewContext } from '../index';

const { convertX: cx } = Utils.RatioUtils;
const { updateCloudTimingStatus, removeCloudTiming } = CommonActions;
const { powerCode } = DpCodes;

const CloudTimingList: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const is24H = useCreation(is24Hour, []);
  const isZh = useCreation(() => Strings.language.toLowerCase().startsWith('zh'), []);
  const powerId = useRef(useState(() => TYSdk.device.getDpIdByCode(powerCode))[0]).current;
  const scrollViewRef = useContext(PlanScrollViewContext);

  const { isDarkTheme, themeColor, fontColor, subFontColor, boxBgColor, dividerColor }: any =
    useTheme();
  const { cloudTimingList } = useSelector(({ uiState }) => ({
    cloudTimingList: uiState.cloudTimingList || [],
  }));

  const [actived, setActived] = useState(true);
  const [curOpenSwipeOutIdx, setCurOpenSwipeOutIdx] = useState(-1);

  const handleSwitchCollapsible = () => {
    setActived(a => !a);
  };

  const handleTimingSwitch = async (v: boolean, item: any) => {
    if (v) {
      // 互斥校验
      const taskType = TaskManager.TaskType.NORMAL_TIMING;
      const [isCheck, checkDatas] = TaskManager.check(
        {
          id: item.timerId,
          weeks: item.weeks.concat(0),
          startTime: item.hour * 60 + item.minute,
          endTime: item.hour * 60 + item.minute,
        },
        taskType
      );
      if (isCheck) {
        TaskManager.showTip(checkDatas);
        return;
      }
    }
    dispatch(updateCloudTimingStatus(+v, CloudTimingCategory, item.groupId));
  };

  const handleTimingRemove = async (item: any) => {
    const res = await dispatch(removeCloudTiming(item.groupId, CloudTimingCategory));
    if (!res) {
      GlobalToast.show({ text: Strings.getLang('tip_remove_fail'), showIcon: false });
      return;
    }
    GlobalToast.show({ text: Strings.getLang('tip_remove_success') });
  };

  const handleTimingPress = item => {
    navigation.navigate('cloudTiming', {
      isEdit: true,
      data: item,
      weeks: item.weeks,
      dps: item.dps,
      time: { hour: item.hour, minute: item.minute },
    });
  };

  const timings = useMemo(
    () =>
      cloudTimingList.map((item, index) => {
        const loopString = item.weeks
          .reduce((acc, cur, idx) => {
            if (cur === 1) acc.push(Strings.getLang(`week${idx}`));
            return acc;
          }, [])
          .join('、');

        const timeData = is24H
          ? { timeStr: item.time }
          : parseHour12Data(moment.duration(item.time).as('seconds'));
        return (
          <View key={item.timerId}>
            <Divider style={{ marginHorizontal: cx(8) }} color={dividerColor} height={cx(0.5)} />
            <Swipeout
              key={item.timerId}
              backgroundColor="transparent"
              autoClose={true}
              buttonWidth={cx(52)}
              close={index !== curOpenSwipeOutIdx}
              onOpen={() => {
                setCurOpenSwipeOutIdx(index);
                scrollViewRef.current?.setNativeProps?.({ scrollEnabled: false });
              }}
              onClose={() => scrollViewRef.current?.setNativeProps?.({ scrollEnabled: true })}
              right={[
                {
                  type: 'delete',
                  text: Strings.getLang('timerDelete'),
                  backgroundColor: '#FF4444',
                  onPress: () => handleTimingRemove(item),
                  content: (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image source={Res.deletes} style={{ width: cx(16), height: cx(18) }} />
                    </View>
                  ),
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.timingItem}
                onPress={() => handleTimingPress(item)}
              >
                <View style={styles.timingItemLeft}>
                  <View
                    style={{
                      flexDirection: isZh ? 'row' : 'row-reverse',
                      justifyContent: isZh ? 'flex-start' : 'flex-end',
                      alignItems: 'flex-end',
                    }}
                  >
                    {!is24H && (
                      <TYText
                        color={subFontColor}
                        size={cx(12)}
                        style={{ marginRight: cx(6), marginBottom: cx(3) }}
                        text={Strings.getLang(`timing_${timeData.isPM ? 'PM' : 'AM'}`)}
                      />
                    )}
                    <TYText size={cx(28)} style={{ marginRight: cx(6) }} text={timeData.timeStr} />
                  </View>
                  <TYText color={subFontColor} size={cx(12)} style={{ marginTop: cx(2) }}>
                    {loopString || Strings.getLang('once')}
                  </TYText>
                  <TYText color={subFontColor} size={cx(12)} style={{ marginTop: cx(2) }}>
                    {Strings.getLang('timing_execution_action')}
                    {': '}
                    {Strings.getLang(
                      item.dps?.[powerId]
                        ? 'timing_execution_action_switch_on'
                        : 'timing_execution_action_switch_off'
                    )}
                  </TYText>
                </View>
                <SwitchButton value={item.power} onValueChange={v => handleTimingSwitch(v, item)} />
              </TouchableOpacity>
            </Swipeout>
          </View>
        );
      }),
    [cloudTimingList, isZh, is24H]
  );

  return (
    <View style={styles.container}>
      <TYListItem
        styles={{
          container: [
            { borderTopLeftRadius: cx(12), borderTopRightRadius: cx(12) },
            !actived && { borderBottomLeftRadius: cx(12), borderBottomRightRadius: cx(12) },
          ],
          contentLeft: [styles.timingTopContentLeft, { backgroundColor: themeColor }],
        }}
        theme={{
          cellBg: boxBgColor,
          padding: [cx(18), cx(24), cx(18), cx(24)],
        }}
        title={Strings.getLang('title_timing_cloud')}
        Icon={Icons.schedule}
        iconSize={cx(17)}
        iconColor="#fff"
        Action={
          <Image
            source={actived ? Res.arrow_up : Res.arrow_down}
            style={{ width: cx(12), height: cx(7), tintColor: isDarkTheme ? fontColor : '#A2A2B8' }}
          />
        }
        onPress={handleSwitchCollapsible}
      />
      <Collapsible
        collapsed={!actived}
        duration={actived ? 300 : 100}
        style={{
          backgroundColor: boxBgColor,
          borderBottomLeftRadius: cx(12),
          borderBottomRightRadius: cx(12),
        }}
      >
        <View style={{ minHeight: cx(102) }}>{timings}</View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: cx(16),
  },
  timingTopContentLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(36),
    height: cx(36),
    borderRadius: cx(18),
  },
  timingItem: {
    paddingVertical: cx(17),
    paddingHorizontal: cx(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timingItemLeft: {},
});

export default CloudTimingList;
