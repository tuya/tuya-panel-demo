import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import NotifyTitle from './notifyTitle';
import NotifyHistory from './notiyHistory';
import PrevLoading from '../../publicComponents/prevLoading';

const TYEvent = TYSdk.event;

class Notify extends React.Component {
  static propTypes = {
    tabContentHeight: PropTypes.number.isRequired,
  };
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {
      showLoading: true,
      showNetError: true,
      showMask: true,
    };
  }
  getList = () => {
    TYEvent.emit('reGetMsgList', '');
  };

  changeLoadNetStatus = value => {
    const { showLoading, showNetError, showMask } = value;
    this.setState({
      showLoading,
      showNetError,
      showMask,
    });
  };

  render() {
    const { tabContentHeight } = this.props;
    const { showLoading, showNetError, showMask } = this.state;
    return (
      <View style={styles.notifyPage}>
        <NotifyTitle />
        <View style={styles.historyBox}>
          <NotifyHistory
            tabContentHeight={tabContentHeight}
            changeLoadNetStatus={this.changeLoadNetStatus}
          />
        </View>
        {showMask ? (
          <PrevLoading
            showLoading={showLoading}
            showNetError={showNetError}
            onRetry={this.getList}
          />
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  notifyPage: {
    flex: 1,
  },
  historyBox: {
    flex: 1,
    paddingTop: 8,
  },
});

export default Notify;
