/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/static-property-placement */
import React from 'react';
import { View, StyleSheet, ViewPropTypes, Text } from 'react-native';
import { Picker, Utils } from 'tuya-panel-kit';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Strings from '@i18n';

export default class TimePicker extends React.Component {
  static propTypes = {
    is24Hour: PropTypes.bool, // 是否为24小时制
    hour: PropTypes.number, // 小时
    minute: PropTypes.number, // 分钟
    onChange: PropTypes.func, // 改变值时执行此回调 ({ hour, minute }) => void
    itemTextColor: PropTypes.string, // Picker选项的文字颜色
    selectedItemTextColor: PropTypes.string, // Picker选项选中的文字颜色
    dividerColor: PropTypes.string, // Picker选项分割线颜色
    visibleItemCount: PropTypes.number, // Picker可视区域项目个数
    itemAlign: PropTypes.string, // Picker项目对齐方式
    textSize: PropTypes.number, // Picker项目文字大小
    loop: PropTypes.bool, // 是否循环滚动
    containerStyle: ViewPropTypes.style, // 容器样式
    itemStyle: Text.propTypes.style, // Picker文字样式
    pickerStyle: ViewPropTypes.style, // Picker样式
    amPmPickerStyle: ViewPropTypes.style, // ampm列Picker样式
    hourPickerStyle: ViewPropTypes.style, // 小时列Picker样式
    minutePickerStyle: ViewPropTypes.style, // 分钟列Picker样式
  };

  static defaultProps = {
    is24Hour: true,
    hour: 0,
    minute: 0,
    onChange() {},
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

  constructor(props) {
    super(props);
    const { is24Hour, hour, minute } = this.props;

    this.hours = is24Hour
      ? _.times(24, n => _.padStart(n, 2, '0'))
      : _.times(12, n => _.padStart(n === 0 ? 12 : n, 2, '0'));
    this.minutes = _.times(60, n => _.padStart(n, 2, '0'));

    this.state = this.updateData(hour, minute);
  }

  componentWillReceiveProps(nextProps) {
    const { hour, minute } = nextProps;
    if (hour !== this.props.hour || minute !== this.props.minute) {
      this.setState(this.updateData(hour, minute));
    }
  }

  updateData = (hour, minute) => {
    const { is24Hour } = this.props;
    let hourStr = '00';

    if (is24Hour) {
      hourStr = _.padStart(hour, 2, '0');
    } else if (hour > 12) {
      hourStr = _.padStart(hour - 12, 2, '0');
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
    const { is24Hour } = this.props;
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

    this.props.onChange(data);
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
