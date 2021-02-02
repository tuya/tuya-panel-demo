import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { Utils, UnitText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import BlackModal from '../../components/black-modal';
import CurtainSlider from '../../components/curtain-slider';
import CurtainStatic from '../../components/curtain-static';
import Strings from '../../i18n';
import TYNative from '../../api';
import Res from '../../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

class HomeCurtainView extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    countdownLeft: PropTypes.number,
    percentState: PropTypes.number,
    percentControl: PropTypes.number,
    dpCodes: PropTypes.any,
    schema: PropTypes.any,
    workState: PropTypes.string,
    situation: PropTypes.string,
    timeTotal: PropTypes.number,
    control: PropTypes.string,
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    countdownLeft: 0,
    percentState: 0,
    percentControl: 0,
    schema: {},
    dpCodes: {},
    workState: '',
    situation: '',
    timeTotal: 0,
    control: 'stop',
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      countdown: props.countdownLeft,
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
    const { countdownLeft, percentState, percentControl } = this.props;
    if (this.dpCodes.countdownLeftCode) {
      if (countdownLeft !== nextProps.countdownLeft) {
        await this.setState(
          {
            countdown: nextProps.countdownLeft,
          },
          () => {
            nextProps.countdownLeft === 0 && clearInterval(this.timer);
          }
        );
      }
    }

    if (this.dpCodes.percentCode) {
      if (percentState !== nextProps.percentState) {
        await this.setState({
          moveVal: nextProps.percentState,
          isQuick: true,
          curValue: nextProps.percentState,
        });

        this._onDialogShow();
      }
    }

    if (this.dpCodes.percentControlCode) {
      if (percentControl !== nextProps.percentControl) {
        await this.setState({
          moveVal: nextProps.percentControl,
          isQuick: false,
          aimValue: nextProps.percentControl,
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
      dpCodes: {
        workState: workStateCode,
        countdown: countdownCode,
        countdownSet: countdownSetCode,
        countdownLeft: countdownLeftCode,
        timeTotal: timeTotalCode,
        percentControl: percentControlCode,
        percentState: percentCode,
        control: controlCode,
        situationSet: situationCode,
      },
    } = this.props;
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

    const { schema, workState } = this.props;
    const { range } = schema[this.dpCodes.workStateCode];
    return {
      workStateVisible: range.includes(workState),
    };
  };

  _getCurtainValueInit = props => {
    const { percentState, percentControl, workState } = props;
    if (this.dpCodes.percentCode) {
      return percentState;
    }
    if (this.dpCodes.percentControlCode) {
      return percentControl;
    }
    if (workState === 'closing') {
      return 100;
    }

    return 0;
  };

  _onDialogShow = () => {
    this.modalRef && this.modalRef.show();
  };

  _getCountDownTime = () => {
    clearInterval(this.timer);
    const { countdown } = this.state;
    const { workState } = this.props;
    // eslint-disable-next-line no-bitwise
    const hour = ~~(countdown / 3600);
    if (countdown > 0 && hour >= 0) {
      this.timer = setInterval(() => {
        this.setState({
          countdown: countdown - 1,
        });
      }, 1000);
    }

    const t = countdown;
    // eslint-disable-next-line no-bitwise
    const h = ~~(countdown / 3600);
    // eslint-disable-next-line no-bitwise
    const m = ~~(t / 60 - h * 60);
    const s = t % 60;

    return Strings.formatValue(
      workState === 'opening' ? 'timerOffTip' : 'timerOnTip',
      h > 0 ? `${h} ${+h > 1 ? Strings.t_hours : Strings.t_hour}` : '',
      m > 0 ? `${m} ${+m > 1 ? Strings.t_minutes : Strings.t_minute}` : '',
      s > 0 ? `${s} ${+s >= 1 ? Strings.t_seconds : Strings.t_second}` : ''
    );
  };

  _renderStatusView = () => {
    const { workState } = this.props;
    const { moving } = this.state;
    const { countdown, workStateVisible } = this.state;
    return (
      <View style={styles.statusView}>
        {!!this.dpCodes.workStateCode && (
          <Text style={styles.workStateText}>
            {workStateVisible && moving ? `${Strings.getDpLang('work_state', workState)}...` : ''}
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
    !!this.dpCodes.percentCode && this.modalRef && this.modalRef.show();
  };

  _animateStart = () => {
    this.setState({ moving: true });
  };

  _onCurtainSliderMove = () => {
    // dosomething
  };

  _onCurtainSliderEnd = async () => {
    await this.setState({
      moving: false,
    });
  };

  _getCurtainMoveType = () => {
    // dosomething
  };

  _onCurtainSliderComplete = value => {
    const { situation } = this.props;

    if (this.dpCodes.percentControlCode) {
      TYNative.putDeviceData({
        percent_control: Math.round(situation === 'fully_open' ? 100 - value : value),
      });
    }
  };

  _renderModalChild = () => {
    const { moveVal } = this.state;
    const val = Math.round(moveVal);
    return (
      <UnitText
        style={styles.brightNum}
        value={`${val}`}
        valueSize={cx(56)}
        valueColor="#fff"
        unit="%"
        unitSize={cx(40)}
        unitPaddingTop={8}
        unitPaddingLeft={8}
        unitPaddingBottom={0}
        unitColor="#fff"
      />
    );
  };

  render() {
    const { visible, moveVal, aimValue, isQuick, curValue, moving } = this.state;
    const { timeTotal, control, situation, schema } = this.props;

    let min = 0;
    let max = 100;
    if (this.dpCodes.percentControlCode) {
      const dpSchema = schema[this.dpCodes.percentControlCode];
      min = dpSchema.min;
      max = dpSchema.max;
    }
    const SOURCEImg = Res.curtainImg;
    const SOURCEBackground = Res.curtainBg;

    const shouldReverse = situation === 'fully_open';
    const onValueReverse = val => (shouldReverse ? 100 - val : val);
    const curtainSchema = {
      value: onValueReverse(moveVal),
      totalTime: timeTotal,
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
          <BlackModal
            ref={ref => {
              this.modalRef = ref;
            }}
          >
            {this._renderModalChild()}
          </BlackModal>
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
  workState: dpState[dpCodes.work_state],
  countdownLeft: dpState[dpCodes.countdown_left],
  timeTotal: dpState[dpCodes.time_total],
  percentState: dpState[dpCodes.percent_state],
  percentControl: dpState[dpCodes.percent_control],
  control: dpState[dpCodes.control],
  situation: dpState[dpCodes.situation],
  dpCodes,
  schema: devInfo.schema,
}))(HomeCurtainView);
