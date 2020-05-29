import React, { PureComponent } from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { TYText, UnitText, Popup, TYSdk } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import _ from 'lodash';
import { updateDp } from '../redux/modules/common';
import { DpState, FunctionList } from '../config/interface';
import styles from '../config/styles';
import imgs from '../res';
import { ReduxType } from '../redux/combine';
import { CountDownAnimated, TimeAnimated } from './index';
import { i18n, cx, toFixedData, goToDpAlarm } from '../utils';
import { images, dpCodes, dpActiveColor, dpInActiveColor } from '../config/boxConfig';
import Strings from '../i18n';
import { TYDevice } from '../api';

interface MainProps {
  moreFunction: string[];
  dpState: DpState;
  ifShowContent: boolean;
  devInfo: { [key: string]: any };
  navigator: { push: (obj: { [key: string]: any }) => void; };
  updateDp: (obj: { [key: string]: any }) => void;
}
class MoreFunction extends PureComponent<MainProps, any> {
  constructor(props: MainProps) {
    super(props);
    this.state = {
      countDownShow: props.dpState.countdown_left !== 0,
      showTimeAnimated: new Date(),
    };
  }

  componentWillReceiveProps = (nextProps: MainProps) => {
    const ifHavecountdownLeft = this.props.moreFunction.includes('countdown_left');
    if (
      nextProps.dpState.countdown_left !== this.props.dpState.countdown_left &&
      this.props.dpState.countdown_left === 0 &&
      ifHavecountdownLeft &&
      (nextProps.dpState.countdown_set !== 'cancel' ||
        this.props.dpState.countdown_set !== 'cancel')
    ) {
      this.setState({ countDownShow: true });
    }
    if (
      nextProps.dpState.countdown_left !== this.props.dpState.countdown_left &&
      nextProps.dpState.countdown_left === 0 &&
      ifHavecountdownLeft
    ) {
      this.setState({ countDownShow: false });
    }
  };
  _renderCountDown = () => {
    const { countdown_set, countdown_left } = this.props.dpState;
    const ifHavecountdownSet = this.props.moreFunction.includes('countdown_set');
    const ifHavecountdownLeft = this.props.moreFunction.includes('countdown_left');
    if (ifHavecountdownSet && ifHavecountdownLeft && countdown_left !== 0) {
      TYDevice.putDeviceData({ countdown_set: 'cancel' });
    } else {
      const dataSource = this.props.devInfo.schema.countdown_set.range.map((item: string) => ({
        label: item,
        value: item,
      }));
      Popup.picker({
        dataSource,
        title: i18n('countdownSet'),
        cancelText: i18n('cancel'),
        confirmText: i18n('confirm'),
        value: countdown_set,
        label: null,
        onConfirm: (value: string) => {
          TYDevice.putDeviceData({ countdown_set: value });
          Popup.close();
        },
      });
    }
  };

