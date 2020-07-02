import React from 'react';
import { connect } from 'react-redux';
import gateway from 'gateway';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { Utils, TYText, IconFont, Popup } from 'tuya-panel-kit';
import Strings from 'i18n';
import resource from 'res';
import RangSlider from 'components/RangSlider';
import {
  getDpCodesByType,
  isSupportFun,
  getLightTypes,
  isCapability,
  formatPercent,
  getLedTypeIcon,
} from 'utils';
import { updateCloud } from 'redux/actions/cloud';
import icons from 'icons';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProps {
  controllType: number;
  ledType: string;
  minBright: number;
  maxBright: number;
  isSupportLedType: boolean;
  isSupportMax: boolean;
  isSupportMin: boolean;
  cloudData: any;
  navigator: any;
  theme: any;
  devInfo: any;
}
interface IState {
  scrollEnabled: boolean;
  locked: boolean;
  ledType: string;
  minBright: number;
  maxBright: number;
}

class Setting extends React.Component<IProps, IState> {
  private percentRef: React.ReactNode;
  private contentHeight: number = 0;
  private viewHeight: number = 0;
  constructor(props: IProps) {
    super(props);
    const { cloudData = {}, ledType, minBright, maxBright } = this.props;
    this.state = {
      scrollEnabled: true,
      locked: cloudData.locked || false,
      ledType,
      minBright,
      maxBright,
    };
  }
  componentWillReceiveProps(nextProps: IProps) {
    const { ledType, minBright, maxBright } = nextProps;
    this.setState({
      ledType,
      minBright,
      maxBright,
    });
  }
  getLedTypes() {
    const ledTypes = getLightTypes(this.props.controllType, this.props.devInfo.schema);
    return ledTypes.map(({ key, value }) => ({
      title: Strings.getLang(`led_type_${key}`),
      value,
    }));
  }
  sendDpData(ledType: string, [min, max]: number[], isSync: boolean = false) {
    const { minBright, maxBright } = this.state;
    const { controllType, isSupportLedType, isSupportMin, isSupportMax, devInfo } = this.props;
    const { brightCode, minBrightCode, maxBrightCode, ledTypeCode } = getDpCodesByType(
      controllType,
      devInfo.schema
    );
    const data: any = {};
    if (minBright === min) {
      data[brightCode] = max;
    } else {
      data[brightCode] = min;
    }
    if (isSupportMin) {
      data[minBrightCode] = min;
    }
    if (isSupportMax) {
      data[maxBrightCode] = max;
    }
    if (isSupportLedType) {
      data[ledTypeCode] = ledType;
    }
    gateway.putDpData(data, {
      useThrottle: !isSync,
      clearThrottle: isSync,
      updateValidTime: isSync ? 'syncs' : 'reply',
    });
  }

