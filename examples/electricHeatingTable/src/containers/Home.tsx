import React, { PureComponent } from 'react';
import { View, Animated, TouchableWithoutFeedback } from 'react-native';
import { TYText, IconFont } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from '../config/styles';
import HomeSwitchOff from './home/home-switch-off';
import Switch from './home/home-switch-on/switch';
import OtherMessage from './home/home-switch-on/otherMessage';
import FunctionBox from './home/home-switch-on/functionBox';
import { updateDp } from '../redux/modules/common';
import { ReduxType } from '../redux/combine';
import { DpState } from '../config/interface';
import { createAnimation, cx, cy, getFaultName } from '../utils';
import Strings from '../i18n';

interface MainProps {
  dpState: DpState;
  updateDp: (obj: { [key: string]: any }) => void;
  navigator: { push: (obj: { [key: string]: any }) => void };
  devInfo: { [key: string]: any };
}
interface State {
  ifShowToast: boolean;
  _key: object;
  textTop: number;
  switchTop: number;
  boxWidth: { _value: number } | number;
  textRight: number;
  boxBottom: number;
  switchOffTextOpacity: { _value: number } | number;
  messageTextOpacity: { _value: number } | number;
  ifShowText: { _value: number } | number;
  showFunction: boolean;
}
class Home extends PureComponent<MainProps, any> {
  state: State = {
    ifShowToast: false,
    _key: {},
    showFunction: false,
    textTop: 0,
    switchTop: 0,
    boxWidth: 0,
    textRight: 0,
    boxBottom: 0,
    switchOffTextOpacity: 0,
    messageTextOpacity: 0,
    ifShowText: 0,
  };
  showFunction: boolean = false;
  isRenderInit: boolean = true;
  useSwitchAnimated: boolean;
  hasSwitch: boolean = true;
  componentDidMount = () => {
    this.renderInit();
    if (typeof this.props.dpState.fault === 'number' && this.props.dpState.fault !== 0) {
      this.setState({ ifShowToast: true });
    }
  };
  componentWillReceiveProps = (nextProps: MainProps) => {
    if (nextProps.dpState.switch !== this.props.dpState.switch) {
      this.switchMove(nextProps.dpState.switch);
    }
    if (nextProps.dpState.fault !== this.props.dpState.fault) {
      this.setState({ ifShowToast: !(nextProps.dpState.fault === 0) });
    }
  };
  getTextRight = () => {
    const schema = Object.keys(this.props.devInfo.schema);
    if (schema.includes('temp_current') && schema.includes('capacity_current')) {
      return cx(16);
    } else if (schema.includes('temp_current') || schema.includes('capacity_current')) {
      return cx(-60);
    }
    return cx(-200);
  };
  renderInit = () => {
    const ifUseStartUpAnimated =
      _.get(this.props.devInfo, 'panelConfig.fun.ifUseStartUpAnimated') !== undefined
        ? _.get(this.props.devInfo, 'panelConfig.fun.ifUseStartUpAnimated')
        : true;
    this.hasSwitch = Object.keys(this.props.dpState).includes('switch');
    this.useSwitchAnimated = ifUseStartUpAnimated === undefined ? true : ifUseStartUpAnimated;
    const myswitch = this.props.dpState.switch;
    if (!this.useSwitchAnimated) {
      this.setState({
        showFunction: true,
        textTop: new Animated.Value(-300),
        switchTop: new Animated.Value(0),
        boxBottom: new Animated.Value(0),
        boxWidth: new Animated.Value(myswitch ? cx(54) : cx(154)),
        textRight: new Animated.Value(this.getTextRight()),
        textLeft: new Animated.Value(cx(54)),
        switchOffTextOpacity: new Animated.Value(1),
        messageTextOpacity: new Animated.Value(1),
        ifShowText: new Animated.Value(+!myswitch),
      });
    } else {
      this.setState({
        showFunction: myswitch ? true : false,
        textTop: new Animated.Value(myswitch ? -300 : 0),
        switchTop: new Animated.Value(myswitch ? 0 : cy(480)),
        boxBottom: new Animated.Value(myswitch ? 0 : cy(-1000)),
        boxWidth: new Animated.Value(myswitch ? cx(54) : cx(154)),
        textRight: new Animated.Value(myswitch ? this.getTextRight() : cx(-200)),
        textLeft: new Animated.Value(myswitch ? cx(54) : cx(-100)),
        switchOffTextOpacity: new Animated.Value(myswitch ? 0.5 : 1),
        messageTextOpacity: new Animated.Value(myswitch ? 1 : 0.5),
        ifShowText: new Animated.Value(myswitch ? 0 : 1),
      });
    }
  };

