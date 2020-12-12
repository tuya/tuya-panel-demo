import React, { PureComponent } from 'react';
import { Utils, Popup } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import gateway from '../../../../gateway';
import Strings from 'i18n/index';
import PopMain from 'components/PopMain';
import SpeedSlider from 'components/SpeedSlider';
import ValueSlider from 'components/ValueSlider';
import icons from 'icons/index';

const { withTheme } = Utils.ThemeUtils;

const { exhaustAirVolCode, exhaustTempCode, exhaustFanSpeedCode } = dpCodes;

interface IProp {
  volume: number;
  temp: number;
  speed: string;
  theme?: any;
}

interface State {
  speed: string;
}

class ExhaustSetting extends PureComponent<IProp, State> {
  constructor(props: IProp) {
    super(props);
    const { speed } = this.props;
    this.state = {
      speed,
    };
  }
  handleChangeSpeed = (v: string) => {
    this.setState({ speed: v });
  };
  handleSave = () => {
    const { speed } = this.state;

    gateway.putDpData({
      [exhaustFanSpeedCode]: speed,
    });
    Popup.close();
  };
  render() {
    const { volume, temp } = this.props;
    const { speed } = this.state;
    return (
      <PopMain title={Strings.getLang('exhaustLabel')} onOk={this.handleSave}>
        <SpeedSlider speed={speed} code={exhaustFanSpeedCode} onChange={this.handleChangeSpeed} />
        <ValueSlider icon={icons.temp} value={temp} code={exhaustTempCode} editDisabled={true} />
        <ValueSlider
          icon={icons.volume}
          value={volume}
          code={exhaustAirVolCode}
          editDisabled={true}
        />
      </PopMain>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  speed: dpState[exhaustFanSpeedCode],
  volume: dpState[exhaustAirVolCode],
  temp: dpState[exhaustTempCode],
}))(withTheme(ExhaustSetting));
