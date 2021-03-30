import { connect } from 'react-redux';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Strings from '../../i18n';

const { convertX: cx } = Utils.RatioUtils;

const HEADER_HEIGHT = cx(48);

interface HeaderProps {
  state: string;
}
// eslint-disable-next-line react/prefer-stateless-function
class Header extends Component<HeaderProps> {
  render() {
    const { state } = this.props;
    return (
      <View style={styles.header}>
        <TYText style={styles.title}>{Strings.getLang(`result_${state}`)}</TYText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
  },
  title: {
    color: '#34363C',
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    fontSize: cx(16),
  },
});

export default connect(({ modes }: any) => ({
  state: modes.state,
}))(Header);
