/* eslint-disable */
import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { Utils, UnitText } from 'tuya-panel-kit';
import BlackModal from '../../components/black-modal';
import CurtainOneSlider from '../../components/curtain-one-slider';
import CurtainRollerSlider from '../../components/curtain-roller-silder';
import CurtainSlider from '../../components/curtain-slider';
import CurtainStatic from '../../components/curtain-static';
import { connect } from 'react-redux';
import Strings from '../../i18n';
import TYNative from '../../api';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const Res = {
  curtainImg: require('../../res/left.png'),
  curtainBg: require('../../res/rail.png'),
};

class HomeCurtainView extends Component {
  static propTypes = {
    countdown_left: PropTypes.number,
  };

  static defaultProps = {
    countdown_left: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      countdown: props.countdown_left,
      moving: false,
      isQuick: false,
      aimValue: 0,
      curValue: 0,
      moveVal: this._getCurtainValueInit(this.props),
      ...this._getWorkStateStatus(),
    };

    this.timer = null;
  }

  async componentDidMount() {
    (this.dpCodes.percentCode || this.dpCodes.percentControlCode) && this._onDialogShow();
  }

  async componentWillReceiveProps(nextProps) {
    if (this.dpCodes.countdownLeftCode) {
      if (this.props.countdown_left !== nextProps.countdown_left) {
        await this.setState(
          {
            countdown: nextProps.countdown_left,
          },
          () => {
            nextProps.countdown_left === 0 && clearInterval(this.timer);
          }
        );
      }
    }

    if (this.dpCodes.percentCode) {
      if (this.props.percent_state !== nextProps.percent_state) {
        await this.setState({
          moveVal: nextProps.percent_state,
          isQuick: true,
          curValue: nextProps.percent_state,
        });

        this._onDialogShow();
      }
    }

    if (this.dpCodes.percentControlCode) {
      if (this.props.percent_control !== nextProps.percent_control) {
        await this.setState({
          moveVal: nextProps.percent_control,
          isQuick: false,
          aimValue: nextProps.percent_control,
        });

        this._onDialogShow();
      }
    }

    if (this.dpCodes.controlCode) {
      if (nextProps[this.dpCodes.controlCode] === 'stop') {
        await this.setState({
          moving: false,
        });
      }
    }
  }

  get dpCodes() {
    const {
      workState: workStateCode,
      countdown: countdownCode,
      countdownSet: countdownSetCode,
      countdownLeft: countdownLeftCode,
      timeTotal: timeTotalCode,
      percentControl: percentControlCode,
      percentState: percentCode,
      control: controlCode,
      situationSet: situationCode,
    } = this.props.dpCodes;
    return {
      workStateCode,
      countdownCode,
      countdownSetCode,
      countdownLeftCode,
      timeTotalCode,
      percentControlCode,
      percentCode,
      controlCode,
      situationCode,
    };
  }

  _getWorkStateStatus = () => {
    const workStateVisible = false;
    if (!this.dpCodes.workStateCode) return { workStateVisible };

    const schema = this.props.schema[this.dpCodes.workStateCode];
    const { range } = schema;
    const { work_state } = this.props;

    return {
      workStateVisible: range.includes(work_state),
    };
  };

  _getCurtainValueInit = props => {
    return this.dpCodes.percentCode
      ? props.percent_state
      : this.dpCodes.percentControlCode
      ? props.percent_control
      : props.work_state === 'closing'
      ? 100
      : 0;
  };

  _onDialogShow = () => {
    this.refs.modal.show();
  };

  _getCountDownTime = () => {
    clearInterval(this.timer);
    const { countdown } = this.state;
    const { work_state } = this.props;
    const hour = ~~(countdown / 3600);
    if (countdown > 0 && hour >= 0) {
      this.timer = setInterval(() => {
        this.setState({
          countdown: countdown - 1,
        });
      }, 1000);
    }

    const t = countdown;
    const h = ~~(countdown / 3600);
    const m = ~~(t / 60 - h * 60);
    const s = t % 60;

    return Strings.formatValue(
      work_state === 'opening' ? 'timerOffTip' : 'timerOnTip',
      h > 0 ? `${h} ${+h > 1 ? Strings.t_hours : Strings.t_hour}` : '',
      m > 0 ? `${m} ${+m > 1 ? Strings.t_minutes : Strings.t_minute}` : '',
      s > 0 ? `${s} ${+s >= 1 ? Strings.t_seconds : Strings.t_second}` : ''
    );
  };

  _renderStatusView = () => {
    const { work_state } = this.props;

    const { moving } = this.state;

    const { countdown, workStateVisible } = this.state;
    console.log('object', this._getCountDownTime())
    return (
      <View style={styles.statusView}>
        {!!this.dpCodes.workStateCode && (
          <Text style={styles.workStateText}>
            {workStateVisible && moving ? Strings.getDpLang('work_state', work_state) + '...' : ''}
          </Text>
        )}
        {(this.dpCodes.countdownCode || this.dpCodes.countdownSetCode) && (
          <Text style={styles.countdownText}>
            {this.dpCodes.countdownLeftCode && countdown > 0 ? this._getCountDownTime() : ''}
          </Text>
        )}
      </View>
    );
  };

  _onCurtainSliderStart = () => {
    !!this.dpCodes.percentCode && this.refs.modal.show();
  };

  _animateStart = () => {
    this.setState({ moving: true });
  };

  _onCurtainSliderMove = value => {
    // dosomething
  };

  _onCurtainSliderEnd = async value => {
    await this.setState({
      moving: false,
    });
  };

  _getCurtainMoveType = type => {
    // dosomething
  };

  _onCurtainSliderComplete = value => {
    const { situation } = this.props;

    if (!!this.dpCodes.percentControlCode) {
      TYNative.putDeviceData({
        percent_control: Math.round(situation === 'fully_open' ? 100 - value : value),
      });
    }
  };

  _renderModalChild = () => {
    const val = Math.round(this.state.moveVal);
    return (
      <UnitText
        style={styles.brightNum}
        value={`${val}`}
        valueSize={cx(56)}
        valueColor={'#fff'}
        unit={'%'}
        unitSize={cx(40)}
        unitPaddingTop={8}
        unitPaddingLeft={8}
        unitPaddingBottom={0}
        unitColor={'#fff'}
      />
    );
  };

  render() {
    const { visible, moveVal, aimValue, isQuick, curValue, moving } = this.state;
    const { time_total, control, situation } = this.props;

    let min = 0;
    let max = 100;
    if (this.dpCodes.percentControlCode) {
      const schema = this.props.schema[this.dpCodes.percentControlCode];
      min = schema.min;
      max = schema.max;
    }
    const SOURCEImg = Res.curtainImg;
    const SOURCEBackground = Res.curtainBg;

    const shouldReverse = situation === 'fully_open';
    const onValueReverse = val => (shouldReverse ? 100 - val : val);
    const curtainSchema = {
      value: onValueReverse(moveVal),
      totalTime: time_total,
      circleColor: '#fff',
      curPower: control,
      showPoint: !!this.dpCodes.percentControlCode,
      curtainImg: SOURCEImg,
      curtainBg: SOURCEBackground,
      min,
      max,
      isQuick,
      aimValue: onValueReverse(aimValue),
      curValue: onValueReverse(curValue),
      moving,
      disabled: false,
      shouldReverse,
    };
    const CurtainSliderComponent = CurtainSlider; // CurtainRollerSlider | CurtainOneSlider | CurtainSlider

    const mode = (
      <View style={[styles.defaultContainer, styles.container]}>
        <View style={styles.background} />
        {this.dpCodes.percentControlCode || this.dpCodes.percentCode ? (
          <CurtainSliderComponent
            {...curtainSchema}
            onStart={this._onCurtainSliderStart}
            animateStart={this._animateStart}
            onMove={this._onCurtainSliderMove}
            onEnd={this._onCurtainSliderEnd}
            moveType={this._getCurtainMoveType}
            onComplete={this._onCurtainSliderComplete}
            lineColor="#333"
          />
        ) : (
          <CurtainStatic
            {...curtainSchema}
            onStart={this._onCurtainSliderStart}
            animateStart={this._animateStart}
            onEnd={this._onCurtainSliderEnd}
          />
        )}
        {this._renderStatusView()}
        {(this.dpCodes.percentCode || this.dpCodes.percentControlCode) && (
          <BlackModal ref={'modal'}>{this._renderModalChild()}</BlackModal>
        )}
      </View>
    );

    return visible ? mode : <View style={styles.defaultContainer} />;
  }
}

