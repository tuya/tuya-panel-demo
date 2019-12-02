import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import DpsLists from '../../components/DpsLists';
import Strings from '../../i18n';

class SettingScene extends Component {
  static propTypes = {
    schema: PropTypes.object,
    switchCodes: PropTypes.array.isRequired,
  };

  static defaultProps = {
    schema: {},
  };

  get dps() {
    const { schema, switchCodes } = this.props;
    const dps = _.filter(schema, dp => switchCodes.indexOf(dp.code) === -1);
    return dps;
  }

  render() {
    return (
      <View style={styles.container}>
        <DpsLists dps={this.dps} Strings={Strings} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default connect(({ devInfo, switchState }) => ({
  schema: devInfo.schema,
  switchCodes: _.map(switchState.switches || [], 'code'),
}))(SettingScene);
