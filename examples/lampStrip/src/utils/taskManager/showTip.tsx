import React from 'react';
import { View } from 'react-native';
import { Dialog, TYText } from 'tuya-panel-kit';
import { formatRangeTime, repeatArrtoStr } from '@utils';
import Strings from '@i18n';
import { TaskType } from '.';

/**
 * Show conflict tips
 * @param {Object} data Conflicting data
 */
const showTip = (data: any, cb?: () => void) => {
  const keys = Object.keys(data);
  const hasRhythms = keys.includes(TaskType.RHYTHMS_TASK);
  const hasCountDown = keys.includes(TaskType.COUNTDOWN);
  const hasTimer = keys.some(key => key !== TaskType.RHYTHMS_TASK && key !== TaskType.COUNTDOWN);
  const timers = keys.filter(key => key !== TaskType.RHYTHMS_TASK && key !== TaskType.COUNTDOWN);
  // Local timing
  const hasLocal = keys.includes(TaskType.LOCAL_TIMING);
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
    content: (
      <View style={{ alignSelf: 'stretch', padding: 16 }}>
        <TYText color="#000" style={{ marginBottom: 8 }}>
          {Strings.getLang(labelKey)}
        </TYText>
        {hasTimer &&
          timers.map(key => {
            const list = data[key];
            const tipKey = `${key}_conflict_tip`;
            return (
              <View key={key} style={{ paddingHorizontal: 8 }}>
                {list.map(({ startTime, endTime, weeks }: any, i) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <TYText key={i} color="#000" style={{ fontSize: 10 }}>
                      {Strings.formatValue(
                        tipKey,
                        formatRangeTime(startTime, endTime),
                        repeatArrtoStr(weeks)
                      )}
                    </TYText>
                  );
                })}
              </View>
            );
          })}
      </View>
    ),
    cancelText: '',
    confirmText: Strings.getLang('confirm'),
    onConfirm: () => {
      Dialog.close();
      cb && cb();
    },
  });
};

export default showTip;
