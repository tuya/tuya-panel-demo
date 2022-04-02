/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import { View } from 'react-native';
import { Dialog, TYText } from 'tuya-panel-kit';
import { repeatArrStr } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { TaskType } from '.';
import Strings from '../../i18n';
import { formatRangeTime } from '../index';

/**
 * 显示冲突提示
 * @param {Object} data 冲突的数据
 */
const showTip = (data: any, cb?: Function) => {
  const keys = Object.keys(data);
  const hasRhythms = keys.includes(TaskType.RHYTHMS_TASK);
  const hasCountDown = keys.includes(TaskType.COUNTDOWN);
  const hasTimer = keys.some(key => key !== TaskType.RHYTHMS_TASK && key !== TaskType.COUNTDOWN);
  const timers = keys.filter(key => key !== TaskType.RHYTHMS_TASK && key !== TaskType.COUNTDOWN);
  let labelKey = '';
  if (hasRhythms && hasCountDown && hasTimer) {
    labelKey = 'conflict_all_label';
  } else if (hasRhythms && hasCountDown) {
    labelKey = 'conflict_no_timer_label';
  } else if (hasRhythms && hasTimer) {
    labelKey = 'conflict_rhythms_timer_label';
  } else if (hasCountDown && hasTimer) {
    labelKey = 'conflict_countdown_timer_label';
  } else if (hasRhythms) {
    labelKey = `${TaskType.RHYTHMS_TASK}_conflict_tip`;
  } else if (hasCountDown) {
    labelKey = `${TaskType.COUNTDOWN}_conflict_tip`;
  } else {
    labelKey = 'conflict_timer_label';
  }

  Dialog.custom({
    title: Strings.getLang('tip'),
    style: {
      backgroundColor: '#fff',
    },
    titleStyle: {
      // @ts-ignore
      color: '#333',
    },
    content: (
      <View style={{ alignSelf: 'stretch', padding: 16 }}>
        <TYText style={{ marginBottom: 8, color: '#333' }}>
          {Strings.getLang(labelKey as any)}
        </TYText>
        {hasTimer &&
          timers.map(key => {
            const list = data[key];
            const tipKey = `${key}_conflict_tip`;
            return (
              <View key={key} style={{ paddingHorizontal: 8 }}>
                {list.map(({ startTime, endTime, weeks }: any, i: number) => {
                  return (
                    <TYText key={i.toString()} style={{ fontSize: 10, color: '#333' }}>
                      {Strings.formatValue(
                        tipKey as any,
                        formatRangeTime(startTime, endTime),
                        repeatArrStr(weeks)
                      )}
                    </TYText>
                  );
                })}
              </View>
            );
          })}
      </View>
    ),
    // @ts-ignore
    cancelText: null,
    confirmTextStyle: {
      color: '#333',
    },
    confirmText: Strings.getLang('confirm'),
    onConfirm: () => {
      Dialog.close();
      cb && cb();
    },
  });
};

export default showTip;
