import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';

import Slider from '../../../components/Slider';
import Config from '../../../config';
import { updateDp } from '../../../redux/actions/common';
import { updateStateOnly, updateCloud } from '../../../redux/actions/cloud';
import Color from '../../../utils/color';
import { WORKMODE } from '../../../utils/constant';
import { debounce, syncThrottle, formatBrightPercent } from '../../../utils';
import Strings from '../../../i18n';
import LampInstance from '../../../utils/LampInstance';
import AnimateView from './Animate';
import iconfont from '../../../res/iconfont';

const {
  ThemeUtils: { withTheme },
} = Utils;
const { isIphoneX, convertX: cx, convertY: cy } = Utils.RatioUtils;
const panelHeight = cy(260);

class SceneSlider extends React.Component {
  static propTypes = {
    power: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    selectSceneId: PropTypes.number.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isEditSceneColor: PropTypes.bool.isRequired,
    isEditScene: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    scenes: PropTypes.array.isRequired,
    workMode: PropTypes.string.isRequired,
    updateDp: PropTypes.func.isRequired,
    updateEditStatus: PropTypes.func.isRequired,
    updateCloud: PropTypes.func.isRequired,
    theme: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = this.initData(this.props);
    this.locked = false;
  }

  componentWillReceiveProps(nextProps) {
    const { isEditScene } = this.props;
    if (isEditScene !== nextProps.isEditScene) {
      this.setState(this.initData(nextProps));
    }
  }

  initData(props) {
    const { selectSceneId, scenes } = props;
    const exist = scenes.find(item => item.sceneId === selectSceneId);
    if (exist) {
      const { value } = exist;
      const [id, speed, mode, ...hsvbks] = Color.decodeSceneValue(value);
      let bright = 0;
      let saturation = 0;
      // eslint-disable-next-line no-unused-vars
      hsvbks.forEach(([h, s, v, b, k]) => {
        if (b || k) {
          bright += b;
          saturation += k;
        } else {
          bright += v;
          saturation += s;
        }
      });
      // 如果是第5个场景，则亮度以第一个颜色为准
      const isFifth = +id === 4;
      return {
        id,
        speed,
        mode,
        hsvbks,
        bright: isFifth ? hsvbks[0][2] : Math.floor(bright / hsvbks.length),
        saturation: Math.floor(saturation / hsvbks.length),
      };
    }
    return {
      id: 0,
      speed: 0,
      mode: 0,
      hsvbks: [],
      bright: 10,
      saturation: 0,
    };
  }

  changeShowColor(saturation, bright) {
    const { hsvbks } = this.state;
    if (hsvbks.length) {
      // eslint-disable-next-line no-unused-vars
      const [h, s, v, b, k] = hsvbks[0];
      let color = '';
      if (b || k) {
        color = Color.brightKelvin2rgb(1000, saturation);
      } else {
        color = Color.hsv2hex(h, saturation, 1000);
      }
      // 改展示颜色
      LampInstance.changeColor(color, bright);
    }
  }

  handleGrant = () => {
    this.locked = true;
  };

  handleMove = syncThrottle(
    (saturation, bright) => {
      // 改展示颜色
      this.changeShowColor(saturation, bright);
    },
    (saturation, bright) => {
      const { hsvbks } = this.state;
      if (hsvbks.length) {
        // eslint-disable-next-line no-unused-vars
        const [h, s, v, b, k] = hsvbks[0];
        let controlValue = '';
        if (b || k) {
          controlValue = Color.encodeWhiteControlData(bright, saturation);
        } else {
          controlValue = Color.encodeColourControlData(h, saturation, bright);
        }
        const data = {
          [Config.dpCodes.controlData]: controlValue,
        };
        // eslint-disable-next-line react/destructuring-assignment
        this.props.updateDp(data);
      }
    }
  );

  handleBrightnessMove = value => {
    const { saturation } = this.state;
    this.handleMove(saturation, value);
  };

  handleSaturationMove = value => {
    const { bright } = this.state;
    this.handleMove(value, bright);
  };

