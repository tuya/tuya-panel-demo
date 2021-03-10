import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { filter as _filter, isEmpty as _isEmpty, parseInt as _parseInt } from 'lodash';
import { bindActionCreators } from 'redux';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYSdk, TYText, Popup, Dialog, TabBar } from 'tuya-panel-kit';
import { modeStateUpdate } from '../../models/modules/cloudState';
import DpCodes from '../../config/dpCodes';
import Strings from '../../i18n';
import { ACTIVEOPACITY, getCodes, getDataOptions } from '../../utils';
import CalibrateHeader from '../../components/calibrate/header';
import CalibrateResult from '../../components/calibrate/result';
import CalibrateFooter from '../../components/calibrate/footer';
import ListItem from './listItem';
import InputTexts from './textInput';

const { convertX: cx } = Utils.RatioUtils;
const { lightMode, switchBacklight } = DpCodes;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

interface SettingProps {
  themeColor: any;
  dpState: any;
  modeUpdate: any;
  names: any;
}
interface SettingState {
  tab: string;
}
class Setting extends PureComponent<SettingProps, SettingState> {
  constructor(props: SettingProps) {
    super(props);
    const schema = TYDevice.getDpSchema();
    this.switches = _filter(
      schema,
      d => /^control?/.test(d.code) && d.code !== 'control_back' && d.code !== 'control_back_2'
    );
    this.state = {
      tab: '0',
    };
    this.timer = null;
  }

