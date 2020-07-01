/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { ColorParser } from '../../../../utils/ColorParser';
import ProgressBarCommon from '../../../publicComponents/progressBarCommon';
import { colorMode, getColorBarArr } from './lightDataStore';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

class ColorLight extends React.Component {
  static propTypes = {
    floodlight_switch: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      proBarArr: [],
    };
  }
  componentDidMount() {
    const { lightData, needFilterDp } = colorMode;
    const newmProBarArr = getColorBarArr(lightData, needFilterDp);
    // 获取初始disable状态,避免在有定时 上报有延迟的情况下，界面显示不一致
    const { floodlight_switch } = this.props;
    const lightState = floodlight_switch;
    newmProBarArr.forEach((item, index) => {
      newmProBarArr[index].disabled = !lightState;
    });
    this.setState({
      proBarArr: newmProBarArr,
    });
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
  }
  dpChange = data => {
    const changedp = data.payload;
    const { proBarArr } = this.state;
    // 监听灯的开关的值
    if (changedp.floodlight_switch !== undefined) {
      // 如果开关为true
      proBarArr.forEach((item, index) => {
        proBarArr[index].disabled = !changedp.floodlight_switch;
      });
      this.setState({
        proBarArr,
      });
    }
    // 监听dp点light_color_control的变化
    if (changedp.light_color_control !== undefined) {
      this.controlColorChange(changedp.light_color_control);
    }
  };
  upDateDpLightVaue = () => {
    const { proBarArr } = this.state;
    let [hue, saturation, bright] = [0, 0, 0];
    proBarArr.forEach(item => {
      if (item.key === 'colorLight_hue') {
        hue = item.dpValue;
      } else if (item.key === 'colorLight_saturation') {
        saturation = item.dpValue;
      } else if (item.key === 'colorLight_bright') {
        bright = item.dpValue;
      }
    });
    this.putColorData(hue, saturation, bright);
  };

  putColorData = (h, s, v) => {
    const encodeColorData = ColorParser.encodeColorData(h, s, v);
    TYDevice.putDeviceData({
      light_color_control: encodeColorData,
    });
  };

  controlColorChange = dpValue => {
    const colorLightData = ColorParser.decodeColorData(dpValue);
    const oldBarArr = this.state.proBarArr;
    oldBarArr.forEach((item, index) => {
      oldBarArr[index].dpValue = colorLightData[index];
    });
    this.setState({
      proBarArr: oldBarArr,
    });
  };

  changeBarArr = (value, dpCode) => {
    const oldBarArr = this.state.proBarArr;
    oldBarArr.forEach((item, index) => {
      if (item.key === dpCode) {
        oldBarArr[index].dpValue = value;
      }
    });
    this.setState({
      proBarArr: oldBarArr,
    });
  };
  dragLightValue = _.throttle((value, dpCode) => {
    this.changeBarArr(value, dpCode);
    TYDevice.putDeviceData({
      [dpCode]: value,
    });
  }, 350);
  render() {
    const { proBarArr } = this.state;
    return (
      <View style={styles.colorLightPage}>
        {proBarArr.map(item => (
          <ProgressBarCommon
            handleLightValue={this.upDateDpLightVaue}
            dragLightValue={this.dragLightValue}
            barData={item}
            key={item.key}
          />
        ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  colorLightPage: {},
});

const mapStateToProps = state => {
  const { dpState } = state;
  const { floodlight_switch } = dpState;
  return {
    floodlight_switch,
  };
};

export default connect(mapStateToProps, null)(ColorLight);