  handleRelease = debounce((speed, bright, saturation) => {
    this.locked = false;
    const { hsvbks, id, mode } = this.state;
    const newHsvbks = hsvbks.map(([h, s, v, b, k]) => {
      if (b || k) {
        return [h, s, v, bright, saturation];
      }
      return [h, saturation, bright, b, k];
    });
    // 为了与v1版本一致，如果是第5个场景，则只显示一个颜色，并根据用户选择了颜色处理成亮暗两种颜色
    const isFifth = +id === 4;
    if (isFifth) {
      // eslint-disable-next-line no-unused-vars
      const [h, s, v, b, k] = newHsvbks[1];
      const bright2 = Math.max(10, Math.round(bright * 0.01));
      if (b || k) {
        newHsvbks[1][3] = bright2;
      } else {
        newHsvbks[1][2] = bright2;
      }
    }
    const {
      dpCodes: { workMode: workModeCode, sceneData: sceneDataCode },
    } = Config;
    const value = Color.encodeSceneValue([id, speed, mode, ...newHsvbks]);
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateDp({ [sceneDataCode]: value, [workModeCode]: WORKMODE.SCENE });
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateCloud(`scene_${id}`, { sceneId: id, value });
    this.setState({
      speed,
      bright,
      saturation,
    });
  });

  handleBrightnessRelease = value => {
    const { speed, saturation } = this.state;
    this.handleRelease(speed, value, saturation);
  };

  handleSaturationRelease = value => {
    const { speed, bright } = this.state;
    this.handleRelease(speed, bright, value);
  };

  handleSpeedRelease = value => {
    const { saturation, bright } = this.state;
    this.handleRelease(value, bright, saturation);
  };

  handleBack = () => {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateEditStatus({
      isEditScene: false,
    });
  };

  render() {
    const { power, theme, isEditMode, workMode, isEditScene, isEditSceneColor } = this.props;
    const { speed, bright, saturation } = this.state;
    const isShow =
      power && isEditMode && workMode === WORKMODE.SCENE && isEditScene && !isEditSceneColor;

    return (
      <AnimateView
        style={styles.container}
        hideValue={panelHeight}
        value={isShow ? 0 : panelHeight}
      >
        <View style={[styles.sliders, { backgroundColor: theme.sceneBgColor }]}>
          <Slider
            icon={iconfont.brightness}
            value={bright}
            min={10}
            style={styles.slider}
            onGrant={this.handleGrant}
            onMove={this.handleBrightnessMove}
            onRelease={this.handleBrightnessRelease}
            formatPercent={formatBrightPercent}
            accessibilityLabel="Light_Setting_Slider_Brightness"
          />
          <Slider
            icon={iconfont.saturation}
            style={styles.slider}
            value={saturation}
            onGrant={this.handleGrant}
            onMove={this.handleSaturationMove}
            onRelease={this.handleSaturationRelease}
            accessibilityLabel="Light_Setting_Slider_Saturation"
          />
          <Slider
            icon={iconfont.speed}
            style={styles.slider}
            value={speed}
            min={0}
            max={100}
            onGrant={this.handleGrant}
            onRelease={this.handleSpeedRelease}
            accessibilityLabel="Light_Setting_Slider_Speed"
          />
        </View>
        <View style={styles.backBtn}>
          <TouchableOpacity
            accessibilityLabel="Light_Edit_Return"
            style={styles.backBtn}
            onPress={this.handleBack}
          >
            <TYText style={[styles.backBtnText, { color: theme.activeFontColor }]}>
              {Strings.getLang('back')}
            </TYText>
          </TouchableOpacity>
        </View>
      </AnimateView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    paddingBottom: isIphoneX ? 20 : 0,
  },
  sliders: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: cx(160),
  },
  slider: {
    marginVertical: cy(4),
  },
  backBtn: {
    height: cy(50),
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: cx(14),
  },
});
export default connect(
  ({ dpState, cloudState }) => {
    const {
      dpCodes: { power: powerCode, workMode: workModeCode },
    } = Config;
    return {
      power: dpState[powerCode],
      isEditMode: cloudState.isEditMode,
      isEditSceneColor: cloudState.isEditSceneColor,
      isEditScene: cloudState.isEditScene,
      workMode: dpState[workModeCode],
      scenes: cloudState.scenes,
      selectSceneId: cloudState.selectSceneId,
    };
  },
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateEditStatus: updateStateOnly(dispatch),
    updateCloud: updateCloud(dispatch),
  })
)(withTheme(SceneSlider));