  onPressSwitch = () => {
    this.props.updateDp({ switch: !this.props.dpState.switch });
  };
  renderFaultView = () => {
    return (
      <View style={styles.faultView}>
        <IconFont name="warning" size={cx(18)} fill="#d6ac08" />
        <TYText style={styles.faultText}>
          {Strings.getDpLang(
            'fault',
            getFaultName(this.props.dpState.fault!, this.props.devInfo.schema.fault.label)
          )}
        </TYText>
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({ ifShowToast: false });
          }}
        >
          <View style={styles.closeView}>
            <IconFont name="close" size={cx(14)} fill="#666" />
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };
  switchMove = (switchState?: boolean) => {
    const {
      textTop,
      switchTop,
      boxWidth,
      textRight,
      boxBottom,
      switchOffTextOpacity,
      messageTextOpacity,
      ifShowText,
    } = this.state;
    if (!this.useSwitchAnimated) {
      Animated.parallel([
        createAnimation(boxWidth, switchState ? cx(54) : cx(154)),
        createAnimation(ifShowText, +!switchState, 100),
      ]).start(() => {
        this.setState({ _key: new Date() });
      });
    } else {
      Animated.parallel([
        createAnimation(textTop, switchState ? -300 : 0),
        createAnimation(switchTop, switchState ? 0 : cy(480)),
        createAnimation(boxBottom, switchState ? 0 : cy(-1000)),
        createAnimation(boxWidth, switchState ? cx(54) : cx(154)),
        createAnimation(ifShowText, switchState ? 0 : 1, 100),
        createAnimation(textRight, switchState ? this.getTextRight() : cx(-200)),
        createAnimation(switchOffTextOpacity, switchState ? 0.5 : 1),
        createAnimation(messageTextOpacity, switchState ? 1 : 0),
      ]).start(() => {
        this.setState({ showFunction: true, _key: new Date() });
      });
    }
  };
  render() {
    if (this.state.switchTop === 0) return null;
    const {
      _key,
      showFunction,
      textTop,
      switchTop,
      boxBottom,
      boxWidth,
      textRight,
      switchOffTextOpacity,
      messageTextOpacity,
      ifShowText,
    } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.root}>
          <Animated.View style={{ position: 'absolute', top: textTop }}>
            <HomeSwitchOff
              switchOffTextOpacity={(switchOffTextOpacity as { _value: number })._value}
            />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', right: textRight }}>
            <OtherMessage messageTextOpacity={(messageTextOpacity as { _value: number })._value} />
          </Animated.View>
          {this.hasSwitch && (
            <Animated.View style={{ position: 'absolute', top: switchTop }}>
              <Switch
                onPressSwitch={() => this.onPressSwitch()}
                _key={_key}
                boxWidth={(boxWidth as { _value: number })._value}
                ifShowText={!!(ifShowText as { _value: number })._value}
              />
            </Animated.View>
          )}
        </View>
        {((showFunction && this.useSwitchAnimated) || !this.useSwitchAnimated) && (
          <Animated.View style={{ position: 'absolute', bottom: boxBottom }}>
            <FunctionBox navigator={this.props.navigator} />
          </Animated.View>
        )}
        {this.state.ifShowToast && this.renderFaultView()}
      </View>
    );
  }
}

export default connect(({ dpState, devInfo }: ReduxType) => ({ dpState, devInfo }), {
  updateDp,
})(Home);
