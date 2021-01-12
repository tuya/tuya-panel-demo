import React from 'react';
import _ from 'lodash';
import { View, StyleSheet } from 'react-native';
import { Picker, TYText } from 'tuya-panel-kit';

const formatValue = (value: number) => _.padStart(value.toString(), 2, '0');

const minutes = new Array(60).fill(1).map((v: number, index: number) => formatValue(index));

const defaultProps = {
  max: 1440, // 最大支持分钟
  min: 0, // 最小支持分钟
  time: 0, // 当前时间
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange(time: number) {},
  hourLabel: '',
  minuteLabel: '',
  fontColor: '#000',
};

type Props = Readonly<typeof defaultProps>;

interface IState {
  hour: string;
  minute: string;
  hours: string[];
  maxHour: number;
  minHour: number;
  maxMinute: number;
  minMinute: number;
}
export default class TimePicker extends React.Component<Props, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: Props = defaultProps;

  constructor(props: Props) {
    super(props);
    const { time, max, min } = this.props;
    const maxHour = Math.floor(max / 60);
    const minHour = Math.floor(min / 60);
    const maxMinute = max % 60; // 当小时达到最大时，分钟的最大值
    const minMinute = min % 60; // 当小时达到最大时，分钟的最小值

    let currentTime = time;
    if (time < min) {
      currentTime = min;
    } else if (time > max) {
      currentTime = max;
    }
    const hour = formatValue(Math.floor(currentTime / 60));
    const minute = formatValue(currentTime % 60);

    this.state = {
      hour,
      minute,
      hours: new Array(maxHour + 1).fill(1).map((v: number, index: number) => formatValue(index)),
      maxHour,
      minHour,
      maxMinute,
      minMinute,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { time } = nextProps;
    const { time: oldTime } = this.props;
    if (time !== oldTime) {
      this.setState({
        hour: formatValue(Math.floor(time / 60)),
        minute: formatValue(time % 60),
      });
    }
  }

  handleChange = () => {
    const { onChange } = this.props;
    const { hour, minute } = this.state;
    onChange(Number(hour) * 60 + Number(minute));
  };

  handleHour = (value: number) => {
    const { maxHour, minHour, maxMinute, minMinute, minute } = this.state;
    const state: any = { hour: formatValue(value) };
    if (Number(value) === maxHour) {
      if (Number(minute) > maxMinute) {
        state.minute = formatValue(maxMinute);
      }
    } else if (Number(value) === minHour) {
      if (Number(minute) < minMinute) {
        state.minute = formatValue(minMinute);
      }
    }
    this.setState(state, this.handleChange);
  };

  handleMinute = (value: number) => {
    this.setState({ minute: formatValue(value) }, this.handleChange);
  };

  render() {
    const { hourLabel, minuteLabel, fontColor } = this.props;
    const { hours, maxHour, minHour, maxMinute, minMinute, minute, hour } = this.state;
    let minuteData = minutes;
    if (Number(hour) === maxHour) {
      minuteData = minutes.slice(0, maxMinute + 1);
    }
    if (Number(hour) === minHour) {
      minuteData = minuteData.slice(minMinute);
    }
    return (
      <View
        style={styles.pickerContainer}
        // 防止安卓下手势与父节点冲突
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
      >
        <Picker
          style={[styles.picker, styles.pickerMiddle]}
          itemStyle={[styles.pickerItem, { color: fontColor }]}
          selectedValue={hour}
          itemTextColor={fontColor}
          visibleItemCount={7}
          onValueChange={this.handleHour}
          selectedItemTextColor={fontColor}
          theme={{ fontSize: 40 }}
          // loop={true}
        >
          {hours.map(value => (
            <Picker.Item key={value} value={value} label={value} />
          ))}
        </Picker>
        <TYText>{hourLabel}</TYText>
        {/* <TYText style={{ marginHorizontal: 10, color: '#fff' }}>:</TYText> */}

        <Picker
          style={[styles.picker, styles.pickerRight]}
          itemStyle={[styles.pickerItem, { color: fontColor }]}
          itemTextColor={fontColor}
          selectedItemTextColor={fontColor}
          selectedValue={minute}
          visibleItemCount={7}
          onValueChange={this.handleMinute}
          // loop={minuteData.length > 1}
          theme={{ fontSize: 40 }}
        >
          {minuteData.map(value => (
            <Picker.Item key={value} value={value} label={value} />
          ))}
        </Picker>
        <TYText>{minuteLabel}</TYText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 312,
  },
  pickerItem: { height: 312 },
  picker: {
    height: 312,
    fontSize: 20,
  },
  pickerMiddle: {
    width: 80,
  },
  pickerRight: {
    width: 80,
  },
});