  componentDidMount() {
    TYEvent.on('deviceDataChange', this._onDpDataChange);
  }

  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this._onDpDataChange);
  }

  getSwitch() {
    const { names } = this.props;
    return this.switches.map((item, index) => ({
      key: `${index}`,
      title: names[item.code] || Strings.getDpLang(item.code),
      style: { width: cx(180), height: cx(60) },
    }));
  }

  getList = (code: string) => {
    const { dpState } = this.props;
    const power = dpState[code];
    const useCodes = getCodes(code, lightMode, switchBacklight);
    const disable = power !== 'stop';
    return [
      {
        title: null,
        data: useCodes.map((d: string) => {
          const { isBool, val } = getDataOptions(d, dpState, code, disable);
          return {
            ...getDataOptions(d, dpState, code, disable),
            onPress: isBool
              ? (value: boolean) => this._handleToggle(d, value)
              : () => this._handleToGoList(d, val),
          };
        }),
      },
    ];
  };

  switches: any;

  timer: any;

  _onDpDataChange = (data: any) => {
    const { type, payload } = data;
    const { modeUpdate } = this.props;
    const arr = Object.keys(payload);
    if (
      (type === 'dpData' && arr.length < 3 && payload.cur_calibration) ||
      payload.cur_calibration_2 ||
      payload.tr_timecon ||
      payload.tr_timecon_2
    ) {
      clearTimeout(this.timer);
      modeUpdate('ok');
    }
  };

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

  _handleToGoList = (code: string, val: string | number | undefined) => {
    const { themeColor } = this.props;
    const isEle = code.slice(0, 19) === 'elec_machinery_mode';
    const isBack = code.slice(0, 12) === 'control_back';
    if (code === 'light_mode' || isEle || isBack) {
      Popup.close();
      const { range: rangeValue = [] } = TYDevice.getDpSchema(code);
      const dataSource = rangeValue.map((item: string) => ({
        key: item,
        title: Strings.getDpLang(code, item),
        value: item,
        styles: {
          title: {
            maxWidth: cx(290),
          },
        },
      }));
      Popup.list({
        dataSource,
        title: Strings.getDpLang(code),
        value: val,
        footerType: 'singleCancel',
        iconTintColor: themeColor,
        styles: {
          title: [{ color: '#333333', fontSize: cx(14), textAlign: 'left' }],
        },
        cancelText: Strings.getLang('cancelText'),
        wrapperStyle: styles.wrapperStyle,
        titleWrapperStyle: styles.titleWrapperStyle,
        footerWrapperStyle: styles.footerWrapperStyle,
        listWrapperStyle: styles.listWrapperStyle,
        titleTextStyle: styles.titleTextStyle,
        onSelect: (data: string) => {
          TYDevice.putDeviceData({
            [code]: data,
          });
          Popup.close();
        },
      });
    } else {
      const isCur = code.slice(0, 15) === 'cur_calibration';
      const accurate = true;
      if (isCur) {
        TYDevice.putDeviceData({
          [code]: 'start',
        });
        this._ready(code, accurate);
      } else {
        this._ready(code, !accurate);
      }
    }
  };

  _ready = (code: string, accurate: boolean) => {
    Dialog.confirm({
      headerStyle: styles.headerStyle,
      title: Strings.getLang('readyCalibrate'),
      subTitle: Strings.getLang('readyCalibrateTip'),
      confirmText: Strings.getLang('next'),
      cancelText: Strings.getLang('cancel'),
      subTitleStyle: styles.subTitleStyle,
      cancelTextStyle: styles.cancelTextStyle,
      confirmTextStyle: styles.confirmTextStyle,
      onConfirm: () => {
        Dialog.close();
        if (accurate) {
          this._caleting(code);
        } else {
          this._caleting2(code);
        }
      },
      onCancel: () => {
        Dialog.close();
        accurate && this._endTheAdjust(code);
      },
    });
  };

  _caleting = (code: string) => {
    const { modeUpdate } = this.props;
    Dialog.confirm({
      headerStyle: styles.headerStyle,
      title: Strings.getLang('calibrating'),
      subTitle: Strings.getLang('calibratingTip'),
      confirmText: Strings.getLang('next'),
      cancelText: Strings.getLang('cancel'),
      subTitleStyle: styles.subTitleStyle,
      cancelTextStyle: styles.cancelTextStyle,
      confirmTextStyle: styles.confirmTextStyle,
      onConfirm: () => {
        this._endTheAdjust(code);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          modeUpdate('over');
        }, 10000);
        this._showEnd();
      },
      onCancel: () => {
        this._endTheAdjust(code);
      },
    });
  };

  _caleting2 = (code: string) => {
    const { dpState, modeUpdate, themeColor } = this.props;
    Dialog.custom({
      title: Strings.getLang('readyCalibrate'),
      confirmText: Strings.getLang('next'),
      cancelText: Strings.getLang('cancel'),
      subTitleStyle: styles.subTitleStyle,
      cancelTextStyle: styles.cancelTextStyle,
      confirmTextStyle: styles.confirmTextStyle,
      headerStyle: styles.headerStyle,
      content: (
        <InputTexts
          text={dpState[code]}
          themeColor={themeColor}
          code={code}
          clear={() => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
              modeUpdate('over');
            }, 10000);
            this._showEnd();
          }}
        />
      ),
      // footerStyle: { height: 0 },
      footer: () => <View />,
    });
  };

  _showEnd = () => {
    const { modeUpdate } = this.props;
    Dialog.custom({
      cancelText: Strings.getLang('cancel'),
      subTitleStyle: styles.subTitleStyle,
      cancelTextStyle: styles.cancelTextStyle,
      confirmTextStyle: styles.confirmTextStyle,
      title: '',
      confirmText: '',
      header: () => <CalibrateHeader />,
      content: <CalibrateResult />,
      footer: () => (
        <CalibrateFooter
          cancelText={Strings.getLang('closed')}
          onCancel={() => {
            Dialog.close();
            clearTimeout(this.timer);
          }}
        />
      ),
    });
    modeUpdate('wait');
  };

  _endTheAdjust = (code: string) => {
    Dialog.close();
    TYDevice.putDeviceData({
      [code]: 'end',
    });
  };

  renderItem = (sections: any) => {
    return sections.map((item: any, index: number) => {
      const themeColor = '#1E9BC0';
      // eslint-disable-next-line react/no-array-index-key
      return <ListItem key={`${index}`} keyIndex={`${index}`} themeColor={themeColor} {...item} />;
    });
  };

  render() {
    const { tab } = this.state;
    const tabPaneArr = this.switches;
    const sections = this.getList(tabPaneArr[0].code);
    const HEIGHT = sections[0].data.length * 48;
    const datas = this.getList(tabPaneArr[tab].code)[0].data;
    const isSingle = this.switches.length === 1;
    return (
      <View style={[styles.root, { height: HEIGHT + cx(60) + 56 }]}>
        {isSingle ? (
          <View style={styles.title}>
            <TYText size={cx(16)}>{Strings.getLang('set')}</TYText>
          </View>
        ) : (
          <TabBar
            tabs={this.getSwitch()}
            style={{ borderBottomColor: 'rgba(0,0,0,.1)', borderBottomWidth: 1 }}
            activeKey={tab}
            onChange={value => this.setState({ tab: value })}
            underlineStyle={{ width: 20 }}
          />
        )}
        <View style={{ width: cx(360), height: HEIGHT, backgroundColor: '#FFFFFF' }}>
          {this.renderItem(datas)}
        </View>
        <TouchableOpacity
          activeOpacity={ACTIVEOPACITY}
          style={styles.footer}
          onPress={() => Popup.close()}
        >
          <TYText style={styles.close}>{Strings.getLang('close')}</TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    width: cx(360),
    borderRadius: cx(16),
    overflow: 'hidden',
  },
  title: {
    height: cx(60),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomColor: 'rgba(0,0,0,.1)',
    borderBottomWidth: 1,
  },
  footer: {
    width: cx(360),
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: cx(16),
    borderBottomRightRadius: cx(16),
    borderTopColor: 'rgba(0,0,0,.1)',
    borderTopWidth: 1,
  },
  close: {
    backgroundColor: 'transparent',
    color: 'rgba(52,54,60,.6)',
    fontSize: cx(15),
  },
  titleTextStyle: {
    width: cx(360),
    fontWeight: 'bold',
    color: '#34363C',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginHorizontal: cx(8),
  },
  titleWrapperStyle: {
    width: cx(360),
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperStyle: {
    width: cx(360),
    borderRadius: cx(16),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  footerWrapperStyle: {
    borderTopColor: 'rgba(0,0,0,.1)',
    borderTopWidth: 1,
    borderBottomLeftRadius: cx(16),
    borderBottomRightRadius: cx(16),
    backgroundColor: '#FFFFFF',
    marginTop: 0,
    marginBottom: 20,
  },
  listWrapperStyle: {
    width: cx(360),
    backgroundColor: '#FFFFFF',
  },
  headerStyle: {
    flexDirection: 'column',
    height: cx(82),
    borderBottomWidth: 0,
    borderColor: 'transparent',
  },
  subTitleStyle: {
    color: '#666666',
    fontSize: cx(12),
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  cancelTextStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(52,54,60,.6)',
    backgroundColor: 'transparent',
  },
  confirmTextStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    color: '#1E9BC0',
  },
});

export default connect(
  ({ dpState, socketState, modes }: any) => ({
    dpState,
    names: socketState.socketNames,
    modeState: modes.state,
  }),
  dispatch =>
    bindActionCreators(
      {
        modeUpdate: modeStateUpdate,
      },
      dispatch
    )
)(Setting);
