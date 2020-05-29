/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import * as Progress from 'react-native-progress';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RecipeUtils } from '../../components/recipe';
import HomeCookerBottom from './home-cooker-bottom';
import DisplayImage from '../../components/display-image';
import Config from '../../config';
import Strings from '../../i18n';
import { getCountDownValue, onPressTimeSet } from '../../utils';

const { parseOrder } = RecipeUtils;
const { convertX: cx } = Utils.RatioUtils;
const RADIUS = cx(132);
const PAUSE_SHOW_STATUS = ['cooking', 'warm'];
const Res = {
  pause: require('../../res/pause.png'),
  goon: require('../../res/goon.png'),
};
class HomeCookerContent extends Component {
  static propTypes = {
    mode: PropTypes.string,
    status: PropTypes.string,
    stop: PropTypes.bool,
    logo: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
    navigator: PropTypes.any.isRequired,
    recipeStep: PropTypes.string.isRequired,
    recipeId: PropTypes.number,
    currentRecipe: PropTypes.object,
    aTime: PropTypes.number,
    rTime: PropTypes.number,
    cTime: PropTypes.number,
  };

  static defaultProps = {
    mode: '',
    status: 'standby',
    logo: null,
    stop: false,
    recipeId: 0,
    currentRecipe: {},
    aTime: 0,
    rTime: 0,
    cTime: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      order:
        this.codes.multistepCode && props.recipeStep ? parseOrder(props.recipeStep) - 1 || 0 : 0,
    };
    this._onPressTimeSet = onPressTimeSet.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.recipeStep !== nextProps.recipeStep && this.codes.multistepCode) {
      this.setState({ order: parseOrder(nextProps.recipeStep) - 1 });
    }
  }

  get codes() {
    const {
      status: statusCode,
      cookTime: cTimeCode,
      appointmentTime: aTimeCode,
      remainTime: rTimeCode,
      mode: modeCode,
      cloudRecipeNumber: recipeCode,
      multistep: multistepCode,
      pause: pauseCode,
    } = Config.codes;
    return {
      statusCode,
      cTimeCode,
      aTimeCode,
      rTimeCode,
      modeCode,
      recipeCode,
      multistepCode,
      pauseCode,
    };
  }

  getCountdownState = () => {
    const ret = {
      countdown: 0,
      percent: 0,
    };
    const { total, left } = this.getTotalAndLeftTimeByStatus();
    Object.assign(ret, {
      countdown: left,
      percent: total ? left / total : 0,
    });
    return ret;
  };

  getTotalAndLeftTimeByStatus = () => {
    const { aTime, rTime, cTime, status } = this.props;
    const schema = { total: cTime, left: this.codes.rTimeCode ? rTime : cTime };
    switch (status) {
      case 'appointment':
        Object.assign(schema, { total: aTime });
        break;
      case 'done':
        Object.assign(schema, { total: 1, left: 0 });
        break;
      default:
        break;
    }
    return schema;
  };

  getCurrentMode = () => {
    const { mode, recipeId } = this.props;
    let ret = '';
    if (!recipeId) {
      ret = Strings.getDpLang(this.codes.modeCode, mode);
    }
    return ret;
  };

  gotoStepDetail = () => {
    const { currentRecipe } = this.props;
    this.props.navigator.push({
      id: 'multiCooking',
      multiSteps: _.get(currentRecipe, 'hmsteps.cooking'),
    });
  };

  buildMultiStepData = () => {
    const { currentRecipe, status } = this.props;
    const { order } = this.state;
    let shouldStepDisplay = false;
    let title = '';
    const { multisteps, hmsteps } = currentRecipe;
    const { cookingStepMode, isdevctrl, supCookingStep } = _.get(hmsteps, 'devCtrl', {});
    if (
      Object.keys(currentRecipe).length > 0 &&
      multisteps &&
      isdevctrl &&
      supCookingStep &&
      cookingStepMode === 1
    ) {
      shouldStepDisplay = true;
      const { name } = currentRecipe;
      title = Strings.formatString(
        Strings.getLang('step_display_title'),
        Strings.getDpLang(this.codes.statusCode, status),
        name,
        order + 1
      );
    }
    return { shouldStepDisplay, title };
  };

  handleStopPress = () => {
    const { stop } = this.props;
    TYSdk.device.putDeviceData({ [this.codes.pauseCode]: !stop });
  };

  renderDisplayView = () => {
    const { countdown, percent } = this.getCountdownState();
    const { themeColor } = Config.themeData;
    const { shouldStepDisplay } = this.buildMultiStepData();
    return (
      <TouchableOpacity
        disabled={!shouldStepDisplay}
        onPress={this.gotoStepDetail}
        style={styles.contentContainer}
      >
        <Progress.Circle
          borderWidth={cx(1)}
          borderColor="rgba(255,255,255,0.2)"
          unfilledColor="rgba(255,255,255,0.2)"
          fill="rgba(255,255,255, 0.04)"
          color={themeColor}
          thickness={cx(1)}
          progress={percent}
          size={RADIUS * 2}
          style={{ width: RADIUS * 2, height: RADIUS * 2 }}
        />
        {this.renderStatusView(countdown)}
        {this.renderPauseView()}
      </TouchableOpacity>
    );
  };

  renderPauseView = () => {
    if (!this.codes.pauseCode) return;
    const { stop, status } = this.props;
    if (!PAUSE_SHOW_STATUS.includes(status)) return;
    return (
      <TouchableOpacity onPress={this.handleStopPress} style={styles.stopContainer}>
        <Image source={stop ? Res.goon : Res.pause} style={styles.pauseIcon} />
      </TouchableOpacity>
    );
  };

  renderStatusView = (countdown = 0) => {
    const { logo, status, stop } = this.props;
    const currentMode = this.getCurrentMode();
    const { shouldStepDisplay, title: stepTitle } = this.buildMultiStepData();
    const text = shouldStepDisplay
      ? stepTitle
      : `${Strings.getDpLang(this.codes.statusCode, status)} ${currentMode}`;
    const countdownStr = getCountDownValue({
      code: this.codes.rTimeCode,
      value: countdown,
    });
    return (
      <View style={styles.statusContainer}>
        <DisplayImage
          image={logo}
          text={stop ? Strings.getDpLang(this.codes.pauseCode, stop) : text}
          style={styles.display}
          containerStyle={styles.displayContainer}
          textStyle={styles.displayText}
        />
        <TYText style={styles.countdown}>{countdownStr}</TYText>
        {this.renderTimeResetButton()}
      </View>
    );
  };

  renderTimeResetButton = () => {
    const { cTime, aTime, status } = this.props;
    const code =
      status === 'appointment'
        ? this.codes.aTimeCode
        : !status || status === 'standby'
        ? null
        : this.codes.cTimeCode;
    const time = code === this.codes.aTimeCode ? aTime : cTime;
    if (!code) return <View style={[styles.timeWrap, { opacity: 0 }]} />;
    return (
      <TouchableOpacity style={styles.timeWrap} onPress={() => this._onPressTimeSet(code, time)}>
        <TYText style={styles.timeReset}>{Strings.getLang('timeReset')}</TYText>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {this.renderDisplayView()}
        </View>
        <HomeCookerBottom />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingVertical: cx(32),
    width: cx(280),
    height: 2 * RADIUS,
  },

  display: {
    width: cx(220),
    height: cx(90),
    alignSelf: 'center',
  },

  displayContainer: {
    width: cx(160),
  },

  displayText: {
    fontSize: cx(16),
    color: '#fff',
    textAlign: 'center',
  },

  countdown: {
    fontSize: cx(40),
    color: '#fff',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },

  timeWrap: {
    paddingHorizontal: cx(16),
    paddingVertical: cx(4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: cx(18),
  },

  timeReset: {
    fontSize: cx(14),
    color: 'rgba(255,255,255,.5)',
    backgroundColor: 'transparent',
  },

  contentContainer: {
    width: cx(280),
    height: cx(288),
    alignItems: 'center',
  },

  stopContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export default connect(({ dpState, recipes = {} }) => {
  const {
    status: statusCode,
    cookTime: cTimeCode,
    appointmentTime: aTimeCode,
    remainTime: rTimeCode,
    mode: modeCode,
    cloudRecipeNumber: recipeCode,
    multistep: multistepCode,
    pause: pauseCode,
  } = Config.codes;

  return {
    status: dpState[statusCode],
    rTime: dpState[rTimeCode],
    aTime: dpState[aTimeCode],
    cTime: dpState[cTimeCode],
    mode: dpState[modeCode],
    recipeId: dpState[recipeCode],
    recipeStep: dpState[multistepCode],
    stop: dpState[pauseCode],
    recipes: recipes.all || [],
    currentRecipe: recipes.currentRecipe || {},
  };
})(HomeCookerContent);
