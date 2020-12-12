import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Controllerbar from './Controllerbar';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import Main from './Main';
import Data from './Data';
import Setting from './Setting';
import { ControllBarTab } from 'utils/index';

const { height: winHeight } = Utils.RatioUtils;

const { powerCode } = dpCodes;

interface IProp {
  tab: ControllBarTab;
  power: boolean;
}

class Home extends PureComponent<IProp> {
  viewHeight: number = winHeight;
  render() {
    const { tab } = this.props;
    return (
      <View style={{ flex: 1 }}>
        {tab === ControllBarTab.Home && <Main />}
        {tab === ControllBarTab.Data && <Data />}
        {tab === ControllBarTab.Setting && <Setting />}
        <Controllerbar />
      </View>
    );
  }
}

export default connect(({ dpState, uiState }: any) => ({
  power: dpState[powerCode],
  tab: uiState.controllBar,
}))(Home);
