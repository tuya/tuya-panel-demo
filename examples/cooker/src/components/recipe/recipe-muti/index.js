/* eslint-disable indent */
/* eslint-disable max-len */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image, UIManager, LayoutAnimation } from 'react-native';
import _ from 'lodash';
import { TYText } from 'tuya-panel-kit';
import TYSdk from '../api';
import Topbar from '../top-bar';
import Strings from '../i18n';
// eslint-disable-next-line import/no-named-as-default
import Config from '../config';
import { Res, mainStyles as styles } from '../assist/recipe-muti';
import BottomButtonGroup from './bottom';
import StepDescription from './step-description';
import {
  parseOrder,
  parseStepDesc,
  parseStepItem,
  parseSteps,
  parseStatusToMutiSteps,
} from '../utils';
import ModeSettingView from '../mode-setting-view';

@connect(({ dpState }) => ({
  dpState,
  originOrder: parseOrder(dpState.multistep) - 1 || 0,
}))
export default class MutiRecipe extends Component {
  static propTypes = {
    multiSteps: PropTypes.array,
    stepIndex: PropTypes.number,
    originOrder: PropTypes.number,
    dpState: PropTypes.object.isRequired,
  };

  static defaultProps = {
    multiSteps: [],
    stepIndex: 0,
    originOrder: 0,
  };
  // 初始化模拟数据
  constructor(props) {
    super(props);
    Config.setDevInfo(TYSdk.devInfo);
    this.state = {
      order: props.originOrder,
      ...this.formatStepsData(this.props),
    };
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.multiSteps !== nextProps.multiSteps ||
      this.props.stepIndex !== nextProps.stepIndex
    ) {
      this.setState({ ...this.formatStepsData(nextProps) });
    }
    if (
      typeof this.props.originOrder === 'undefined' &&
      this.props.originOrder !== nextProps.originOrder
    ) {
      this.setState({ order: nextProps.originOrder });
    }
  }

  componentWillUpdate(__, nextState) {
    this.state.order !== nextState.order &&
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.linear,
          duration: 300,
          initialVelocity: 2,
        },
      });
  }

  onStepChange = order => {
    this.setState({
      order,
    });
  };

  onStatusChange = args => {
    const { pause: pauseCode } = Config.codes;
    const ret = { ...this.state.status };
    const { order } = this.state;
    Object.assign(ret[order], { ...args });
    this.setState({ status: ret }, () => {
      !pauseCode && this.handleStop(true);
    });
  };

  get isPause() {
    const { originOrder, dpState } = this.props;
    const { order } = this.state;
    const { pause } = dpState;
    let pauseState = false;
    if (originOrder !== order) {
      pauseState = true;
    } else {
      pauseState = pause;
    }
    return pauseState;
  }

  formatStepsData = ({ multiSteps = [] }) => {
    const status =
      multiSteps.length === 0
        ? {}
        : multiSteps.reduce(
            (pre, { items } = {}, index) => ({
              ...pre,
              ...{
                [index]: items.reduce(
                  // eslint-disable-next-line no-restricted-globals
                  (prv, { key, value }) => ({ ...prv, [key]: isNaN(+value) ? value : +value }),
                  {}
                ),
              },
            }),
            {}
          );
    return { steps: multiSteps, status };
  };

  handleStop = (ignore = false) => {
    const { multistep: multiStepCode, start: startCode, pause: pauseCode } = Config.codes;
    const { dpState, originOrder } = this.props;
    const { pause } = dpState;
    const { order, status, steps } = this.state;
    if ((pause && originOrder === order) || originOrder !== order || ignore) {
      const step = parseSteps(parseStatusToMutiSteps(status, steps));
      const putData = order.toString().padStart(2, '0') + step.slice(2);
      TYSdk.device
        .putDeviceData({
          [multiStepCode]: putData,
        })
        .then(data => {
          const post = {};
          startCode && (post[startCode] = true);
          pauseCode && (post[pauseCode] = !this.isPause);
          data && TYSdk.device.putDeviceData(post);
        });
    } else {
      TYSdk.device.putDeviceData({
        [pauseCode]: true,
      });
    }
  };

  renderTopbar() {
    return (
      <View style={styles.topbar}>
        <Topbar title=" " actions={[]} onBack={TYSdk.Navigator.pop} />
      </View>
    );
  }

  renderTopContentView() {
    const { order, steps } = this.state;
    const { picture } = _.get(steps, `${order}`, {});
    return (
      <View style={styles.topContentView}>
        {picture && (
          <Image
            source={{ uri: picture }}
            style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover' }]}
          />
        )}
        <Image
          source={Res.mask}
          style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover' }]}
        />
      </View>
    );
  }

  renderStepDesc = () => {
    const { order, steps } = this.state;
    const desc = parseStepDesc(steps, order);
    return <StepDescription index={order + 1} total={steps.length} desc={desc} />;
  };

  renderStepSetting = () => {
    const { order, steps, status } = this.state;
    const item = parseStepItem(steps, order);
    const codes = item.map(({ key }) => key);
    return (
      <ModeSettingView
        hideTopSeparator={true}
        dpCodes={codes}
        dataSource={status[order]}
        putDeviceData={this.onStatusChange}
      />
    );
  };

  render() {
    const { order, steps } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {this.renderTopContentView()}
        {this.renderTopbar()}
        {this.renderStepDesc()}
        <TYText style={styles.deviceCtrlTip}>{Strings.getLang('dev_control')}</TYText>
        {this.renderStepSetting()}
        <BottomButtonGroup
          themeColor={Config.themeColor}
          index={order}
          total={steps.length}
          handleStop={this.handleStop}
          onStepChange={this.onStepChange}
          isPause={this.isPause}
        />
      </View>
    );
  }
}