  _choosefunction = (id: string | any) => {
    const ifUsePowerStatistics =
      _.get(this.props.devInfo, 'panelConfig.fun.ifUsePowerStatistics') !== undefined
        ? _.get(this.props.devInfo, 'panelConfig.fun.ifUsePowerStatistics')
        : true;
    if (typeof id === 'string') {
      const functionList: FunctionList = {
        countdown: () => {
          this._renderCountDown();
        },
        childLock: () => {
          this._setProps(id);
        },
        quiet: () => {
          this._setProps(id);
        },
        time: () => {
          this._setTime();
        },
        power: () => {
          ifUsePowerStatistics && this.props.navigator.push({ id: 'power' });
        },
        timing: () => {
          goToDpAlarm('switch');
        },
      };
      functionList[id]();
    } else if (Object.keys(id).includes('url')) {
      TYSdk.mobile.jumpTo(id.url);
    } else {
      if (id.type === 'value') {
        Popup.numberSelector({
          title: id.code,
          cancelText: i18n('cancel'),
          confirmText: i18n('confirm'),
          value: +this.props.dpState[id.code],
          min: this.props.devInfo.schema[id.code].min,
          max: this.props.devInfo.schema[id.code].max,
          onConfirm: (value: number) => {
            this.props.updateDp({ [id.code]: value });
            Popup.close();
          },
        });
      } else if (id.type === 'bool') {
        this.props.updateDp({ [id.code]: !this.props.dpState[id.code] });
      } else if (id.type === 'enum') {
        const dataSource = this.props.devInfo.schema[id.code].range.map((item: string) => ({
          label: `${item}`,
          value: item,
        }));
        Popup.picker({
          dataSource,
          title: id.code,
          cancelText: i18n('cancel'),
          confirmText: i18n('confirm'),
          value: this.props.dpState[id.code],
          onConfirm: (value: string) => {
            this.props.updateDp({ [id.code]: value });
            Popup.close();
          },
        });
      }
    }
  };
  _setProps = (id: string) => {
    TYDevice.putDeviceData({
      [dpCodes[id]]: !this.props.dpState[dpCodes[id]],
    });
  };
  _setTime = () => {
    TYDevice.putDeviceData({ time_calibration: true }).then((res: { success: boolean }) => {
      res.success && this.setState({ showTimeAnimated: new Date() });
    });
  };
  _renderContent = (id: string | object) => {
    const { dpState } = this.props;
    if (id === 'countdown') {
      const { countdown_left, countdown_set } = dpState;
      const { countDownShow } = this.state;
      const ifHavecountdownLeft = this.props.moreFunction.includes('countdown_left');
      return (
        <CountDownAnimated
          ifHavecountdownLeft={ifHavecountdownLeft}
          countDownShow={countDownShow}
          countdownLeft={countdown_left}
          countdownSet={countdown_set}
        />
      );
    } else if (['childLock', 'quiet'].includes(id as string)) {
      const idState = dpState[dpCodes[id as string]];
      return (
        <View
          style={[
            styles.contentBox,
            { backgroundColor: idState ? dpActiveColor : dpInActiveColor },
          ]}
        >
          <Image
            source={imgs[`${id}`][+idState]}
            style={{ tintColor: '#fff' }}
            resizeMode="stretch"
          />
          <TYText style={styles.whiteText}>{i18n(id as string)}</TYText>
        </View>
      );
    } else if (id === 'time') {
      const { showTimeAnimated } = this.state;
      return <TimeAnimated showTimeAnimated={showTimeAnimated} />;
    } else if (id === 'power') {
      const ifUsePowerStatistics =
        _.get(this.props.devInfo, 'panelConfig.fun.ifUsePowerStatistics') !== undefined
          ? _.get(this.props.devInfo, 'panelConfig.fun.ifUsePowerStatistics')
          : true;
      if (!ifUsePowerStatistics) {
        const value =
          0 ||
          toFixedData(
            dpState.power_consumption /
              Math.pow(10, _.get(this.props.devInfo, 'schema.power_consumption.scale')),
            1
          );
        const valueSize = cx(Math.min(parseInt(`${90 / `${value}`.length}`, 10), 33));
        const heightSize = cx(
          Math.min(parseInt(`${(90 / Math.min(`${value}`.length, 2), 10)}`, 33))
        );
        return (
          <View style={styles.powerContentBox}>
            <View style={[styles.powerContentText, { height: cx(heightSize) }]}>
              <UnitText value={`${value}`} valueSize={valueSize} />
              <TYText style={styles.powerUnit}>
                {_.get(this.props.devInfo, 'schema.power_consumption.unit')}
              </TYText>
            </View>
            <TYText style={styles.whiteText}>{i18n('dayElecUse')}</TYText>
          </View>
        );
      }
      return (
        <View style={[styles.contentBox, { backgroundColor: dpInActiveColor }]}>
          <Image
            source={imgs[`${id}`]}
            style={[styles.powerImg, { tintColor: '#fff' }]}
            resizeMode="stretch"
          />
          <TYText style={styles.whiteText}>{i18n(id)}</TYText>
        </View>
      );
    } else if (id === 'timing') {
      return (
        <View style={[styles.contentBox, { backgroundColor: dpInActiveColor }]}>
          <Image
            source={imgs[`${id}`]}
            style={[styles.timeImg, { tintColor: '#fff' }]}
            resizeMode="stretch"
          />
          <TYText style={styles.whiteText}>{i18n(id)}</TYText>
        </View>
      );
    }
    return this._renderCustomDp(id as { name: string; code: string });
  };
  _renderCustomDp = (idObj: { name: string; code: string }) => {
    if (typeof idObj !== 'object') return;
    if (Object.keys(idObj).includes('url')) {
      return (
        <View style={[styles.otherDpBox, { backgroundColor: dpInActiveColor }]}>
          <TYText style={styles.whiteText}>{Strings.getDpLang(idObj.name)}</TYText>
        </View>
      );
    }
    if (Object.keys(idObj).includes('type')) {
      const idState = this.props.dpState[idObj.code];
      const isBool = this.props.devInfo.schema[idObj.code].type !== 'bool';
      return (
        <View
          style={[
            styles.otherDpBox,
            {
              backgroundColor: isBool || !idState ? dpInActiveColor : dpActiveColor,
            },
          ]}
        >
          <TYText style={styles.whiteText}>{Strings.getDpLang(idObj.code)}</TYText>
        </View>
      );
    }
  };
  render() {
    const { moreFunction, ifShowContent, dpState } = this.props;
    const ifUsePowerStatistics =
      _.get(this.props.devInfo, 'panelConfig.fun.ifUsePowerStatistics') !== undefined
        ? _.get(this.props.devInfo, 'panelConfig.fun.ifUsePowerStatistics')
        : true;
    if (!ifShowContent) return null;
    return (
      <View>
        <View style={styles.boxTitle}>
          <TYText style={styles.titleText}>{i18n('moreFunction')}</TYText>
        </View>
        <ScrollView>
          <View style={styles.functionContent}>
            {moreFunction.map((item: string | object, index: number) => {
              const itemRealName = typeof item === 'string' ? images[item] : item;
              return (
                <TouchableOpacity
                  key={`${item}${index}`}
                  disabled={
                    (!dpState.switch && item !== 'power_consumption') ||
                    (item === 'power_consumption' && !ifUsePowerStatistics) ||
                    (dpState.child_lock && item !== 'child_lock')
                  }
                  onPress={() => {
                    this._choosefunction(itemRealName);
                  }}
                >
                  {item !== 'countdown_left' && (
                    <View
                      style={{
                        opacity:
                          (!dpState.switch && item !== 'power_consumption') ||
                          (dpState.child_lock && item !== 'child_lock')
                            ? 0.5
                            : 1,
                      }}
                    >
                      {this._renderContent(itemRealName)}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
}
export default connect(
  ({ dpState, devInfo }: ReduxType) => ({
    dpState,
    devInfo,
  }),
  {
    updateDp,
  }
)(MoreFunction);
