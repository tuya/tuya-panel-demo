import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import BrightAll from './BrightAll';
import Dimmer from '../Dimmer';

interface Props {
  supportMax: number;
  navigator: any;
}
const HomeScene: SFC<Props> = ({ supportMax, navigator }) => {
  const showAll = supportMax > 1;
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showAll && <BrightAll navigator={navigator} />}
        {supportMax === 1 && <Dimmer controllType={1} navigator={navigator} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});

export default connect(({ devInfo }: any) => ({
  supportMax: devInfo.supportMax,
}))(HomeScene);
