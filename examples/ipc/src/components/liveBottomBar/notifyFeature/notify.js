import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotifyTitle from './notifyTitle';
import NotifyHistory from './notiyHistory';

class Notify extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View style={styles.notifyPage}>
        <NotifyTitle />
        <View style={styles.historyBox}>
          <NotifyHistory />
        </View>
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
