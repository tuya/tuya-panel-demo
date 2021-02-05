import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconFont, Utils } from 'tuya-panel-kit';
import { connect } from 'react-redux';

import Config from '../../../config';
import Slider from '../../../components/Slider';
import { updateDp } from '../../../redux/actions/common';
import { updateStateOnly } from '../../../redux/actions/cloud';
import Color from '../../../utils/color';
import { WORKMODE } from '../../../utils/constant';
import { debounce, syncThrottle, formatBrightPercent } from '../../../utils';
import LampInstance from '../../../utils/LampInstance';
import AnimateView from './Animate';
import iconfont from '../../../res/iconfont';

const { convertX, convertY, isIphoneX } = Utils.RatioUtils;

const {
  ThemeUtils: { withTheme },
} = Utils;

const panelHeight = convertY(160);

class WhiteSlider extends React.Component {
  static propTypes = {
    isEditMode: PropTypes.bool.isRequired,
    power: PropTypes.bool.isRequired,
    workMode: PropTypes.string.isRequired,
    brightness: PropTypes.number.isRequired,
    kelvin: PropTypes.number.isRequired,
    updateDp: PropTypes.func.isRequired,
    updateEditStatus: PropTypes.func.isRequired,
    theme: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    const { brightness, kelvin } = this.props;
    this.state = {
      brightness,
      kelvin,
    };
    this.locked = false;
  }

  componentWillReceiveProps(nextProps) {
    const { brightness, kelvin } = this.props;

    if (brightness !== nextProps.brightness || kelvin !== nextProps.kelvin) {
      this.setState({
        brightness,
        kelvin,
      });
    }
  }

  shouldComponentUpdate() {
    return !this.locked;
  }

  changeShowColor(brightness, kelvin) {
    // 改展示颜色
    const color = Color.brightKelvin2rgb(1000, kelvin);
    LampInstance.changeColor(color, brightness);
  }

  handleGrant = () => {
    this.locked = true;
  };

  handleMove = syncThrottle(
    (brightness, kelvin) => {
      // 改展示颜色
      this.changeShowColor(brightness, kelvin);
    },
    (brightness, kelvin) => {
      const controlValue = Color.encodeWhiteControlData(brightness, kelvin);
      const data = {
        [Config.dpCodes.controlData]: controlValue,
      };
      // eslint-disable-next-line react/destructuring-assignment
      this.props.updateDp(data);
    }
  );

  handleBrightnessMove = value => {
    const { kelvin } = this.state;
    this.handleMove(value, kelvin);
  };

  handleKelvinMove = value => {
    const { brightness } = this.state;
    this.handleMove(brightness, value);
  };

  handleRelease = debounce((data, state) => {
    this.locked = false;

    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateDp({ ...data, [Config.dpCodes.workModeCode]: WORKMODE.WHITE });
    this.setState(state);
  }, 300);

  handleBrightnessRelease = value => {
    const { kelvin } = this.state;
    this.handleRelease(
      { [Config.dpCodes.bright]: value },
      {
        brightness: value,
        kelvin,
      }
    );
  };

  handleKelvinRelease = value => {
    const { brightness } = this.state;
    this.handleRelease(
      { [Config.dpCodes.kelvin]: value },
      {
        brightness,
        kelvin: value,
      }
    );
  };

  handleBack = () => {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateEditStatus({ isEditMode: false });
  };

  render() {
    const { power, theme, isEditMode, workMode } = this.props;
    const { brightness, kelvin } = this.state;
    return (
      <AnimateView
        style={styles.container}
        hideValue={panelHeight}
        value={power && isEditMode && workMode === WORKMODE.WHITE ? 0 : panelHeight}
      >
        {Config.dpFun.isSupportWhiteBright && (
          <Slider
            icon={iconfont.brightness}
            value={brightness}
            min={10}
            onGrant={this.handleGrant}
            onMove={this.handleBrightnessMove}
            onRelease={this.handleBrightnessRelease}
            formatPercent={formatBrightPercent}
            accessibilityLabel="Light_Edit_Brightness"
          />
        )}
        {Config.dpFun.isSupportWhiteTemp && (
          <Slider
            icon={iconfont.whiteSaturation}
            style={styles.slider}
            value={kelvin}
            onGrant={this.handleGrant}
            onMove={this.handleKelvinMove}
            onRelease={this.handleKelvinRelease}
            accessibilityLabel="Light_Edit_Saturation"
          />
        )}
        <View style={styles.back}>
          <TouchableOpacity onPress={this.handleBack} accessibilityLabel="Light_Edit_Return">
            <IconFont
              useART={true}
              d={iconfont.arrowDown}
              size={convertX(40)}
              color={theme.iconBackColor}
            />
          </TouchableOpacity>
        </View>
      </AnimateView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    paddingBottom: isIphoneX ? 20 : 0,
  },
  slider: {
    marginTop: convertX(8),
    marginBottom: convertX(14),
  },
  back: {
    alignItems: 'center',
    justifyContent: 'center',
    height: convertX(50),
  },
});

export default connect(
  ({ dpState, cloudState }) => {
    const {
      dpCodes: { power: powerCode, workMode: workModeCode, kelvin: kelvinCode, bright: brightCode },
    } = Config;
    return {
      isEditMode: cloudState.isEditMode,
      power: dpState[powerCode],
      workMode: dpState[workModeCode],
      brightness: Reflect.has(dpState, brightCode) ? dpState[brightCode] : 1000,
      kelvin: Reflect.has(dpState, kelvinCode) ? dpState[kelvinCode] : 1000,
    };
  },
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateEditStatus: updateStateOnly(dispatch),
  })
)(withTheme(WhiteSlider));
