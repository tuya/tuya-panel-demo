import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Picker } from 'tuya-panel-kit';

import _ from 'lodash';
import Strings from '@i18n';

const defaultProps = {
  is24Hour: true,
  hour: 0,
  minute: 0,
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
  is24Hour?: boolean; // Whether it is a 24-hour system
  hour?: number; // Hour
  minute?: number; // Minute
  onChange: ({ hour, minute }) => void; // Execute this callback when the value changes ({ hour, minute }) => void
  itemTextColor?: string; // Text color of Picker options
  selectedItemTextColor?: string; // Text color of selected Picker options
  dividerColor?: string; // Divider color of Picker options
  visibleItemCount?: number; // Number of items in the Picker visible area
  itemAlign?: 'flex-end' | 'center' | 'flex-start' | 'baseline' | 'stretch' | undefined; // Picker item alignment
  textSize?: number; // Text size of Picker items
  loop?: boolean; // Whether to scroll in a loop
  containerStyle?: StyleProp<ViewStyle>; // Container style
  itemStyle?: StyleProp<TextStyle>; // Picker text style
  pickerStyle?: StyleProp<ViewStyle>; // Picker style
  amPmPickerStyle?: StyleProp<ViewStyle>; // ampm column Picker style
  hourPickerStyle?: StyleProp<ViewStyle>; // Hour column Picker style
  minutePickerStyle?: StyleProp<ViewStyle>; // Minute column Picker style
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
