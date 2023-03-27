/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Picker } from 'tuya-panel-kit';

import _ from 'lodash';
import Strings from '@i18n';

const defaultProps = {
  is24Hour: true,
  hour: 0,
  minute: 0,
  onChange(t: any) {},
  itemTextColor: '#ccc',
  dividerColor: '#ccc',
  selectedItemTextColor: '#000',
  visibleItemCount: 7,
  itemAlign: 'center',
  textSize: 20,
  loop: false,
  containerStyle: {},
  itemStyle: {},
  pickerStyle: {},
  amPmPickerStyle: {},
  hourPickerStyle: {},
  minutePickerStyle: {},
};

type IProps = {
  is24Hour?: boolean; // 是否为24小时制
  hour?: number; // 小时
  minute?: number; // 分钟
  onChange?: ({ hour, minute }) => void; // 改变值时执行此回调 ({ hour, minute }) => void
  itemTextColor?: string; // Picker选项的文字颜色
  selectedItemTextColor?: string; // Picker选项选中的文字颜色
  dividerColor?: string; // Picker选项分割线颜色
  visibleItemCount?: number; // Picker可视区域项目个数
  itemAlign?: 'flex-end' | 'center' | 'flex-start' | 'baseline' | 'stretch' | undefined; // Picker项目对齐方式
  textSize?: number; // Picker项目文字大小
  loop?: boolean; // 是否循环滚动
  containerStyle?: StyleProp<ViewStyle>; // 容器样式
  itemStyle?: StyleProp<TextStyle>; // Picker文字样式
  pickerStyle?: StyleProp<ViewStyle>; // Picker样式
  amPmPickerStyle?: StyleProp<ViewStyle>; // ampm列Picker样式
  hourPickerStyle?: StyleProp<ViewStyle>; // 小时列Picker样式
  minutePickerStyle?: StyleProp<ViewStyle>; // 分钟列Picker样式
} & Readonly<typeof defaultProps>;
interface IState {
  amPm;
  hour;
  minute;
}
export default class TimePicker extends React.Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  private hours;

  private minutes;

  constructor(props) {
    super(props);
    const { is24Hour, hour, minute } = this.props;

    this.hours = is24Hour
      ? _.times(24, n => _.padStart(String(n), 2, '0'))
      : _.times(12, n => _.padStart(String(n === 0 ? 12 : n), 2, '0'));
    this.minutes = _.times(60, n => _.padStart(String(n), 2, '0'));

    this.state = this.updateData(hour, minute);
  }

  componentWillReceiveProps(nextProps) {
    const { hour, minute } = this.props;
    if (nextProps.hour !== hour || nextProps.minute !== minute) {
      this.setState(this.updateData(hour, minute));
    }
  }

  updateData = (hour, minute) => {
    const { is24Hour } = this.props;
    let hourStr = '00';

    if (is24Hour) {
      hourStr = _.padStart(hour, 2, '0');
    } else if (hour > 12) {
      hourStr = _.padStart(String(hour - 12), 2, '0');
    } else if (hour === 0) {
      hourStr = '12';
    } else {
      hourStr = _.padStart(hour, 2, '0');
    }

    return {
      amPm: !is24Hour && hour >= 12 ? 'PM' : 'AM',
      hour: hourStr,
      minute: _.padStart(minute, 2, '0'),
    };
  };

  handleChange = () => {
    const { is24Hour, onChange } = this.props;
    const { amPm, hour, minute } = this.state;
    const data = {
      hour: +hour,
      minute: +minute,
    };

    if (!is24Hour) {
      if (amPm === 'PM') {
        data.hour = hour === '12' ? 12 : +hour + 12;
      } else {
        data.hour = hour === '12' ? 0 : +hour;
      }
    }

    onChange(data);
  };

  handleAmPm = value => {
    const state = { amPm: value };
    this.setState(state, this.handleChange);
  };

  handleHour = value => {
    const state = { hour: _.padStart(value, 2, '0') };
    this.setState(state, this.handleChange);
  };

  handleMinute = value => {
    this.setState({ minute: _.padStart(value, 2, '0') }, this.handleChange);
  };

  render() {
    const {
      is24Hour,
      itemTextColor,
      selectedItemTextColor,
      visibleItemCount,
      loop,
      containerStyle,
      itemStyle,
      pickerStyle,
      amPmPickerStyle,
      hourPickerStyle,
      minutePickerStyle,
      dividerColor,
      itemAlign,
      textSize,
    } = this.props;
    const { amPm, minute, hour } = this.state;
    return (
      <View style={[styles.pickerContainer, containerStyle]}>
        {!is24Hour && (
          <Picker
            style={[styles.picker, styles.pickerLeft, pickerStyle, amPmPickerStyle]}
            itemStyle={[styles.pickerItem, itemStyle]}
            selectedValue={amPm}
            visibleItemCount={visibleItemCount}
            itemTextColor={itemTextColor}
            selectedItemTextColor={selectedItemTextColor}
            onValueChange={this.handleAmPm}
            dividerColor={dividerColor}
            itemAlign={itemAlign}
            textSize={textSize}
          >
            {['AM', 'PM'].map(value => (
              <Picker.Item key={value} value={value} label={Strings.getLang(`timing_${value}`)} />
            ))}
          </Picker>
        )}
        <Picker
          style={[styles.picker, styles.pickerMiddle, pickerStyle, hourPickerStyle]}
          itemStyle={[styles.pickerItem, itemStyle]}
          selectedValue={hour}
          itemTextColor={itemTextColor}
          visibleItemCount={visibleItemCount}
          onValueChange={this.handleHour}
          selectedItemTextColor={selectedItemTextColor}
          loop={loop}
          dividerColor={dividerColor}
          itemAlign={itemAlign}
          textSize={textSize}
        >
          {this.hours.map(value => (
            <Picker.Item key={value} value={value} label={value} />
          ))}
        </Picker>
        <Picker
          style={[styles.picker, styles.pickerRight, pickerStyle, minutePickerStyle]}
          itemStyle={[styles.pickerItem, itemStyle]}
          itemTextColor={itemTextColor}
          selectedItemTextColor={selectedItemTextColor}
          selectedValue={minute}
          visibleItemCount={7}
          onValueChange={this.handleMinute}
          loop={loop}
          dividerColor={dividerColor}
          itemAlign={itemAlign}
          textSize={textSize}
        >
          {this.minutes.map(value => (
            <Picker.Item key={value} value={value} label={value} />
          ))}
        </Picker>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    height: 200,
  },
  pickerItem: {},
  pickerLeft: {
    width: 88,
  },
  pickerMiddle: {
    width: 80,
  },
  pickerRight: {
    width: 80,
  },
});
