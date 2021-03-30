import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { filter as _filter, isEmpty as _isEmpty, pick as _pick, get as _get } from 'lodash';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Utils, TYSdk, Popup, ControllerBar } from 'tuya-panel-kit';
import Res from '../../res';
import Strings from '../../i18n';
import Setting from '../setting';
import Icons from '../../icons';
import DpCodes from '../../config/dpCodes';
import { getCodes } from '../../utils';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { lightMode, switchBacklight } = DpCodes;
const NOPERCENT = {
  0: 50,
  1: 50,
};
const TYDevice = TYSdk.device;

interface bottomProps {
  isDefault: boolean;
  dpState: any;
  names: any;
  themeColor: any;
}
class Bottom extends PureComponent<bottomProps> {
  constructor(props: bottomProps) {
    super(props);
    const schema = TYDevice.getDpSchema();
    this.switches = _filter(
      schema,
      d => /^control?/.test(d.code) && d.code !== 'control_back' && d.code !== 'control_back_2'
    );
    this.percents = _filter(schema, d => /^percent_control/.test(d.code));
  }

  get data() {
    const { dpState } = this.props;
    const isAllOn = true;
    const isGroup = !!_get(TYSdk.devInfo, 'groupId');
    const powers = _pick(
      dpState,
      this.switches.map((d: any) => d.code)
    );
    const values =
      this.percents.length > 0
        ? _pick(dpState, this.percents.map((d: any) => d.code))
        : NOPERCENT;
    const allStop = Object.values(powers).every(d => d === 'stop');
    const isFull = Object.values(values).every(d => d === 100);
    const isZero = Object.values(values).every(d => d === 0);
    // 可隐藏全开/全关按钮
    const hideAllOn = false;
    const useCodes = getCodes(this.switches[0].code, lightMode, switchBacklight);
    return [
      {
        key: 'allOff',
        text: Strings.getLang('allOff'),
        textStyle: { color: '#fff' },
        onPress: () => this._handleToToggleAll(!isAllOn),
        iconPath: Icons.off,
        iconSize: 30,
        iconColor: '#fff',
        disabled: allStop && isZero,
        disabledOpacity: 0.5,
        show: !hideAllOn && !isGroup,
      },
      {
        key: 'schedule',
        text: Strings.getLang('schedule'),
        textStyle: { color: '#fff' },
        onPress: this._handleToSchedule,
        iconPath: Icons.schedule,
        iconSize: 30,
        iconColor: '#fff',
        disabled: false,
        opacity: 1,
        show: true,
      },
      {
        key: 'setting',
        text: Strings.getLang('set'),
        textStyle: { color: '#fff' },
        onPress: this._handleToSet,
        iconPath: Icons.set,
        iconSize: 30,
        iconColor: '#fff',
        disabled: false,
        opacity: 1,
        show: useCodes.length > 0,
      },
      {
        key: 'allOn',
        text: Strings.getLang('allOn'),
        textStyle: { color: '#fff' },
        onPress: () => this._handleToToggleAll(isAllOn),
        iconPath: Icons.on,
        iconSize: 30,
        iconColor: '#fff',
        disabled: allStop && isFull,
        disabledOpacity: 0.5,
        show: !hideAllOn && !isGroup,
      },
    ].filter(({ show }) => show);
  }

  switches: any;

  percents: any;

  _handleToggle = (code: string, value: boolean) => {
    const isBack = code.slice(0, 12) === 'control_back';
    let cmd = {};
    if (isBack) {
      const { range } = TYDevice.getDpSchema(code);
      if (!range) return;
      cmd = {
        [code]: value ? range[0] : range[1],
      };
    } else {
      cmd = {
        [code]: value,
      };
    }
    TYDevice.putDeviceData(cmd);
  };

  _handleToToggleAll = (isAllOn: boolean) => {
    const OPEN = 'open';
    const CLOSE = 'close';
    let cmd: any = {};
    // eslint-disable-next-line array-callback-return
    this.switches.map((schema: any) => {
      const { dpState } = this.props;
      const { code } = schema;
      const percentCode = code.replace(/control/, 'percent_control');
      const control = dpState[code];
      const percent = dpState[percentCode];
      const needOnControl = control !== OPEN && percent !== 100;
      const needOffControl = control !== CLOSE && percent !== 0;
      const needControl = isAllOn ? needOnControl : needOffControl;
      if (needControl) {
        cmd = {
          ...cmd,
          [code]: isAllOn ? OPEN : CLOSE,
        };
      }
    });
    !_isEmpty(cmd) && TYDevice.putDeviceData(cmd);
  };

  _handleToSchedule = () => {
    TYSdk.Navigator.push({
      id: 'timer',
    });
  };

  _handleToSet = () => {
    const { themeColor } = this.props;
    Popup.custom({
      content: <Setting themeColor={themeColor} />,
      footerType: 'singleCancel',
      cancelText: '',
      wrapperStyle: styles.wrapperStyle,
      titleWrapperStyle: styles.titleWrapperStyle,
      footerWrapperStyle: styles.footerWrapperStyle,
    });
  };

  render() {
    const { isDefault } = this.props;
    const bg = isDefault ? Res.bottomBg1 : Res.bottomBg2;
    return (
      <View style={styles.root}>
        <ImageBackground source={bg} style={styles.bg} resizeMode="stretch">
          <ControllerBar style={styles.controller} button={this.data} />
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    width: cx(376),
    height: isIphoneX ? cx(112) : cx(100),
    position: 'absolute',
    bottom: 0,
  },
  bg: {
    width: cx(376),
    height: isIphoneX ? cx(112) : cx(100),
  },
  controller: {
    height: isIphoneX ? cx(112) : cx(100),
    paddingBottom: isIphoneX ? cx(12) : 0,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  wrapperStyle: {
    width: cx(360),
    borderRadius: cx(16),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: cx(16),
  },
  titleWrapperStyle: {
    height: 0,
    borderBottomWidth: 0,
    borderRadius: cx(16),
  },
  footerWrapperStyle: {
    display: 'none',
    height: 0,
    borderBottomWidth: 0,
    borderRadius: cx(16),
    backgroundColor: 'transparent',
  },
});

export default connect(({ dpState, socketState }: any) => ({
  dpState,
  names: socketState.socketNames,
}))(Bottom);
