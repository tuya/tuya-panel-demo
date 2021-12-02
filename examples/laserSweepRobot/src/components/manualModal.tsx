/* eslint-disable react/jsx-no-bind */
import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Utils, Modal, TYText } from 'tuya-panel-kit';
import Strings from '@i18n';
import ManualView from './sweepManualView';

const { convertX: cx, convertY: cy, width, height } = Utils.RatioUtils;

export default class ManualModal extends Component {
  close() {
    Modal.close();
  }

  render() {
    return (
      <View style={styles.container}>
        <View />
        <ManualView />
        <TouchableOpacity style={styles.button} onPress={this.close.bind(this)}>
          <TYText style={styles.text}>{Strings.getLang('exitManual')}</TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width,
    height,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  button: {
    paddingHorizontal: cx(27),
    paddingVertical: cy(12),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: cx(20),
  },

  text: {
    fontSize: cx(14),
    color: '#ffffff',
  },
});
