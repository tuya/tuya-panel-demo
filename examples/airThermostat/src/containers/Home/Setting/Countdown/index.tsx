import React, { Component } from 'react';
import { connect } from 'react-redux';
import Clock from './Clock';
import TimePicker from './TimePicker';
import dpCodes from 'config/default/dpCodes';
import gateway from '../../../../gateway';
import { Popup } from 'tuya-panel-kit';

interface Props {
  countdown: number;
  totalCountdown: number;
}
const { countdownLeftCode, countdownSetCode } = dpCodes;

interface State {
  countdown: number;
}

class Countdown extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { countdown: this.props.countdown };
  }
  handleCancel = () => {
    gateway.putDpData({ [countdownSetCode]: 0 });
    Popup.close();
  };
  hanldeReset = () => {
    this.setState({ countdown: 0 });
  };
  render() {
    const { totalCountdown } = this.props;
    const { countdown } = this.state;
    return countdown > 0 ? (
      <Clock
        totalCountdown={totalCountdown}
        countdown={this.props.countdown}
        onCancel={this.handleCancel}
        onReset={this.hanldeReset}
      />
    ) : (
      <TimePicker />
    );
  }
}

export default connect(({ dpState }: StoreState) => ({
  countdown: dpState[countdownLeftCode],
  totalCountdown: dpState[countdownSetCode],
}))(Countdown);
