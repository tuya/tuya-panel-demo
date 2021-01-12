import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYText, TYSdk, Popup, Dialog } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import Strings from 'i18n/index';
import ScrollView from 'components/ScrollView';
import { RowButton, Group } from 'components/RowButton';
import {
  isSupportCountdown,
  isSupportParam,
  formatCoundown,
  isSupportSupply,
  isSupportExhaust,
  formatExhaust,
  formatSupply,
  isSupportDp,
  fetchCustomDps,
} from 'utils/index';
import icons from 'icons/index';
import gateway from '../../../gateway';
import Countdown from './Countdown';
import SupplySetting from './SupplySetting';
import ExhaustSetting from './ExhaustSetting';
import DpSetting from './DpSetting';

const { convertX: cx } = Utils.RatioUtils;

const {
  powerCode,
  countdownLeftCode,

  supplyAirVolCode,
  supplyTempCode,
  supplyFanSpeedCode,

  exhaustTempCode,
  exhaustAirVolCode,
  exhaustFanSpeedCode,

  purifyModeCode,
  backLightCode,
  filterLifeCode,
  highFilterLifeCode,
  mediumFilterLifeCode,
  primaryFilterLifeCode,

  factoryResetCode,
  airConditioningCode,
  anionCode,
  sterilizeCode,
  childLockCode,
  purificationCode,
  HeatCode,
  defrostCode,
  uvLightCode,
  bypassFunctionCode,
} = dpCodes;

enum TabType {
  Param,
  Switch,
}

interface IProp {
  dpState: any;
}
interface State {
  tab: TabType;
}

interface ButtonData {
  label: string;
  value: string | boolean | number;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  style?: any;
}

class SettingPage extends PureComponent<IProp, State> {
  tabs: any[] = [
    { value: TabType.Param, label: Strings.getLang('settingParam') },
    { value: TabType.Switch, label: Strings.getLang('settingSwitch') },
  ];

  constructor(props: IProp) {
    super(props);

    this.state = { tab: TabType.Param };
  }

  getButtons() {
    const { dpState } = this.props;
    const result: ButtonData[][] = [];
    if (isSupportParam()) {
      // 参数设置
      result.push([
        {
          label: Strings.getLang('paramSetting'),
          value: Strings.getLang('settingLabel'),
          onPress: this.handleParams,
        },
      ]);
    }
    if (isSupportCountdown()) {
      const countdown = dpState[countdownLeftCode];
      let valueText: string = Strings.getLang('unSetting');
      if (countdown) {
        valueText = formatCoundown(countdown);
      }
      result.push([
        {
          label: Strings.getLang('countdown'),
          value: valueText,
          onPress: this.handleCountdown,
        },
      ]);
    }
    const hasExhaust = isSupportExhaust();
    const hasSupply = isSupportSupply();
    if (hasExhaust || hasSupply) {
      const data: { label: string; value: any; onPress: (...rest) => void }[] = [];
      if (hasExhaust) {
        data.push({
          label: Strings.getLang('exhaustLabel'),
          value: formatExhaust(
            dpState[exhaustFanSpeedCode],
            dpState[exhaustAirVolCode],
            dpState[exhaustTempCode]
          ),
          onPress: this.handleExhaust,
        });
      }
      if (hasSupply) {
        data.push({
          label: Strings.getLang('supplyLabel'),
          value: formatSupply(
            dpState[supplyFanSpeedCode],
            dpState[supplyAirVolCode],
            dpState[supplyTempCode]
          ),
          onPress: this.handleSupply,
        });
      }

      result.push(data);
    }
    // 净化模式
    if (isSupportDp(purifyModeCode)) {
      result.push([
        {
          label: Strings.getDpLang(purifyModeCode),
          value: Strings.getDpLang(purifyModeCode, dpState[purifyModeCode]),
          onPress: this.handleValueBySchema(purifyModeCode),
        },
      ]);
    }

    if (isSupportDp(backLightCode)) {
      result.push([
        {
          label: Strings.getDpLang(backLightCode),
          value: Strings.formatValue('percentValue', dpState[backLightCode]),
          onPress: this.handleValueBySchema(backLightCode, icons.bright),
        },
      ]);
    }

    if (
      isSupportDp(filterLifeCode) ||
      isSupportDp(primaryFilterLifeCode) ||
      isSupportDp(mediumFilterLifeCode) ||
      isSupportDp(highFilterLifeCode)
    ) {
      result.push([
        {
          label: Strings.getLang('filterInfo'),
          value: '',
          onPress: this.handleFilter,
        },
      ]);
    }
    if (isSupportDp(factoryResetCode)) {
      result.push([
        {
          label: Strings.getDpLang(factoryResetCode),
          value: '',
          onPress: this.handleFactoryReset,
        },
      ]);
    }

    // 自定义类型的dp
    const customData: ButtonData[][] = [];
    const customCodes = fetchCustomDps();
    customCodes.forEach((code: string) => {
      const schema = TYSdk.device.getDpSchema(code);
      switch (schema.type) {
        case 'value':
          customData.push([
            {
              label: Strings.getDpLang(code),
              value: `${dpState[code]}${schema.unit}`,
              onPress: this.handleValueBySchema(code),
            },
          ]);
          break;
        case 'enum':
          customData.push([
            {
              label: Strings.getDpLang(code),
              value: Strings.getDpLang(code, dpState[code]),
              onPress: this.handleValueBySchema(code),
            },
          ]);
          break;
        default:
      }
    });

    return [...result, ...customData];
  }

