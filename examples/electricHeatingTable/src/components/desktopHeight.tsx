import React, { PureComponent } from 'react';
import { View, Image, Animated, TouchableOpacity } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { updateDp } from '../redux/modules/common';
import { DpState } from '../config/interface';
import styles from '../config/styles';
import imgs from '../res';
import { createAnimation, i18n } from '../utils';
import { TYDevice } from '../api';
import { defaultThemeColor } from '../config/boxConfig';
import { ReduxType } from '../redux/combine';

const imgsAction = [
  { name: 'up', img: imgs.desktopUp },
  { name: 'down', img: imgs.desktopDown },
];

interface MainProps {
  desktopHeight: string[];
  ifShowContent: boolean;
  dpState: DpState;
}
interface State {
  action: string;
  upTop: object;
  downTop: object;
  upOpacity: object;
  downOpacity: object;
  [key: string]: any;
}
class DesktopHeight extends PureComponent<MainProps, State> {
  isFirstIn: boolean = true;
  action: boolean = true;
  state: State = {
    action: '',
    upTop: new Animated.Value(-15),
    downTop: new Animated.Value(-15),
    upOpacity: new Animated.Value(0),
    downOpacity: new Animated.Value(0),
    limitAction: false,
  };
  timerHandle: number;
  componentWillUnmount = () => {
    clearTimeout(this.timerHandle);
  };
  componentDidMount = () => {
    if (this.props.dpState.up_down !== 'stop' && this.props.dpState.up_down !== '') {
      this.action = true;
      this.isFirstIn = true;
      this.setState({ action: this.props.dpState.up_down });
      this._onLongPress(this.props.dpState.up_down);
    }
  };
  componentWillReceiveProps = (nextProps: MainProps) => {
    if (
      nextProps.dpState.up_down !== this.props.dpState.up_down &&
      nextProps.dpState.up_down !== ''
    ) {
      if (nextProps.dpState.up_down !== 'stop' && this.props.dpState.up_down === 'stop') {
        this.action = true;
        this.isFirstIn = true;
        this._onLongPress(nextProps.dpState.up_down);
      }
      if (nextProps.dpState.up_down !== 'stop' && this.props.dpState.up_down !== 'stop') {
        ['up', 'down'].includes(this.props.dpState.up_down) &&
          this._onPressOut(this.props.dpState.up_down);
        this.action = true;
        this.isFirstIn = true;
        this._onLongPress(nextProps.dpState.up_down);
      }
      if (nextProps.dpState.up_down === 'stop' && this.props.dpState.up_down !== '') {
        this._onPressOut(this.props.dpState.up_down);
      }
    }
    if (nextProps.ifShowContent !== this.props.ifShowContent && !nextProps.ifShowContent) {
      this.setState({
        upOpacity: new Animated.Value(0),
        downOpacity: new Animated.Value(0),
      });
    }
  };

  _onLongPress = (action?: string) => {
    if (this.action !== true) return;
    Animated.parallel([
      createAnimation(this.state[`${action}Opacity`], 1),
      createAnimation(this.state[`${action}Top`], -30),
    ]).start(() => {
      createAnimation(this.state[`${action}Top`], -15).start(() => {
        this._onLongPress(action);
      });
    });
    this.state.action !== action && this.setState({ action: action as string });
  };

  _onPressOut = (action?: string) => {
    this.action = false;
    Animated.parallel([
      createAnimation(this.state[`${action}Top`], -15, 600),
      createAnimation(this.state[`${action}Opacity`], 0, 600),
    ]).start();
    this.setState({ action: '' });
  };

  render() {
    if (!this.props.ifShowContent) return null;
    const { upTop, downTop, upOpacity, downOpacity } = this.state;
    const { dpState } = this.props;
    return (
      <View>
        <View style={styles.boxTitle}>
          <TYText style={styles.titleText}>{i18n('desktop')}</TYText>
          <TYText style={styles.tipsText}>{i18n('desktopHeight')}</TYText>
        </View>
        <View style={styles.actionBox}>
          <Animated.Image
            source={imgs.up}
            style={{ position: 'absolute', top: upTop, opacity: upOpacity }}
            resizeMode="stretch"
          />
          <View style={styles.upDownBox}>
            {imgsAction.map(item => {
              const tintColor = this.state.action === item.name ? defaultThemeColor : '#fff';
              const backgroundColor =
                this.state.action === item.name ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.2)';
              return (
                <TouchableOpacity
                  activeOpacity={1}
                  disabled={!dpState.switch || this.state.limitAction || dpState.child_lock}
                  style={[styles.actionCircle, { backgroundColor }]}
                  key={item.name}
                  onLongPress={() => {
                    this.setState({ limitAction: true });
                    TYDevice.putDeviceData({ up_down: item.name }).then(
                      (res: { success: boolean }) => {
                        res.success && this.setState({ action: item.name });
                      }
                    );
                    this.timerHandle = setTimeout(() => {
                      this.setState({ limitAction: false });
                    }, 200);
                  }}
                  onPressOut={() => {
                    this.setState({ limitAction: true });
                    TYDevice.putDeviceData({ up_down: 'stop' }).then(
                      (res: { success: boolean }) => {
                        res.success && this.setState({ action: '' });
                      }
                    );
                    this.timerHandle = setTimeout(() => {
                      this.setState({ limitAction: false });
                    }, 200);
                  }}
                >
                  <Image
                    source={item.img}
                    style={[
                      { tintColor },
                      {
                        opacity: !dpState.switch || dpState.child_lock ? 0.5 : 1,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <Animated.Image
            source={imgs.up}
            style={{
              transform: [{ rotate: '180deg' }],
              position: 'absolute',
              bottom: downTop,
              opacity: downOpacity,
            }}
            resizeMode="stretch"
          />
        </View>
      </View>
    );
  }
}

export default connect(
  ({ dpState }: ReduxType) => ({
    dpState,
  }),
  {
    updateDp,
  }
)(DesktopHeight);
