import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import gateway from 'gateway';
import { Utils, TYText, IconFont, Dialog } from 'tuya-panel-kit';
import Strings from '../../i18n';
import ControllerBar from './ControllerBar';
import icons from 'icons/index';
import { getDpCodesByType, isCapability, getLedTypeIcon, formatPercent } from '../../utils';
import { updateCloud } from '../../redux/actions/cloud';
import BrightSlider from '../../components/BrightSlider';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProps {
  controllType: number;
  dpState: any;
  dimmerName: string;
  theme: any;
  devInfo: any;
  navigator: any;
}
interface IState {
  power: boolean;
  bright: number;
  minBright: number;
  maxBright: number;
  countdown: number;
  ledType: string;
}
class Dimmer extends React.Component<IProps, IState> {
  private brightRef: React.ReactNode;
  constructor(props: IProps) {
    super(props);
    this.state = this.initData(this.props);
  }
  componentWillReceiveProps(nextProps: IProps) {
    this.setState(this.initData(nextProps));
  }
  initData(props: IProps) {
    const { controllType, dpState, devInfo } = props;
    const {
      powerCode,
      brightCode,
      minBrightCode,
      maxBrightCode,
      countdownCode,
      ledTypeCode,
    } = getDpCodesByType(controllType, devInfo.schema);

    return {
      power: dpState[powerCode],
      bright: dpState[brightCode],
      minBright: dpState[minBrightCode] || 10,
      maxBright: dpState[maxBrightCode] || 1000,
      countdown: dpState[countdownCode] || 0,
      ledType: dpState[ledTypeCode] || 'led',
    };
  }

  handleChangeBright = (v: number) => {
    // 非signmesh
    // @ts-ignore
    this.brightRef.setText(Strings.formatValue('bright_percent', this.formatPercent(v)));
    if (!isCapability(15)) {
      const { controllType, devInfo } = this.props;
      const { brightCode } = getDpCodesByType(controllType, devInfo.schema);
      gateway.putDpData({ [brightCode]: v });
    }
  };
  handleCompleteBright = (v: number) => {
    const { controllType, devInfo } = this.props;
    const { brightCode } = getDpCodesByType(controllType, devInfo.schema);
    // @ts-ignore
    this.brightRef.setText(Strings.formatValue('bright_percent', this.formatPercent(v)));
    gateway.putDpData(
      { [brightCode]: v },
      {
        useThrottle: false,
        clearThrottle: true,
      }
    );
  };
  handleEditName = () => {
    const { controllType, dimmerName } = this.props;
    Dialog.prompt({
      title: Strings.getLang('edit_dimmer_name_title'),
      value: dimmerName,
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      onChangeText: (text: string) => text,
      onConfirm: (text: string) => {
        if (text.trim().length > 20) {
          Dialog.alert({
            title: Strings.getLang('dimmer_name_too_long'),
            confirmText: Strings.getLang('confirm'),
          });
        }
        text = Array.from(text.trim())
          .slice(0, 20)
          .join('');
        updateCloud(`dimmerName${controllType}`, text);
        Dialog.close();
      },
    });
  };
  //@ts-ignore
  formatPercent = (v: number) => formatPercent(v, { min: 10, max: 1000, minPercent: 1 });
  render() {
    const { dimmerName, controllType, theme, navigator } = this.props;
    const { power, bright, minBright, maxBright, ledType } = this.state;
    const { fontColor } = theme.standard;
    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={getLedTypeIcon(ledType)}
              style={[styles.lamp, { opacity: power ? 1 : 0.2 }]}
            />
            <View style={styles.nameBox}>
              <TYText numberOfLines={1} style={[styles.name, { color: fontColor }]}>
                {dimmerName}
              </TYText>
              <TouchableOpacity activeOpacity={0.8} onPress={this.handleEditName}>
                <IconFont d={icons.edit} size={cx(16)} color={fontColor} />
              </TouchableOpacity>
            </View>
            <View style={[styles.slider, { opacity: power ? 1 : 0.2 }]}>
              <TYText
                ref={(ref: React.ReactNode) => (this.brightRef = ref)}
                style={[styles.bright, { color: fontColor }]}
              >
                {Strings.formatValue('bright_percent', this.formatPercent(bright))}
              </TYText>
              <BrightSlider
                key={minBright + maxBright}
                disabled={!power || minBright >= maxBright}
                value={bright}
                min={minBright}
                max={minBright >= maxBright ? 1000 : maxBright}
                onValueChange={this.handleChangeBright}
                onSlidingComplete={this.handleCompleteBright}
              />
            </View>
          </View>
        </View>
        <ControllerBar controllType={controllType} navigator={navigator} />
      </View>
    );
  }
}

// @ts-ignore
export default connect(({ dpState, cloudState, devInfo }: any, { controllType }: any) => {
  return {
    dpState,
    devInfo,
    dimmerName:
      cloudState[`dimmerName${controllType}`] || Strings.formatValue('dimmer_name', controllType),
  };
})(withTheme(Dimmer));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lamp: {
    width: cx(128),
    height: cx(128),
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: cx(295),
  },
  name: {
    fontSize: cx(20),
    marginRight: cx(8),
  },
  bright: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    marginTop: cx(40),
  },
});
