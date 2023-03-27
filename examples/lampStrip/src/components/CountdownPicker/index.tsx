/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
import React, { useMemo, useImperativeHandle } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useControllableValue } from 'ahooks';
import moment from 'moment';
import _ from 'lodash';
import Strings from './i18n';
import LabelPicker from './LabelPicker';

function formatTime(value: number) {
  return _.padStart(value.toString(), 2, '0');
}
const Hours = _.times(24 + 1, (v: number) => formatTime(v));
const Minutes = _.times(60, (v: number) => formatTime(v));
const Seconds = _.times(60, (v: number) => formatTime(v));
const HourLabel = Strings.getLang('countdown_picker_hour');
const MinuteLabel = Strings.getLang('countdown_picker_minute');
const SecondLabel = Strings.getLang('countdown_picker_second');

export interface CountdownPickerInnerRefType {
  value: number;
}

export interface CountdownPickerProps {
  style?: StyleProp<ViewStyle>;
  innerRef?: React.Ref<CountdownPickerInnerRefType>;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  hourLabel?: string;
  minuteLabel?: string;
  secondLabel?: string;
}

const CountdownPicker: React.FC<CountdownPickerProps> = props => {
  const {
    style,
    innerRef,
    hourLabel = HourLabel,
    minuteLabel = MinuteLabel,
    secondLabel = SecondLabel,
  } = props;

  const [value, setValue] = useControllableValue<number>(props, { defaultValue: 0 });

  const [hour, minute, second] = useMemo(() => {
    const time = moment.duration(value, 'seconds');
    return [
      formatTime(time.days() * 24 + time.hours()),
      formatTime(time.minutes()),
      formatTime(time.seconds()),
    ];
  }, [value]);

  const hoursList = Hours;
  const minutesList = useMemo(() => (hour === '24' ? Minutes.slice(0, 1) : Minutes), [hour]);
  const secondsList = useMemo(() => (hour === '24' ? Seconds.slice(0, 1) : Seconds), [hour]);

  const handleHourChange = (v: string) => {
    const m = v === '24' ? 0 : minute;
    const s = v === '24' ? 0 : second;
    setValue(moment.duration(`${v}:${m}:${s}`).as('seconds'));
  };

  const handleMinuteChange = (v: string) => {
    setValue(moment.duration(`${hour}:${v}:${second}`).as('seconds'));
  };

  const handleSecondChange = (v: string) => {
    setValue(moment.duration(`${hour}:${minute}:${v}`).as('seconds'));
  };

  useImperativeHandle(innerRef, () => ({ value }));

  return (
    <View
      style={[styles.container, style]}
      // 防止安卓下手势与父节点冲突
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    >
      <LabelPicker label={hourLabel} list={hoursList} value={hour} onChange={handleHourChange} />
      <LabelPicker
        label={minuteLabel}
        list={minutesList}
        value={minute}
        onChange={handleMinuteChange}
      />
      <LabelPicker
        label={secondLabel}
        list={secondsList}
        value={second}
        onChange={handleSecondChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default CountdownPicker;
