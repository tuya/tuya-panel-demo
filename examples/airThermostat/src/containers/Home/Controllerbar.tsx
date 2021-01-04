import React, { Component } from 'react';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import { View, StyleSheet } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import Strings from 'i18n/index';
import IconTextButton from 'components/IconTextButton';
import icons from 'icons/index';
import { ControllBarTab } from 'utils/index';
import { updateUI } from '../../redux/actions';

const { powerCode } = dpCodes;

interface IProps {
  power: boolean;
  tab: ControllBarTab;
}

class Bar extends Component<IProps> {
  handleToHome = () => {
    updateUI({ controllBar: ControllBarTab.Home });
  };

  handleToData = () => {
    updateUI({ controllBar: ControllBarTab.Data });
  };

  handleToSetting = () => {
    updateUI({ controllBar: ControllBarTab.Setting });
  };

  handleSchedule = () => {
    TYSdk.Navigator.push({
      id: 'timer',
      timerConfig: {
        addTimerRouter: 'addTimer',
        category: 'schedule',
        repeat: 0,
        data: [
          {
            dpId: TYSdk.device.getDpIdByCode(powerCode),
            dpName: Strings.getDpLang(powerCode),
            selected: 0,
            rangeKeys: [true, false],
            rangeValues: [
              { dpValue: Strings.getDpLang(powerCode, true) },
              { dpValue: Strings.getDpLang(powerCode, false) },
            ],
          },
        ],
      },
    });
  };

  render() {
    const { tab } = this.props;
    return (
      <View style={styles.bottom}>
        <IconTextButton
          active={tab === ControllBarTab.Home}
          icon={icons.home}
          text={Strings.getLang('home')}
          onPress={this.handleToHome}
        />
        <IconTextButton
          active={tab === ControllBarTab.Data}
          icon={icons.data}
          text={Strings.getLang('data')}
          onPress={this.handleToData}
        />
        <IconTextButton
          active={tab === ControllBarTab.Setting}
          icon={icons.setting}
          text={Strings.getLang('setting')}
          onPress={this.handleToSetting}
        />
      </View>
    );
  }
}

export default connect(({ dpState, uiState }: any) => ({
  power: dpState[powerCode],
  tab: uiState.controllBar,
}))(Bar);

const styles = StyleSheet.create({
  bottom: {
    height: 85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
});
