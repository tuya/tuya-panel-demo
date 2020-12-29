import React from 'react';
import _ from 'lodash';
import { View, StyleSheet } from 'react-native';
import { TYSdk, Utils, Picker, Popup, GlobalToast } from 'tuya-panel-kit';
import TimerPicker from 'components/TimePicker';
import PopMain from 'components/PopMain';
import Strings from 'i18n/index';
import dpCodes from 'config/default/dpCodes';
import gateway from '../../../../gateway';

const { countdownSetCode } = dpCodes;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  countdown: number;
  theme?: any;
  onOk: (time: number) => void;
}
interface IState {
  time: any;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@withTheme
export default class TimePicker extends React.Component<Props, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    countdown: 0, // 24 小时
    // eslint-disable-next-line
    onOk() {},
  };

  constructor(props: Props) {
    super(props);

    const schema = TYSdk.device.getDpSchema(countdownSetCode);
    this.state = { time: schema.type === 'enum' ? schema?.range[0] : 1 };
  }

  handleChange = (time: any) => {
    this.setState({ time });
  };

  handleOk = () => {
    const { time } = this.state;
    GlobalToast.show({ text: Strings.getLang('countdownSuccess') });
    gateway.putDpData({ [countdownSetCode]: time }, { checkCurrent: false });
    Popup.close();
  };

  render() {
    const { countdown, theme } = this.props;
    const schema = TYSdk.device.getDpSchema(countdownSetCode);
    const { brand: themeColor, fontColor } = theme.global;
    return (
      <PopMain
        contentType="panel"
        cancelText={Strings.getLang('cancel')}
        okText={Strings.getLang('countdownBegin')}
        title={Strings.getLang('countdown')}
        onOk={this.handleOk}
      >
        <View style={styles.container}>
          {schema.type === 'value' && (
            <TimerPicker
              fontColor={fontColor}
              time={countdown}
              min={1}
              max={schema.max}
              onChange={this.handleChange}
              hourLabel={Strings.getLang('clock_hour')}
              minuteLabel={Strings.getLang('clock_minute')}
            />
          )}
          {schema.type === 'enum' && (
            <Picker
              style={[styles.picker, styles.pickerRight]}
              itemStyle={[styles.pickerItem, { color: fontColor }]}
              itemTextColor={fontColor}
              selectedItemTextColor={fontColor}
              selectedValue={schema?.range}
              visibleItemCount={7}
              onValueChange={this.handleChange}
              theme={{ fontSize: 40 }}
            >
              {(schema.range || []).map((code: string) => (
                <Picker.Item
                  key={code}
                  value={code}
                  label={Strings.getDpLang(countdownSetCode, code)}
                />
              ))}
            </Picker>
          )}
        </View>
      </PopMain>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItem: { height: 312 },
  picker: {
    height: 312,
    fontSize: 20,
  },
  pickerRight: {
    width: 80,
  },
});
