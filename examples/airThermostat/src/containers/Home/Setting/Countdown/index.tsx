import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Popup } from 'tuya-panel-kit';
import dpCodes from 'config/default/dpCodes';
import Clock from './Clock';
import TimePicker from './TimePicker';
import gateway from '../../../../gateway';

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
    const { countdown } = this.props;
    this.state = { countdown };
  }

  handleCancel = () => {
    gateway.putDpData({ [countdownSetCode]: 0 });
    Popup.close();
  };

  hanldeReset = () => {
    this.setState({ countdown: 0 });
  };

  render() {
    const { totalCountdown, countdown: total } = this.props;
    const { countdown } = this.state;
    return countdown > 0 ? (
      <Clock
        totalCountdown={totalCountdown}
        countdown={total}
        onCancel={this.handleCancel}
        onReset={this.hanldeReset}
      />
    ) : (
      <TimePicker />
    );
  }
}

export default connect(({ dpState }: any) => ({
  countdown: dpState[countdownLeftCode],
  totalCountdown: dpState[countdownSetCode],
}))(Countdown);
