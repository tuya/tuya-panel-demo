/* eslint-disable indent */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  useTheme,
  Utils,
  BrickButton,
  TYListItem,
  Popup,
  GlobalToast,
  TYSdk,
} from 'tuya-panel-kit';
import { useCreation } from 'ahooks';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import useNavigationBack from '@hooks/useNavigationBack';
import Strings from '@i18n';
import MyTopBar from '@components/MyTopBar';
import TimePicker from '@components/TimePicker';
import Weeks from '@components/Weeks';
import PageBackground from '@components/PageBackground';
import { is24Hour } from '@utils';
import * as TaskManager from '@utils/taskManager';
import DpCodes from '@config/dpCodes';
import { CloudTimingCategory } from '@config';
import { CommonActions } from '@actions';

const { convertX: cx } = Utils.RatioUtils;
const { toFixed } = Utils.CoreUtils;
const { powerCode } = DpCodes;
const { addCloudTiming, updateCloudTiming, removeCloudTiming } = CommonActions;

interface TimeType {
  hour: number;
  minute: number;
}

interface CloudTimingParams {
  isEdit: boolean;
  weeks: number[];
  dps: { [key: string]: any };
  time: TimeType;
  data: any;
}

const CloudTiming: React.FC = () => {
  const dispatch = useDispatch();
  const navigationBack = useNavigationBack();

  const {
    isEdit,
    weeks: originWeeks,
    dps: originDps,
    time: originTime,
    data,
  } = (useRoute().params as CloudTimingParams) || {};
  const { themeColor, fontColor, subPageBgColor, subPageBoxBgColor }: any = useTheme();

  const powerId = useCreation(() => TYSdk.device.getDpIdByCode(powerCode), []);

  const [weeks, setWeeks] = useState(() => (isEdit ? originWeeks : Array(7).fill(0)));
  const [time, setTime] = useState(() => {
    if (isEdit) return originTime;
    const t = moment();
    return { hour: t.hours(), minute: t.minutes() };
  });
  const [dps, setDps] = useState(() => (isEdit ? originDps : { [powerId]: false }));

  const handleClose = () => {
    navigationBack();
  };

  const handleTimeChange = (t: TimeType) => {
    setTime(t);
  };

  const handleWeeksChange = (v: number[]) => {
    setWeeks(v);
  };

  const handleExecActionPress = () => {
    Popup.list({
      type: 'radio',
      dataSource: [
        { key: '1', value: '1', title: Strings.getLang('timing_execution_action_switch_on') },
        { key: '0', value: '0', title: Strings.getLang('timing_execution_action_switch_off') },
      ],
      title: Strings.getLang('timing_execution_action'),
      cancelText: Strings.getLang('cancel'),
      footerType: 'singleCancel',
      iconTintColor: themeColor,
      value: String(+dps[powerId]),
      onMaskPress: ({ close }) => close(),
      // @ts-ignore
      onSelect: (value: string, { close }) => {
        close?.();
        setDps(d => ({ ...d, [powerId]: !!+value }));
      },
    });
  };

  const handleSave = async () => {
    const instruct = [{ time: `${toFixed(time.hour, 2)}:${toFixed(time.minute, 2)}`, dps }];
    // Exclusive check
    const [isCheck, taskData] = TaskManager.check(
      {
        id: data?.timerId || -1,
        weeks,
        startTime: time.hour * 60 + time.minute,
        endTime: time.hour * 60 + time.minute,
      },
      TaskManager.TaskType.NORMAL_TIMING
    );
    if (isCheck) {
      TaskManager.showTip(taskData);
      return;
    }

    const res = isEdit
      ? await dispatch(
          updateCloudTiming(data?.groupId, CloudTimingCategory, weeks.join(''), instruct)
        )
      : await dispatch(addCloudTiming(CloudTimingCategory, weeks.join(''), instruct));
    if (!res) {
      GlobalToast.show({
        text: Strings.getLang(isEdit ? 'tip_edit_fail' : 'tip_add_fail'),
        showIcon: false,
        onFinish: () => {
          GlobalToast.hide();
        },
      });
      return;
    }
    GlobalToast.show({
      text: Strings.getLang(isEdit ? 'tip_edit_success' : 'tip_add_success'),
      onFinish: () => {
        GlobalToast.hide();
      },
    });
    navigationBack();
  };

  const handleDelete = async () => {
    const res = await dispatch(removeCloudTiming(data?.groupId, CloudTimingCategory));
    if (!res) {
      GlobalToast.show({
        text: Strings.getLang('tip_remove_fail'),
        showIcon: false,
        onFinish: () => {
          GlobalToast.hide();
        },
      });
      return;
    }
    GlobalToast.show({
      text: Strings.getLang('tip_remove_success'),
      onFinish: () => {
        GlobalToast.hide();
      },
    });
    navigationBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: subPageBgColor }]}>
      <PageBackground />
      <MyTopBar
        titleStyle={styles.title}
        title={Strings.getLang(isEdit ? 'title_timing_cloud_edit' : 'title_timing_cloud')}
        leftActions={[{ source: Strings.getLang('title_cancel'), onPress: handleClose }]}
        actions={[
          { source: Strings.getLang('title_save'), color: themeColor, onPress: handleSave },
        ]}
      />
      <View style={styles.content}>
        <TimePicker
          is24Hour={is24Hour()}
          loop={true}
          hour={time.hour}
          minute={time.minute}
          itemStyle={{ fontSize: cx(30), color: fontColor }}
          itemTextColor={fontColor}
          selectedItemTextColor={fontColor}
          onChange={handleTimeChange}
          textSize={cx(30)}
        />
        <Weeks
          style={{ marginTop: cx(32) }}
          theme={{
            weeks: {
              item: { backgroundColor: subPageBoxBgColor },
              active: { backgroundColor: themeColor },
            },
          }}
          weeks={weeks}
          onChange={handleWeeksChange}
        />
        <TYListItem
          styles={{
            container: {
              marginTop: cx(24),
              borderRadius: cx(12),
              backgroundColor: subPageBoxBgColor,
            },
            content: { height: cx(70) },
          }}
          title={Strings.getLang('timing_execution_action')}
          arrow={true}
          Action={Strings.getLang(
            dps[powerId]
              ? 'timing_execution_action_switch_on'
              : 'timing_execution_action_switch_off'
          )}
          onPress={handleExecActionPress}
        />
        {isEdit && (
          <BrickButton
            text={Strings.getLang('title_delete')}
            textStyle={{ fontSize: cx(14), color: '#DA3737' }}
            wrapperStyle={{
              width: cx(343),
              height: cx(68),
              marginTop: cx(16),
              backgroundColor: subPageBoxBgColor,
              borderRadius: cx(12),
            }}
            onPress={handleDelete}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: cx(17),
  },
  content: {
    paddingHorizontal: cx(16),
  },
});

export default CloudTiming;