  handleShowSelectLedType = () => {
    Popup.list({
      title: Strings.getLang('select_led_type_title'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      type: 'radio',
      value: this.state.ledType,
      dataSource: this.getLedTypes(),
      onConfirm: (value: string) => {
        this.handleChangeLedType(value);
        Popup.close();
      },
    });
  };
  handleChangeLedType = (v: string) => {
    const { cloudData } = this.props;
    if (cloudData[v]) {
      const { min = 10, max = 1000 } = cloudData[v];
      this.sendDpData(v, [min, max]);
      this.setState({ ledType: v, minBright: min, maxBright: max });
    } else {
      const { minBright, maxBright } = this.state;
      this.sendDpData(v, [minBright, maxBright]);
      this.setState({ ledType: v });
    }
  };
  handleBrightRangeChange = ([min, max]: number[]) => {
    // @ts-ignore
    this.percentRef.setText(this.formatePercent([min, max]));
    if (!isCapability(15)) {
      this.sendDpData(this.state.ledType, [min, max]);
    }
  };
  handleBrightRangeComplete = ([min, max]: number[]) => {
    // @ts-ignore
    this.percentRef.setText(this.formatePercent([min, max]));
    this.sendDpData(this.state.ledType, [min, max], true);
    this.setState({ minBright: min, maxBright: max });
    this.revertScrollEnabled();
  };
  handleSave = () => {
    const { controllType, cloudData, navigator } = this.props;
    const { ledType, minBright, maxBright } = this.state;
    // this.sendDpData(minBright, maxBright);
    updateCloud(`ledTypeData${controllType}`, {
      ...cloudData,
      locked: true,
      [ledType]: {
        min: minBright,
        max: maxBright,
      },
    });
    this.setState({ locked: true });

    navigator.pop();
  };
  countPercent(value: number) {
    // @ts-ignore
    return formatPercent(value, {});
  }
  formatePercent([min, max]: number[]) {
    return `${this.countPercent(min)}%-${this.countPercent(max)}%`;
  }
  handleChangeLock = () => {
    const { controllType, cloudData } = this.props;
    const { locked, ledType, minBright, maxBright } = this.state;

    if (locked) {
      this.setState({ locked: false });
    } else {
      // this.sendDpData(minBright, maxBright);
      updateCloud(`ledTypeData${controllType}`, {
        ...cloudData,
        locked: true,
        [ledType]: {
          min: minBright,
          max: maxBright,
        },
      });
      this.setState({ locked: true });
    }
  };
  handleScrollEnabled() {
    if (this.contentHeight && this.viewHeight) {
      this.setState({ scrollEnabled: this.viewHeight < this.contentHeight });
    }
  }
  _scrollLayout = (e: LayoutChangeEvent) => {
    const {
      layout: { height },
    } = e.nativeEvent;
    this.viewHeight = height;
    this.handleScrollEnabled();
  };
  _contentSize = (width: number, height: number) => {
    this.contentHeight = height;
    this.handleScrollEnabled();
  };
  stopScrollEnabled = () => {
    this.setState({ scrollEnabled: false });
  };
  revertScrollEnabled = () => {
    if (this.contentHeight && this.viewHeight) {
      this.setState({ scrollEnabled: this.viewHeight < this.contentHeight });
    } else {
      this.setState({ scrollEnabled: true });
    }
  };
  render() {
    const { isSupportLedType, isSupportMin, isSupportMax, theme } = this.props;
    const { ledType, locked, minBright, maxBright } = this.state;
    const { fontColor, themeColor, boxActiveBgColor, subFontColor } = theme.standard;
    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <ScrollView
            style={{ width: '100%' }}
            onLayout={this._scrollLayout}
            onContentSizeChange={this._contentSize}
            scrollEnabled={this.state.scrollEnabled}
          >
            {isSupportLedType && (
              <TouchableOpacity disabled={locked} onPress={this.handleShowSelectLedType}>
                <View style={[styles.ledType, { backgroundColor: boxActiveBgColor }]}>
                  <View style={styles.typeBox}>
                    <Image source={getLedTypeIcon(ledType, true)} style={styles.icon} />
                    <TYText style={[styles.typeLabel, { color: fontColor }]}>
                      {Strings.getLang(`led_type_${ledType}`.toLowerCase())}
                    </TYText>
                  </View>
                  <View style={styles.typeRight}>
                    <TYText style={[styles.typeTip, { color: subFontColor }]}>
                      {Strings.getLang('led_type_tip')}
                    </TYText>
                    <IconFont d={icons.arrow} size={18} color={subFontColor} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {(isSupportMin || isSupportMax) && (
              <View>
                <TYText style={[styles.brightLabel, { color: themeColor }]}>
                  {Strings.getLang('bright_range_label')}
                </TYText>
                <TYText style={[styles.brightDesc, { color: subFontColor }]}>
                  {Strings.getLang('bright_range_desc')}
                </TYText>
                <TYText
                  ref={ref => (this.percentRef = ref)}
                  style={[styles.percent, { color: themeColor }]}
                >
                  {this.formatePercent([minBright, maxBright])}
                </TYText>
                <RangSlider
                  value={[minBright, maxBright]}
                  needFormatValue={false}
                  min={10}
                  max={1000}
                  minValueRange={isSupportMin && isSupportMax ? [10, 500] : [10, 1000]}
                  maxValueRange={isSupportMin && isSupportMax ? [550, 1000] : [10, 1000]}
                  disabled={locked}
                  editMinEnbled={isSupportMin}
                  editMaxEnbled={isSupportMax}
                  ActiveTrackColor={themeColor}
                  width={cx(324)}
                  height={cx(32)}
                  onGrant={this.stopScrollEnabled}
                  onEnd={this.handleBrightRangeComplete}
                  onChange={this.handleBrightRangeChange}
                />
              </View>
            )}
            <TouchableOpacity
              style={styles.saveBtn}
              disabled={locked}
              activeOpacity={0.8}
              onPress={this.handleSave}
            >
              <View
                style={[
                  styles.saveBtnContent,
                  { backgroundColor: themeColor, opacity: locked ? 0.2 : 1 },
                ]}
              >
                <TYText style={styles.saveBtnText}>{Strings.getLang('btn_save')}</TYText>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity activeOpacity={0.8} onPress={this.handleChangeLock}>
            <View style={styles.lockBox}>
              <View style={[styles.lock, { backgroundColor: boxActiveBgColor }]}>
                <Image source={locked ? resource.lock : resource.unlock} style={styles.lock} />
              </View>
              <TYText style={[styles.lockTip, { color: fontColor }]}>
                {Strings.getLang(locked ? 'lock_tip' : 'unlock_tip')}
              </TYText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default connect(({ dpState, cloudState, devInfo }: any, { controllType }: any) => {
  const { minBrightCode, maxBrightCode, ledTypeCode } = getDpCodesByType(
    controllType,
    devInfo.schema
  );
  const isSupportLedType = isSupportFun(ledTypeCode);
  return {
    controllType,
    devInfo,
    minBright: dpState[minBrightCode] || 10,
    maxBright: dpState[maxBrightCode] || 1000,
    ledType: dpState[ledTypeCode],
    isSupportLedType,
    isSupportMax: isSupportFun(maxBrightCode),
    isSupportMin: isSupportFun(minBrightCode),
    cloudData: cloudState[`ledTypeData${controllType}`] || {},
  };
})(withTheme(Setting));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: cx(24),
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledType: {
    borderRadius: cx(12),
    paddingHorizontal: cx(24),
    paddingVertical: cx(28),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: cx(32),
    height: cx(32),
    marginRight: cx(9),
  },
  typeLabel: {
    fontSize: 17,
  },
  typeTip: {
    fontSize: 12,
    marginRight: cx(12),
  },
  typeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  brightLabel: {
    marginTop: cx(48),
    lineHeight: 32,
    fontSize: 24,
  },
  brightDesc: {
    fontSize: 14,
    marginTop: cx(8),
    lineHeight: 20,
  },
  percent: {
    fontSize: 32,
    marginTop: cx(16),
    lineHeight: 48,
  },
  saveBtn: {
    marginTop: cx(40),
  },
  saveBtnContent: {
    height: cx(52),
    borderRadius: cx(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 18,
    color: '#fff',
  },
  lockBox: {
    width: cx(48),
  },
  lock: {
    width: cx(48),
    height: cx(48),
    borderRadius: cx(24),
  },
  lockTip: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: cx(8),
  },
  bottom: {
    height: cx(96),
  },
});