const styles = StyleSheet.create({
  container: {
    width: cx(375),
    height: cy(318),
    backgroundColor: 'transparent',
    borderRadius: cx(7),
    alignItems: 'center',
    justifyContent: 'center',
  },

  background: {
    width: cx(375),
    height: cy(318),
    position: 'absolute',
    backgroundColor: 'transparent',
  },

  defaultContainer: {},

  statusView: {
    position: 'absolute',
    bottom: 0,
    width: cx(375),
    minHeight: cy(25),
    maxHeight: cy(50),
    alignItems: 'center',
    justifyContent: 'center',
  },

  workStateText: {
    fontSize: cx(16),
    height: Math.max(20, cy(20)),
    color: '#333',
    fontWeight: '600',
  },

  countdownText: {
    marginTop: cy(6),
    fontSize: cx(16),
    color: '#333',
  },
});

export default connect(({ dpState, dpCodes, devInfo }) => ({
  work_state: dpState[dpCodes.work_state],
  countdown_left: dpState[dpCodes.countdown_left],
  time_total: dpState[dpCodes.time_total],
  percent_state: dpState[dpCodes.percent_state],
  percent_control: dpState[dpCodes.percent_control],
  control: dpState[dpCodes.control],
  situation: dpState[dpCodes.situation],
  dpCodes,
  schema: devInfo.schema,
}))(HomeCurtainView);
