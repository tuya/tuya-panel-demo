import React, { PureComponent } from 'react';
import Color from 'color';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText, SwitchButton, TYSdk, IconFont } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import gateway from '../../../gateway';
import Strings from 'i18n/index';
import ScrollView from 'components/ScrollView';
import ModeBox from 'components/ModeBox';
import AirQuality from './AirQuality';
import Speed from './Speed';
import { formatCoundown, fetchUIData, getFaultStrings } from 'utils/index';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

const {
  powerCode,
  fanSpeedCode,
  airQualityCode,
  pm25Code,
  modeCode,
  loopModeCode,
  faultCode,
  countdownLeftCode,
} = dpCodes;

interface IProp {
  power: boolean;
  title: string;
  speed: number;
  airQuality: string;
  pm25: number;
  mode: string;
  loopMode: string;
  fault: any;
  countdown: number;
  theme?: any;
}

interface State {
  faultMsg: string;
  visibleFault: boolean;
}

class Main extends PureComponent<IProp, State> {
  constructor(props: IProp) {
    super(props);
    const msg = getFaultStrings(faultCode, this.props.fault);

    this.state = {
      faultMsg: msg,
      visibleFault: !!msg,
    };
  }
  componentWillReceiveProps(nextProps: IProp) {
    if (nextProps.fault !== this.props.fault) {
      const msg = getFaultStrings(faultCode, nextProps.fault);
      if (!!msg) {
        this.closeFault();
      } else {
        this.shosFault(msg);
      }
    }
  }
  closeFault = () => {
    this.setState({ visibleFault: false, faultMsg: '' });
  };
  shosFault = (msg: string) => {
    this.setState({ visibleFault: true, faultMsg: msg });
  };
  handlePower = (power: boolean) => {
    gateway.putDpData({ [powerCode]: power });
  };
  handleChangeMode = (mode: string) => {
    gateway.putDpData({ [modeCode]: mode });
  };
  handleChangeLoopMode = (mode: string) => {
    gateway.putDpData({ [loopModeCode]: mode });
  };
  getColor() {
    const {
      power,
      airQuality,
      theme: {
        global: { brand: themeColor, fontColor },
      },
    } = this.props;

    if (power) {
      try {
        return Color(Strings.getLang(`airColor_${airQuality}`)).rgbaString();
      } catch (e) {
        return themeColor;
      }
    }
    return fontColor;
  }

  render() {
    const {
      title,
      power,
      airQuality,
      speed,
      pm25,
      mode,
      loopMode,
      countdown,
      theme: {
        global: { brand: themeColor },
      },
    } = this.props;
    const { visibleFault, faultMsg } = this.state;
    const modeSchema = TYSdk.device.getDpSchema(modeCode);
    const loopModeSchema = TYSdk.device.getDpSchema(loopModeCode);

    return (
      <ScrollView style={styles.box}>
        <View style={styles.info}>
          <AirQuality power={power} pm25={pm25} airQuality={airQuality} />
          <TYText style={styles.title}>{title}</TYText>
          <View style={styles.power}>
            <TYText style={styles.powerLabel}>{Strings.getDpLang(powerCode)}</TYText>
            <SwitchButton value={power} onValueChange={this.handlePower} style={styles.powerBtn} />
          </View>
          <TYText style={[styles.infoText, { opacity: power ? 1 : 0.4, color: this.getColor() }]}>
            {power
              ? Strings.getDpLang(airQualityCode, airQuality)
              : Strings.getDpLang(powerCode, 'off')}
          </TYText>
          <Speed />
        </View>
        {visibleFault && (
          <View style={styles.fault}>
            <TYText style={styles.faultText}>{faultMsg}</TYText>
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={this.closeFault}>
              <IconFont name="close" size={10} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
        {!!countdown && (
          <View
            style={[
              styles.countdown,
              {
                backgroundColor: Color(themeColor)
                  .alpha(0.2)
                  .rgbaString(),
              },
            ]}
          >
            <TYText style={[styles.countdownText, { color: themeColor }]}>
              {Strings.formatValue(
                power ? 'countdownOff' : 'countdownOn',
                formatCoundown(countdown)
              )}
            </TYText>
          </View>
        )}
        <View style={styles.modeBox}>
          <ModeBox
            disabled={!power}
            style={{ opacity: power ? 1 : 0.4 }}
            value={mode}
            title={Strings.getDpLang(modeCode)}
            dataSource={fetchUIData(modeCode)}
            onChange={this.handleChangeMode}
          />
          <ModeBox
            disabled={!power}
            style={{ opacity: power ? 1 : 0.4 }}
            value={loopMode}
            title={Strings.getDpLang(loopModeCode)}
            dataSource={fetchUIData(loopModeCode)}
            onChange={this.handleChangeLoopMode}
          />
        </View>
      </ScrollView>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  power: dpState[powerCode],
  speed: dpState[fanSpeedCode],
  airQuality: dpState[airQualityCode],
  pm25: dpState[pm25Code],
  mode: dpState[modeCode],
  loopMode: dpState[loopModeCode],
  title: devInfo.name,
  fault: dpState[faultCode],
  countdown: dpState[countdownLeftCode],
}))(withTheme(Main));

const styles = StyleSheet.create({
  box: { flex: 1 },
  info: {
    width: '100%',
    marginTop: 32,
    paddingLeft: cx(24),
  },
  title: { fontSize: cx(28) },
  power: {
    marginTop: cx(60),
  },
  powerLabel: {
    fontSize: cx(14),
  },
  powerBtn: {
    marginTop: cx(20),
  },
  infoText: {
    fontSize: cx(50),
    marginTop: cx(45),
  },
  modeBox: {
    marginTop: 50,
    paddingHorizontal: cx(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fault: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cx(40),
    borderRadius: 20,
    height: 36,
    backgroundColor: 'rgba(255,68,68,.2)',
    marginTop: cx(24),
    marginHorizontal: cx(24),
  },
  faultText: {
    fontSize: 14,
    color: '#ff4444',
  },
  closeBtn: {
    width: cx(20),
    height: cx(20),
    position: 'absolute',
    right: cx(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cx(40),
    borderRadius: 20,
    height: 36,
    marginTop: cx(24),
    marginHorizontal: cx(24),
  },
  countdownText: {
    fontSize: 14,
  },
});
