import React, { PureComponent } from 'react';
import { Utils, Popup, TYSdk } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import gateway from '../../../../gateway';
import Strings from 'i18n/index';
import PopMain from 'components/PopMain';
import ValueSlider from 'components/ValueSlider';
import DpEnum from 'components/DpEnum';

const { withTheme } = Utils.ThemeUtils;

interface IProp {
  code: string;
  value: any;
  icon: string;
  theme?: any;
}

interface State {
  value: any;
}

class DpSetting extends PureComponent<IProp, State> {
  constructor(props: IProp) {
    super(props);
    const { value } = this.props;
    this.state = {
      value,
    };
  }
  handleChange = (v: any) => {
    this.setState({ value: v });
  };
  handleSave = () => {
    const { code } = this.props;
    const { value } = this.state;

    gateway.putDpData({
      [code]: value,
    });
    Popup.close();
  };
  renderDp() {
    const { code, icon } = this.props;
    const { value } = this.state;
    const { range, type } = TYSdk.device.getDpSchema(code);

    switch (type) {
      case 'enum':
        return (
          <DpEnum
            list={range.map((v: string) => ({ value: v, label: Strings.getDpLang(code, v) }))}
            value={value}
            onChange={this.handleChange}
          />
        );

      case 'value':
        return <ValueSlider icon={icon} value={value} code={code} onChange={this.handleChange} />;
      case 'bool':
        return (
          <DpEnum
            list={[true, false].map((v: boolean) => ({
              value: v,
              label: Strings.getDpLang(code, v),
            }))}
            value={value}
            onChange={this.handleChange}
          />
        );
    }
  }
  render() {
    const { code } = this.props;
    return (
      <PopMain title={Strings.getDpLang(code)} onOk={this.handleSave}>
        {this.renderDp()}
      </PopMain>
    );
  }
}

export default connect(({ dpState, devInfo }: any, { code }) => ({
  value: dpState[code],
}))(withTheme(DpSetting));
