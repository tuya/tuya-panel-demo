import React, { PureComponent } from 'react';
import { Utils, Popup, TYSdk } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import Strings from 'i18n/index';
import PopMain from 'components/PopMain';
import SpeedSlider from 'components/SpeedSlider';
import gateway from '../../../gateway';

const { withTheme } = Utils.ThemeUtils;

const { fanSpeedCode } = dpCodes;

interface IProp {
  speed: string;
  theme?: any;
}

interface State {
  speed: string;
}

class SpeedSetting extends PureComponent<IProp, State> {
  constructor(props: IProp) {
    super(props);
    const { speed } = this.props;
    this.state = {
      speed,
    };
  }

  getEnumValue() {
    const schema = TYSdk.device.getDpSchema(fanSpeedCode);
    const { speed } = this.state;
    if (schema) {
      return schema?.range[speed];
    }
    return '';
  }

  handleChange = (v: string) => {
    this.setState({ speed: v });
  };

  handleSave = () => {
    const { speed } = this.state;
    gateway.putDpData({ [fanSpeedCode]: speed });
    Popup.close();
  };

  render() {
    const { theme, speed } = this.props;
    return (
      <PopMain title={Strings.getLang('speed_setting')} onOk={this.handleSave}>
        <SpeedSlider
          label={Strings.getLang('speed_setting')}
          speed={speed}
          code={fanSpeedCode}
          onChange={this.handleChange}
        />
      </PopMain>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  speed: dpState[fanSpeedCode],
}))(withTheme(SpeedSetting));
