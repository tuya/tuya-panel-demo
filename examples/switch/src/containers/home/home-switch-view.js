import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, StyleSheet } from 'react-native';
import GridLayout from '../../components/GridLayout';
import SwitchItem from '../../components/SwitchItem';

const HomeSwitchView = ({ switchCodes }) => {
  const rowNum = Math.ceil(switchCodes.length / 3);
  const scrollEnabled = rowNum > 2;
  return (
    <ScrollView
      contentContainerStyle={scrollEnabled ? null : styles.container}
      scrollEnabled={scrollEnabled}
    >
      <GridLayout
        style={styles.gridLayout}
        data={switchCodes.map(code => ({ code }))}
        rowStyle={styles.gridRow}
        rowNum={rowNum}
      >
        {({ code }) => <SwitchItem key={code} code={code} />}
      </GridLayout>
    </ScrollView>
  );
};

HomeSwitchView.propTypes = {
  switchCodes: PropTypes.array.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridLayout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridRow: {
    flex: 0,
  },
});

export default connect(({ switchState }) => ({
  switchCodes: _.map(switchState.switches || [], 'code'),
}))(HomeSwitchView);
