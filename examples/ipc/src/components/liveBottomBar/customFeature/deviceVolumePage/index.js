/* eslint-disable max-len */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { StyleSheet, View } from 'react-native';
import { TYSdk, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Config from '../../../../config';
import ProgressBarCommon from '../../../publicComponents/progressBarCommon';
import Res from '../../../../res';

const { cx, isIphoneX, winWidth } = Config;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

class DeviceVolume extends React.Component {
  static propTypes = {
    basic_device_volume: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      basic_device_volume: props.basic_device_volume,
      barData: {
        key: 'basic_device_volume',
        iconImage: Res.deviceVolum.volumnMinIcon,
        rightImage: Res.deviceVolum.volumnMaxIcon,
        dpValue: props.basic_device_volume,
        min: props.min,
        max: props.max,
        stepValue: props.step,
        hasUnit: false,
        minColor: props.panelItemActiveColor,
        maxColor: '#DBDBDB',
        // thumb: Res.floodLight.lightNormalThumb,
        disabled: false,
      },
    };
  }
  componentDidMount() {
    const { basic_device_volume } = this.props;
    this.setState({
      basic_device_volume,
    });
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
  }

  onSliderValueChange = value => {
    this.setState({
      basic_device_volume: value,
    });
    TYDevice.putDeviceData({
      basic_device_volume: value,
    });
  };
  onSliderComplete = value => {
    TYDevice.putDeviceData({
      basic_device_volume: value,
    });
  };
  // 获取滑动条的长和宽
  _onLayout = e => {
    const { width } = e.nativeEvent.layout ? e.nativeEvent.layout : 250;
    this.setState({
      sliderWidth: width,
    });
  };
  dpChange = _.throttle(data => {
    const changedp = data.payload;
    if (changedp.basic_device_volume !== undefined) {
      this.setState({
        basic_device_volume: changedp.basic_device_volume,
      });
    }
  }, 300);

  upDateDpLightVaue = (value, dpCode) => {
    this.setState({
      basic_device_volume: value,
    });
    TYDevice.putDeviceData({
      [dpCode]: value,
    });
  };

  dragLightValue = _.throttle((value, dpCode) => {
    this.setState({
      basic_device_volume: value,
    });
    TYDevice.putDeviceData({
      [dpCode]: value,
    });
  }, 0);

  render() {
    const { basic_device_volume, sliderWidth } = this.state;
    const { max, min, panelItemActiveColor } = this.props;
    // cx(30) 为圆形的宽度
    const unitLeft = (sliderWidth - cx(30)) / (max - min);
    // + cx(43)为初始默认值
    const textLeft = unitLeft * (basic_device_volume - 1) + cx(43);
    const { barData } = this.state;
    return (
      <View style={styles.deviceVolumePage}>
        <View style={styles.sliderBox}>
          <ProgressBarCommon
            onLayout={this._onLayout}
            handleLightValue={this.upDateDpLightVaue}
            dragLightValue={this.dragLightValue}
            barData={barData}
          />
          <View
            style={[styles.valueContain, { left: basic_device_volume === 1 ? cx(43) : textLeft }]}
          >
            <View style={[styles.showRealValueBox, { backgroundColor: panelItemActiveColor }]}>
              <TYText style={styles.showText} numberOfLines={1}>
                {basic_device_volume}
              </TYText>
            </View>
            <View style={[styles.trangle, { borderTopColor: panelItemActiveColor }]} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  deviceVolumePage: {
    width: winWidth,
    height: cx(150),
    paddingHorizontal: cx(20),
    backgroundColor: '#fff',
    paddingBottom: isIphoneX ? 20 : 0,
    justifyContent: 'center',
  },
  sliderBox: {
    width: '100%',
  },
  valueContain: {
    position: 'absolute',
    top: -28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showRealValueBox: {
    width: cx(40),
    height: cx(30),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  trangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderColor: 'transparent',
    position: 'absolute',
    bottom: -15,
  },
  showText: {
    color: '#fff',
    fontSize: 14,
  },
});

const mapStateToProps = state => {
  const { dpState, devInfo, ipcCommonState } = state;
  const { basic_device_volume } = dpState;
  const { basic_device_volume: volumeSchema } = devInfo.schema;
  const { min, max, step } = volumeSchema;
  const { panelItemActiveColor } = ipcCommonState;
  return {
    basic_device_volume,
    min,
    max,
    step,
    panelItemActiveColor,
  };
};

export default connect(mapStateToProps, null)(DeviceVolume);
