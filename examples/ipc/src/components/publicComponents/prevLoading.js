/* eslint-disable react/require-default-props */
import React from 'react';
import { PropTypes } from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, TYSdk } from 'tuya-panel-kit';
import LoadingCircle from './loadingCircle';
import Strings from '../../i18n';
import Config from '../../config';

const { cx } = Config;
const TYNative = TYSdk.native;

class PrevLoading extends React.Component {
  static propTypes = {
    showLoading: PropTypes.bool.isRequired,
    showNetError: PropTypes.bool,
    featureArrLength: PropTypes.number,
    onRetry: PropTypes.func,
    bgc: PropTypes.string,
  };
  static defaultProps = {
    bgc: '#f5f5f5',
    featureArrLength: 0,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderListFooter = () => {
    const { showLoading, featureArrLength, showNetError } = this.props;
    const Footer = (props = {}) => (
      <View style={styles.footer}>
        {props.children}
        <TYText style={styles.footerText}>{props.text}</TYText>
      </View>
    );

    if (showLoading) {
      return (
        <Footer text={Strings.getLang('ipc_loading_list_loading')}>
          <LoadingCircle
            showComplete={false}
            itemNum={3}
            completeColor="#FA9601"
            sequenceColor="#FA9601"
            style={styles.loading}
            dotSize={cx(3)}
          />
        </Footer>
      );
    }
    if (featureArrLength === 0 && !showLoading && !showNetError) {
      return <Footer text={Strings.getLang('ipc_loading_list_null')} />;
    }
    if (showNetError && !showLoading) {
      return (
        <Footer text={Strings.getLang('ipc_loading_list_request_err')}>
          <TouchableOpacity
            onPress={() => {
              TYNative.showLoading({ title: '' });
              this.props.onRetry();
            }}
          >
            <TYText style={styles.tryagainTxt}>{Strings.getLang('tryAgain')}</TYText>
          </TouchableOpacity>
        </Footer>
      );
    }
    return <View style={styles.footer} />;
  };

  render() {
    const { bgc } = this.props;
    return (
      <View style={[styles.prevLoadingPage, { backgroundColor: bgc }]}>
        {this.renderListFooter()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  prevLoadingPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cx(30),
  },
  footer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: cx(14),
    marginTop: cx(8),
    lineHeight: cx(20),
  },
  tryagainTxt: {
    marginTop: cx(8),
    color: '#1F78E0',
    fontSize: cx(16),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PrevLoading;
