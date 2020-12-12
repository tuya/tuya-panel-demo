import React from 'react';
import _ from 'lodash';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import Clock from 'components/Clock';
import Strings from 'i18n/index';
import PopMain from 'components/PopMain';

const { isIphoneX, convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  countdown: number;
  totalCountdown: number;
  theme?: any;
  onCancel: () => void;
  onReset: () => void;
}
interface IState {
  time: number;
}

// @ts-ignore
@withTheme
export default class ClockView extends React.Component<Props, IState> {
  static defaultProps = {
    countdown: 0, // 24 小时
    totalCountdown: 0,
    onCancel() {},
    onReset() {},
  };
  constructor(props: Props) {
    super(props);

    this.state = { time: this.props.countdown };
  }

  render() {
    const { countdown, totalCountdown, theme, onReset, onCancel } = this.props;
    const { brand: themeColor } = theme.global;
    return (
      <PopMain
        contentType="panel"
        cancelText={Strings.getLang('cancel')}
        okText={Strings.getLang('confirm')}
        hideCancel={true}
        title={Strings.getLang('countdown')}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Clock
            resetText={Strings.getLang('reset_countdown_label')}
            countdown={countdown}
            totalCountDown={totalCountdown}
            onReset={onReset}
            lineHeight={5}
            lineNum={100}
            lineColor="rgba(0,0,0,.2)"
            innerBackgroundColor="rgba(0,0,0,.02)"
            activeColor="#000"
            showDot={false}
            timeTextStyle={{ fontSize: 48 }}
            resetStyle={{ marginTop: cx(16) }}
            timeStyle={{ marginTop: cx(14) }}
            hourLabel={Strings.getLang('clock_hour')}
            minuteLabel={Strings.getLang('clock_minute')}
          />
        </View>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isIphoneX ? 20 : 0,
          }}
        >
          <TouchableOpacity style={styles.btn} onPress={onCancel} activeOpacity={0.7}>
            <TYText style={{ fontSize: 16 }}>{Strings.getLang('cancel_countdown_label')}</TYText>
          </TouchableOpacity>
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
    marginBottom: isIphoneX ? 20 : 0,
  },
  btn: {
    height: 62,
    width: cx(327),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,.5)',
    marginBottom: 16,
  },
});
