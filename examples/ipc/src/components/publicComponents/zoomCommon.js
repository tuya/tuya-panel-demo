/* eslint-disable react/require-default-props */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import PropTypes from 'prop-types';
import { TYSdk } from 'tuya-panel-kit';
import Res from '../../res';
import Config from '../../config';

const { smallScreen, middlleScreen } = Config;
const TYDevice = TYSdk.device;
let scaleTop = -5;
let scaleMargin = 30;
if (smallScreen) {
  scaleTop = -3;
  scaleMargin = 15;
} else if (middlleScreen) {
  scaleTop = -4;
  scaleMargin = 20;
}

class ZoomCommon extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    iconWidth: PropTypes.number,
    iconHeight: PropTypes.number,
    zoomBg: PropTypes.number,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  static defaultProps = {
    iconWidth: 55,
    iconHeight: 55,
  };
  constructor(props) {
    super(props);
    this.state = {
      zoomData: [
        { key: 'add', imageSource: Res.ptzZoomNormal.zoomPtzAdd },
        { key: 'cut', imageSource: Res.ptzZoomNormal.zoomPtzCut },
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
    const { iconWidth, iconHeight, zoomBg, disabled, panelItemActiveColor } = this.props;
    return (
      <View style={styles.zoomCommonPage}>
        {zoomData.map(item => (
          <ImageBackground
            key={item.key}
            source={zoomBg}
            style={[
              styles.zoomBgImg,
              styles.zoomAdd,
              {
                width: iconWidth,
                height: iconHeight,
              },
            ]}
          >
            <TouchableOpacity
              disabled={disabled}
              style={[styles.zoomItemBox, { width: iconWidth, height: iconHeight }]}
              activeOpacity={1}
              onPressIn={() => this.zoomPressIn(item.key)}
              onLongPress={() => this.zoomPressLong(item.key)}
              onPressOut={() => this.zoomPressOut(item.key)}
            >
              <Image
                source={item.imageSource}
                style={{
                  tintColor: activeKey === item.key ? panelItemActiveColor : undefined,
                  width: iconWidth * 0.5,
                  height: iconHeight * 0.5,
                  top: scaleTop,
                }}
              />
            </TouchableOpacity>
          </ImageBackground>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  zoomCommonPage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomAdd: {
    marginBottom: scaleMargin,
  },
  zoomItemBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ZoomCommon;
