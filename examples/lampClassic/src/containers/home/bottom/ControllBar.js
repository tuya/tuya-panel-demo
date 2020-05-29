import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet } from 'react-native';
import { Utils, TYSdk } from 'tuya-panel-kit';
import ControllerBar from '../../../components/ControllerBar';
import Config from '../../../config';
import Strings from '../../../i18n';
import { WORKMODE } from '../../../utils/constant';
import { updateDp } from '../../../redux/actions/common';
import { updateStateOnly } from '../../../redux/actions/cloud';
import AnimateView from './Animate';
import resource from '../../../res';

const {
  ThemeUtils: { withTheme },
} = Utils;

const { isIphoneX, convertX: cx, convertY } = Utils.RatioUtils;
const TIMER_KEY = 'timer';
const panelHeight = convertY(160);
class HomeBottomView extends Component {
  static propTypes = {
    power: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    workMode: PropTypes.string.isRequired,
    updateDp: PropTypes.func.isRequired,
    updateEditStatus: PropTypes.func.isRequired,
    theme: PropTypes.any.isRequired,
  };

  static defaultProps = {};

  getData() {
    const {
      dpFun: { isSupportColor, isSupportWhite, isSupportScene },
    } = Config;
    const { power, workMode, theme } = this.props;
    const { fontColor, activeFontColor } = theme;
    const commonProps = {
      activeOpacity: 0.8,
      textStyle: { color: fontColor, fontSize: cx(16) },
      size: 40,
    };
    return [
      {
        key: WORKMODE.WHITE,
        isSupport: power && isSupportWhite,
        image: resource.whiteIcon,
        accessibilityLabel: 'Light_Mode_White',
      },
      {
        key: WORKMODE.COLOUR,
        isSupport: power && isSupportColor,
        image: resource.colorIcon,
        accessibilityLabel: 'Light_Mode_Color',
      },
      {
        key: WORKMODE.SCENE,
        isSupport: power && isSupportScene,
        image: resource.sceneIcon,
        accessibilityLabel: 'Light_Mode_Scenes',
      },
      {
        key: TIMER_KEY,
        isSupport: true,
        image: resource.timerIcon,
        accessibilityLabel: 'Light_Btn_Timer',
      },
    ].map(data => {
      const active = power && workMode === data.key;
      return {
        ...commonProps,
        ...data,
        text: Strings.getDpLang(data.key),
        imageStyle: { tintColor: active ? activeFontColor : fontColor },
        textStyle: { fontSize: cx(10), color: active ? activeFontColor : fontColor },
        // style: { opacity: active ? 1 : 0.6 },
        onPress: () => this.handlePress(data.key),
      };
    });
  }

  handlePress = workMode => {
    if (workMode === TIMER_KEY) {
      const powerCode = Config.dpCodes.power;
      TYSdk.native.gotoDpAlarm({
        category: powerCode,
        repeat: 0,
        data: [
          {
            dpId: TYSdk.device.getDpIdByCode(powerCode),
            dpName: Strings.getDpLang(powerCode),
            selected: 0,
            rangeKeys: [true, false],
            rangeValues: [Strings.getDpLang(powerCode, true), Strings.getDpLang(powerCode, false)],
          },
        ],
      });
      return;
    }

    this.props.updateDp({ [Config.dpCodes.workMode]: workMode });
    this.props.updateEditStatus({ isEditMode: true });
  };

  render() {
    const { isEditMode, power } = this.props;
    const data = this.getData().filter(({ isSupport }) => isSupport);

    return (
      <AnimateView
        style={styles.container}
        hideValue={panelHeight}
        value={power && isEditMode ? panelHeight : 0}
      >
        <ControllerBar
          style={styles.controllerBar}
          size={cx(80)}
          button={data}
          backgroundColor="transparent"
          accessibilityLabel="ControllBar"
        />
      </AnimateView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
  },

  controllerBar: {
    paddingBottom: isIphoneX ? 20 : 0,
  },
});

export default connect(
  ({ dpState, cloudState }) => ({
    power: dpState[Config.dpCodes.power],
    isEditMode: cloudState.isEditMode,
    workMode: dpState[Config.dpCodes.workMode],
  }),
  dispatch => ({
    updateDp: updateDp(dispatch),
    updateEditStatus: updateStateOnly(dispatch),
  })
)(withTheme(HomeBottomView));
