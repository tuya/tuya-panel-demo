/* eslint-disable max-len */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';
import Strings from '../../../i18n';
import PanelClick from '../../../config/panelClick';

const { cx } = Config;

class NoMotionCloudData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  gotoCloudPaga = () => {
    PanelClick.enterCloudStorage();
  };
  render() {
    return (
      <View style={styles.notPurCharsePage}>
        <View style={styles.notPurCharseContain}>
          <TYText style={styles.cloudTitle}>{Strings.getLang('cloud_storage_no_data')}</TYText>
          <TouchableOpacity
            onPress={this.gotoCloudPaga}
            activeOpacity={0.9}
            style={styles.buyTextBox}
          >
            <TYText style={styles.buyText} numberOfLines={1}>
              {Strings.getLang('cloud_storage_data')}
            </TYText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  notPurCharsePage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notPurCharseContain: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cx(15),
  },
  cloudTitle: {
    textAlign: 'center',
    fontSize: cx(22),
    fontWeight: '800',
    marginBottom: 10,
  },
  buyTextBox: {
    minWidth: 100,
    paddingHorizontal: cx(30),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dfdfdf',
    borderRadius: 44,
  },
  buyText: {
    fontSize: cx(16),
    color: '#333',
  },
});

export default NoMotionCloudData;
