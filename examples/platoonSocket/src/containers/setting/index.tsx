import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import DpsLists from '../../components/DpsLists';
import Strings from '../../i18n';

interface SettingProps {
  data: any;
}
// eslint-disable-next-line react/prefer-stateless-function
export default class SettingScene extends Component<SettingProps> {
  static propTypes = {
    data: PropTypes.array.isRequired,
  };

  render() {
    return (
      <View style={styles.container}>
        <DpsLists dps={this.props.data} Strings={Strings} />
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