  getPowerButtons = () => {
    const codes: string[][] = [
      [airConditioningCode, anionCode],
      [childLockCode],
      [sterilizeCode, purificationCode],
      [HeatCode, defrostCode],
      [uvLightCode],
      [bypassFunctionCode],
    ];

    // 自定义类型的dp
    const cusCodes: string[][] = [];
    const customCodes = fetchCustomDps();
    customCodes.forEach((code: string) => {
      const schema = TYSdk.device.getDpSchema(code);
      if (schema.type === 'bool') {
        cusCodes.push([code]);
      }
    });

    return [...codes, ...cusCodes];
  };

  handleParams = () => {
    TYSdk.Navigator.push({
      id: 'params',
    });
  };

  handleCountdown = () => {
    Popup.custom(
      {
        content: <Countdown />,
        footer: <View />,
        title: <View />,
      },
      { mask: true }
    );
  };

  handleExhaust = () => {
    Popup.custom(
      {
        content: <ExhaustSetting />,
        footer: <View />,
        title: <View />,
      },
      { mask: true }
    );
  };

  handleSupply = () => {
    Popup.custom(
      {
        content: <SupplySetting />,
        footer: <View />,
        title: <View />,
      },
      { mask: true }
    );
  };

  handleValueBySchema = (code: string, icon?: string) => () => {
    Popup.custom(
      {
        content: <DpSetting code={code} icon={icon} />,
        footer: <View />,
        title: <View />,
      },
      { mask: true }
    );
  };

  handleFilter = () => {
    TYSdk.Navigator.push({
      id: 'filter',
      title: Strings.getLang('filterInfo'),
    });
  };

  handleFactoryReset = () => {
    Dialog.confirm({
      title: Strings.getLang('resetFactoryTitle'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      onConfirm: () => {
        Dialog.close();
        gateway.putDpData({ [factoryResetCode]: true }, { checkCurrent: false });
      },
    });
  };

  handlePower = (code: string) => (v: boolean) => {
    gateway.putDpData({ [code]: v });
  };

  handleTab = (tab: TabType) => () => {
    this.setState({ tab });
  };

  render() {
    const { dpState } = this.props;
    const power = dpState[powerCode];
    const { tab } = this.state;
    const buttons = this.getButtons();
    const powerButtons = this.getPowerButtons();
    return (
      <View style={styles.box}>
        <View style={styles.tabs}>
          {this.tabs.map(({ value, label }) => {
            return (
              <TouchableOpacity
                onPress={this.handleTab(value)}
                activeOpacity={0.5}
                style={styles.tab}
                key={value}
              >
                <TYText style={[styles.tabText, value === tab && styles.activeTab]}>{label}</TYText>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ flex: 1, marginTop: 24 }}>
          {tab === TabType.Param && (
            <ScrollView>
              {buttons.map((buttons, i) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <Group key={i} style={{ marginBottom: 12 }}>
                    {buttons.map((btn, index) => {
                      // eslint-disable-next-line react/no-array-index-key
                      return <RowButton key={index} disabled={!power} {...btn} />;
                    })}
                  </Group>
                );
              })}
            </ScrollView>
          )}
          {tab === TabType.Switch && (
            <ScrollView>
              {powerButtons.map((codes, i) => {
                const isSupport = codes.some((x: string) => isSupportDp(x));
                if (isSupport) {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Group key={i} style={{ marginBottom: 12 }}>
                      {codes.map(code => {
                        const has = isSupportDp(code);
                        if (has) {
                          return (
                            <RowButton
                              disabled={!power}
                              key={code}
                              label={Strings.getDpLang(code)}
                              value={dpState[code]}
                              type="switch"
                              onSwitchChange={this.handlePower(code)}
                            />
                          );
                        }
                        return null;
                      })}
                    </Group>
                  );
                }
                return null;
              })}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  dpState,
}))(SettingPage);

const styles = StyleSheet.create({
  box: { flex: 1, marginHorizontal: cx(24), marginTop: cx(24) },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    marginRight: cx(28),
  },
  tabText: {
    fontSize: 28,
    opacity: 0.5,
  },
  activeTab: {
    opacity: 0.9,
  },
});
