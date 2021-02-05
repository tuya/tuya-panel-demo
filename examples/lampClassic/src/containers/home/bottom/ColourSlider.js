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

class ColourSlider extends React.Component {
  static propTypes = {
    isEditMode: PropTypes.bool.isRequired,
    power: PropTypes.bool.isRequired,
    workMode: PropTypes.string.isRequired,
    colour: PropTypes.string.isRequired,
    updateDp: PropTypes.func.isRequired,
    updateEditStatus: PropTypes.func.isRequired,
    theme: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    const { colour } = this.props;
    this.state = {
      hsv: Color.decodeColourData(colour),
    };
    this.locked = false;
  }

  componentWillReceiveProps(nextProps) {
    const { colour } = this.props;
    if (nextProps.colour !== colour) {
      this.setState({
        hsv: Color.decodeColourData(colour),
      });
    }
  }

  shouldComponentUpdate() {
    return !this.locked;
  }

  changeShowColor([h, s, v]) {
    // 改展示颜色
    const color = Color.hsv2hex(h, s, 1000);
    LampInstance.changeColor(color, v);
  }

  handleGrant = () => {
    this.locked = true;
  };

  handleMove = syncThrottle(
    hsv => {
      // 改展示颜色
      this.changeShowColor(hsv);
    },
    hsv => {
      const controlValue = Color.encodeColourControlData(...hsv);
      const data = {
        [Config.dpCodes.controlData]: controlValue,
      };
      // eslint-disable-next-line react/destructuring-assignment
      this.props.updateDp(data);
    }
  );

  handleBrightnessMove = value => {
    const { hsv } = this.state;
    this.handleMove([hsv[0], hsv[1], value]);
  };

  handleSaturationMove = value => {
    const { hsv } = this.state;
    this.handleMove([hsv[0], value, hsv[2]]);
  };

  handleRelease = debounce(hsv => {
    this.locked = false;
    const value = Color.encodeColourData(...hsv);
    const { colourData: colourDataCode, workMode: workModeCode } = Config.dpCodes;
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateDp({
      [colourDataCode]: value,
      [workModeCode]: WORKMODE.COLOUR,
    });
    this.setState({
      hsv,
    });
  });

  handleBrightnessRelease = value => {
    const { hsv } = this.state;
    this.handleRelease([hsv[0], hsv[1], value]);
  };

  handleSaturationRelease = value => {
    const { hsv } = this.state;
    this.handleRelease([hsv[0], value, hsv[2]]);
  };

  handleBack = () => {
    const { updateEditStatus } = this.props;
    updateEditStatus({ isEditMode: false });
  };

  render() {
    const { power, isEditMode, workMode, theme } = this.props;
    const { hsv } = this.state;
    return (
      <AnimateView
        style={styles.container}
        hideValue={panelHeight}
        value={power && isEditMode && workMode === WORKMODE.COLOUR ? 0 : panelHeight}
      >
        <Slider
          icon={iconfont.brightness}
          value={hsv[2]}
          min={10}
          onGrant={this.handleGrant}
          onMove={this.handleBrightnessMove}
          onRelease={this.handleBrightnessRelease}
          formatPercent={formatBrightPercent}
          accessibilityLabel="Light_Setting_Slider_Bright"
        />
        <Slider
          icon={iconfont.saturation}
          style={styles.slider}
          value={hsv[1]}
          onGrant={this.handleGrant}
          onMove={this.handleSaturationMove}
          onRelease={this.handleSaturationRelease}
          accessibilityLabel="Light_Setting_Slider_Saturation"
        />
        <View style={styles.back}>
          <TouchableOpacity onPress={this.handleBack} accessibilityLabel="Light_Setting_fold">
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
    left: 0,
    width: '100%',
    bottom: 0,
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
      dpCodes: { power: powerCode, workMode: workModeCode, colourData: colourDataCode },
    } = Config;
    return {
      isEditMode: cloudState.isEditMode,
      power: dpState[powerCode],
      workMode: dpState[workModeCode],
      colour: dpState[colourDataCode],
    };
  },
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateEditStatus: updateStateOnly(dispatch),
  })
)(withTheme(ColourSlider));
