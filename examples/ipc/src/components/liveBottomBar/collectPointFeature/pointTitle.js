import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import PanelClick from '../../../config/panelClick';
import Config from '../../../config';
import Strings from '../../../i18n';
import Res from '../../../res';
import { getPanelOpacity } from '../../../utils/panelStatus';

const { cx, cy } = Config;

class PointTitle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  enterCollectDetail = () => {
    PanelClick.gotoCruiseDetail();
  };

  render() {
    return (
      <View style={styles.pointTitlePage}>
        <TYText numberOfLines={1} style={styles.titleText}>
          {Strings.getLang('ipc_panel_button_memory_point')}
        </TYText>
        <TouchableOpacity
          disabled={!getPanelOpacity()}
          activeOpacity={0.7}
          onPress={this.enterCollectDetail}
          style={styles.allMesBox}
        >
          <Image source={Res.collectPoint.collectTitleIcon} style={styles.titleImg} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pointTitlePage: {
    height: cy(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: cx(12),
    paddingRight: cx(15),
  },
  allMesBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleImg: {
    width: cx(20),
    resizeMode: 'contain',
  },
  titleText: {
    fontSize: cx(15),
    fontWeight: '400',
  },
});

export default PointTitle;
