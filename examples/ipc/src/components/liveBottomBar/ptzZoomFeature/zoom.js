import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TYText, TYSdk } from 'tuya-panel-kit';
import { getPanelOpacity } from '../../../utils/panelStatus';

import Res from '../../../res';
import Strings from '../../../i18n';
import Config from '../../../config';

const { smallScreen, cx } = Config;
const TYDevice = TYSdk.device;

class Zoom extends React.Component {
  static propTypes = {
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      zoomData: [
        {
          key: 'add',
          imageSource: Res.ptzZoomNormal.zoomAdd,
          imageTitle: Strings.getLang('zoomIn'),
        },
        {
          key: 'cut',
          imageSource: Res.ptzZoomNormal.zoomCut,
          imageTitle: Strings.getLang('zoomOut'),
        },
      ],
      activeKey: -1,
    };
  }
  zoomPressLong = key => {
    this.timeId = setTimeout(() => {
      if (key === 'add') {
        TYDevice.putDeviceData({ zoom_control: '0' });
      } else if (key === 'cut') {
        TYDevice.putDeviceData({ zoom_control: '1' });
      }
    }, 1000);

    TYDevice.putDeviceData({ zoom_stop: true });
  };
  zoomPressIn = key => {
    this.setState({
      activeKey: key,
    });
    if (key === 'add') {
      TYDevice.putDeviceData({ zoom_control: '0' });
    } else if (key === 'cut') {
      TYDevice.putDeviceData({ zoom_control: '1' });
    }
  };
  zoomPressOut = () => {
    this.setState({
      activeKey: -1,
    });
    clearTimeout(this.timeId);
    TYDevice.putDeviceData({ zoom_stop: true });
  };
  render() {
    const { zoomData, activeKey } = this.state;
    const { panelItemActiveColor } = this.props;
    return (
      <View style={styles.zoomPage}>
        {zoomData.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.zoomContainer,
              { borderRightWidth: index === 0 ? 1 : 0, borderRightColor: '#e5e5e5' },
            ]}
          >
            <TouchableOpacity
              disabled={!getPanelOpacity()}
              style={[styles.zoomItemBox]}
              activeOpacity={1}
              onPressIn={() => this.zoomPressIn(item.key)}
              onLongPress={() => this.zoomPressLong(item.key)}
              onPressOut={() => this.zoomPressOut(item.key)}
            >
              <Image
                source={item.imageSource}
                style={{
                  tintColor: activeKey === item.key ? panelItemActiveColor : undefined,
                  width: smallScreen ? cx(30) : cx(40),
                  resizeMode: 'contain',
                }}
              />
              <TYText
                numberOfLines={1}
                style={[styles.imageTitle, { color: activeKey === item.key ? '#ed5629' : '#333' }]}
              >
                {item.imageTitle}
              </TYText>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  zoomPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  zoomContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomItemBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: smallScreen ? 14 : 18,
    marginTop: smallScreen ? 0 : 10,
  },
});

export default Zoom;
