/* eslint-disable camelcase */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import Res from '../../res';

const TYDevice = TYSdk.device;

class ZoomFullScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/require-default-props
    zoom_control: PropTypes.string,
    showfullScreen: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      addLongPress: false,
      downLongPress: false,
    };
  }

  // 1缩小  0放大
  zoomAddPress = () => {
    TYDevice.putDeviceData({ zoom_control: '0' });
    this.props.showfullScreen();
  };
  zoomAddPressOut = () => {
    this.setState({
      addLongPress: false,
    });
    this.props.showfullScreen();
    clearTimeout(this.timeId);
    TYDevice.putDeviceData({ zoom_stop: true });
  };

  zoomAddLongPress = () => {
    this.setState({
      addLongPress: true,
    });
    this.props.showfullScreen();
    this.addLong();
  };

  zoomDownPress = () => {
    TYDevice.putDeviceData({ zoom_control: '1' });
    this.props.showfullScreen();
  };
  zoomDownPressOut = () => {
    this.setState({
      downLongPress: false,
    });
    this.props.showfullScreen();
    TYDevice.putDeviceData({ zoom_stop: true });
  };
  zoomDownLongPress = () => {
    this.setState({
      downLongPress: true,
    });
    this.props.showfullScreen();
    this.addLongDown();
  };

  addLong = () => {
    if (this.state.addLongPress) {
      this.timeId = setTimeout(() => {
        TYDevice.putDeviceData({ zoom_control: '0' });
        this.addLong();
      }, 1000);
    }
  };

  addLongDown = () => {
    if (this.state.downLongPress) {
      this.timeId = setTimeout(() => {
        TYDevice.putDeviceData({ zoom_control: '1' });
        this.addLongDown();
      }, 1000);
    }
  };

  render() {
    const { zoom_control } = this.props;
    return (
      <View style={styles.focusPage}>
        {/* //判定是否具有zoom_control这个dp点 */}
        {zoom_control !== undefined && (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[styles.focusImgBox, { left: 5 }]}
              onPressIn={this.zoomAddPress}
              onPressOut={this.zoomAddPressOut}
              onLongPress={this.zoomAddLongPress}
              activeOpacity={0.7}
            >
              <Image source={Res.ptzZoomFull.zoomAdd} style={styles.focusImg} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.focusImgBox, { left: 5, top: 2 }]}
              onPressIn={this.zoomDownPress}
              onPressOut={this.zoomDownPressOut}
              onLongPress={this.zoomDownLongPress}
              activeOpacity={0.7}
            >
              <Image source={Res.ptzZoomFull.zoomCut} style={styles.focusImg} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  focusPage: {
    width: 50,
    backgroundColor: 'transparent',
  },
  focusImgBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusImg: {
    width: 35,
    resizeMode: 'contain',
  },
});

const mapStateToProps = state => {
  const { zoom_control } = state.dpState;
  return {
    zoom_control,
  };
};
export default connect(mapStateToProps, null)(ZoomFullScreen);
