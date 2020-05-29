import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TYSdk, Utils } from 'tuya-panel-kit';
import { updateDpName } from '../../redux/modules/cloudState';
import Strings from '../../i18n';
import SwitchItem from '../../components/SwitchItem';

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

const { convertY: cy } = Utils.RatioUtils;

interface HomeBottomViewProps {
  dpState: any;
  switchName: any;
  updateDpName: any;
  schema: any;
}

class HomeBottomView extends Component<HomeBottomViewProps> {
  switchs: any;
  countdowns: any;
  static propTypes = {
    dpState: PropTypes.object,
    switchName: PropTypes.object,
    updateDpName: PropTypes.func,
    schema: PropTypes.object,
  };

  static defaultProps = {
    dpState: {},
    switchName: {},
    updateDpName() {},
    schema: {},
  };

  constructor(props: HomeBottomViewProps) {
    super(props);
    const { schema } = this.props;
    const switchs = _.filter(schema, d => /^switch/.test(d.code));
    this.switchs = _.sortBy(switchs, d => _.parseInt(d.id));
  }

  _handleToTogglePower = (code: string, power: boolean) => {
    TYDevice.putDeviceData({
      [code]: !power,
    });
  };

  _handleToEdit = (code: string, name: string) => {
    TYNative.showEditDialog(
      Strings.getLang('edit'),
      name,
      (value: string) => {
        const newName = value.trim().substr(0, 20);
        if (newName) {
          if (value.length > 20) {
            TYNative.simpleTipDialog(Strings.getLang('overTip'), () => {});
            this.props.updateDpName({ code, name: newName });
          }
          this.props.updateDpName({ code, name: newName });
          return;
        }
        TYNative.simpleTipDialog(Strings.getLang('emptyTip'), () => {});
      },
      () => {}
    );
  };

  renderItem = () => {
    const { dpState, switchName } = this.props;
    return this.switchs.map((schema: any) => {
      const { code } = schema;
      const power = dpState[code];
      const name = switchName[code] || Strings.getDpLang(code);
      return (
        <SwitchItem
          key={code}
          onPowerPress={() => this._handleToTogglePower(code, power)}
          onEditPress={() => this._handleToEdit(code, name)}
          power={power}
          name={name}
        />
      );
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>{this.renderItem()}</ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: cy(5),
  },
});

const mapStateToProps = (state: any) => {
  return {
    schema: state.devInfo.schema,
    dpState: state.dpState,
    switchName: state.socketState.socketNames,
  };
};

export default connect(mapStateToProps, dispatch =>
  bindActionCreators(
    {
      updateDpName,
    },
    dispatch
  )
)(HomeBottomView);
