import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { updateDp } from '../../redux/actions/common';
import { updateCloud } from '../../redux/actions/cloud';
import Config from '../../config';
import Strings from '../../i18n';
import LampInstance from '../../utils/LampInstance';
import { WORKMODE } from '../../utils/constant';
import { syncThrottle, handleFifthSceneColor } from '../../utils';
import Color from '../../utils/color';
import HuePicker from '../../components/HuePicker';
import resource from '../../res';

const { convertX: cx } = Utils.RatioUtils;

class Lamp extends Component {
  static propTypes = {
    power: PropTypes.bool.isRequired,
    workMode: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    brightness: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    kelvin: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    colour: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    sceneValue: PropTypes.string.isRequired,
    selectSceneColorIndex: PropTypes.number.isRequired,
    isEditSceneColor: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    updateDp: PropTypes.func.isRequired,
    selectSceneId: PropTypes.number.isRequired,
    scenes: PropTypes.array.isRequired,
    updateCloud: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    LampInstance.setInstance(this);
    this.state = this.initData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.initData(nextProps),
    });
  }

  setLightColor(color, brightness) {
    // 灯亮度效果由于1%-100%显示比较差，对应显示8%-100%范围
    this.shadowRef.setNativeProps({
      style: { opacity: this.formatOpacity(brightness) },
    });
    this.ligthRef.setNativeProps({
      style: { tintColor: color },
    });
  }

  // 灯亮度效果由于1%-100%显示比较差，对应显示8%-100%范围
  formatOpacity(brightness) {
    return 0.08 + ((brightness - 10) / (1000 - 10)) * (1 - 0.08);
  }

  initData(props) {
    const {
      workMode,
      brightness,
      kelvin,
      colour,
      sceneValue,
      isEditSceneColor,
      scenes,
      selectSceneId,
      selectSceneColorIndex,
    } = props;
    let currentColor = '#fff';
    let currentBright = 1000;
    let hsv = [0, 0, 0];
    switch (workMode) {
      case WORKMODE.WHITE:
        currentColor = Color.brightKelvin2rgb(1000, kelvin);
        currentBright = brightness;
        break;
      case WORKMODE.COLOUR:
        hsv = Color.decodeColourData(colour);
        currentColor = Color.hsv2hex(hsv[0], hsv[1], 1000);
        currentBright = hsv[2];
        break;
      case WORKMODE.SCENE: {
        let hsvbk;
        if (isEditSceneColor) {
          const exist = scenes.find(item => item.sceneId === selectSceneId);
          if (exist) {
            const [, , , ...hsvbks] = Color.decodeSceneValue(exist.value);
            hsvbk = hsvbks[selectSceneColorIndex];
          }
        } else {
          const [, , , ...hsvbks] = Color.decodeSceneValue(sceneValue);
          [hsvbk] = hsvbks;
        }
        if (!hsvbk) {
          hsvbk = [0, 0, 0, 0, 0];
        }
        hsv = hsvbk;
        // 取第一组数据
        const [h, s, v, b, k] = hsvbk;
        // 白光
        if (b || k) {
          currentColor = Color.brightKelvin2rgb(1000, k);
          currentBright = b;
        } else {
          currentColor = Color.hsv2hex(h, s, 1000);
          currentBright = v;
        }
        break;
      }
      default:
        break;
    }

    // 标题
    const modeTitle = Strings.getLang(`mode_${workMode}`);
    return {
      modeTitle,
      hsv,
      currentColor,
      currentBright,
    };
  }

  handleChangePower = () => {
    const { power } = this.props;
    this.props.updateDp({
      [Config.dpCodes.power]: !power,
    });
  };

  handleHueChange = syncThrottle(
    hue => {
      const { hsv } = this.state;
      const currentColor = Color.hsv2hex(hue, hsv[1], 1000);
      this.setLightColor(currentColor, hsv[2]);
    },
    hue => {
      const { hsv } = this.state;
      const editHsv = [hue, hsv[1], hsv[2]];
      const currentColor = Color.encodeColourControlData(...editHsv);
      this.props.updateDp({
        [Config.dpCodes.controlData]: currentColor,
      });
    }
  );

  hangleHueChangeCompelete = hue => {
    this.handleHueChange.cancel();
    const { isEditSceneColor, selectSceneId, scenes, selectSceneColorIndex } = this.props;
    const { hsv } = this.state;
    if (isEditSceneColor) {
      const exist = scenes.find(item => item.sceneId === selectSceneId);
      if (exist) {
        const [num, speed, mode, ...hsvbks] = Color.decodeSceneValue(exist.value);
        // 为了与v1版本一致，如果是第5个场景，则只显示一个颜色，并根据用户选择了颜色处理成亮暗两种颜色
        const isFifth = num === 4;
        if (selectSceneColorIndex < hsvbks.length) {
          let newHsvbks = hsvbks;
          if (isFifth) {
            const [h, s, v] = hsvbks[0];
            newHsvbks = handleFifthSceneColor(hue, s, v);
          } else {
            newHsvbks[selectSceneColorIndex][0] = hue;
          }

          const value = Color.encodeSceneValue([num, speed, mode, ...newHsvbks]);
          this.props.updateDp({
            [Config.dpCodes.sceneData]: value,
          });
          this.props.updateCloud(`scene_${+num}`, { sceneId: exist.sceneId, value });
        }
      }
    } else {
      this.props.updateDp({
        [Config.dpCodes.colourData]: Color.encodeColourData(hue, hsv[1], hsv[2]),
      });
    }
    this.setState({
      hsv: [hue, hsv[1], hsv[2]],
    });
  };

  render() {
    const { power, isEditMode, isEditSceneColor, workMode } = this.props;
    const { currentColor, currentBright, modeTitle } = this.state;
    const isShowHue = power && isEditMode && (workMode === WORKMODE.COLOUR || isEditSceneColor);

    const lampOnImage = resource.lightOn;
    const lampOffImage = resource.lightOff;

    return (
      <View style={styles.container} accessibilityLabel="LampView">
        {power && (
          <TYText accessibilityLabel="Light_Mode_Name" style={[styles.title]}>
            {modeTitle}
          </TYText>
        )}
        <View style={styles.box}>
          <Image
            ref={ref => (this.shadowRef = ref)}
            source={resource.lightShadow}
            style={[
              styles.lightShadow,
              { opacity: power ? this.formatOpacity(currentBright) : 0.2 },
            ]}
          />
          <TYText style={[styles.powerTip, { opacity: power ? 0 : 1 }]}>
            {Strings.getLang('power_tip')}
          </TYText>
          <HuePicker
            style={[styles.huePicker, { opacity: isShowHue ? 1 : 0 }]}
            hue={isShowHue ? this.state.hsv[0] : 0}
            touchThumbRadius={cx(25)}
            touchOffset={cx(8)}
            onChange={this.handleHueChange}
            onRelease={this.hangleHueChangeCompelete}
            onPress={this.hangleHueChangeCompelete}
            disabled={!isShowHue}
          />
          <TouchableWithoutFeedback
            onPress={this.handleChangePower}
            accessibilityLabel="Light_Btn_Open"
          >
            <View style={styles.lightBtn}>
              <Image
                ref={ref => (this.ligthRef = ref)}
                source={power ? lampOnImage : lampOffImage}
                style={[
                  styles.light,
                  { tintColor: power ? currentColor : 'rgba(255,255,255,0.4)' },
                ]}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    width: '100%',
    position: 'absolute',
    top: cx(10),
    backgroundColor: 'transparent',
    fontSize: cx(14),
    textAlign: 'center',
  },
  box: {
    width: cx(374),
    height: cx(374),
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightShadow: {
    width: cx(283),
    height: cx(284),
  },
  lightBtn: {
    position: 'absolute',
    width: cx(120),
    height: cx(120),
    top: cx(127),
    left: cx(127),
    zIndex: 1,
  },
  light: {
    width: cx(120),
    height: cx(120),
  },
  powerTip: {
    position: 'absolute',
    width: '100%',
    bottom: cx(30),
    left: 0,
    textAlign: 'center',
    fontSize: cx(12),
    color: '#fff',
    backgroundColor: 'transparent',
  },
  huePicker: {
    position: 'absolute',
    left: cx(49.5),
    top: cx(49.5),
  },
});

export default connect(
  ({ dpState, cloudState }) => {
    const {
      dpCodes: {
        power: powerCode,
        workMode: workModeCode,
        bright: brightCode,
        kelvin: kelvinCode,
        colourData: colourDataCode,
        sceneData: sceneDataCode,
      },
    } = Config;
    return {
      power: dpState[powerCode],
      workMode: dpState[workModeCode],
      brightness: Reflect.has(dpState, brightCode) ? dpState[brightCode] : 1000,
      kelvin: Reflect.has(dpState, kelvinCode) ? dpState[kelvinCode] : 1000,
      colour: dpState[colourDataCode],
      sceneValue: dpState[sceneDataCode],
      isEditMode: cloudState.isEditMode,
      isEditSceneColor: cloudState.isEditSceneColor,
      selectSceneColorIndex: cloudState.selectSceneColorIndex,
      selectSceneId: cloudState.selectSceneId,
      scenes: cloudState.scenes,
    };
  },
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateCloud: updateCloud(dispatch),
  })
)(Lamp);
