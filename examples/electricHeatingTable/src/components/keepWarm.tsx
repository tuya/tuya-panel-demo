import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { TYText, UnitText, Popup } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import styles from '../config/styles';
import { updateDp } from '../redux/modules/common';
import { DpState } from '../config/interface';
import { i18n, cx } from '../utils';
import imgs from '../res';
import { ReduxType } from '../redux/combine';
import { TYDevice } from '../api';

interface MainProps {
  keepWarm: string[];
  ifShowContent: boolean;
  dpState: DpState;
  devInfo: { [key: string]: any };
  updateDp: (obj: { [key: string]: any }) => void;
}

class KeepWarm extends PureComponent<MainProps> {
  timerHandle: number;
  state = {
    limitAction: false,
  };
  componentWillUnmount = () => {
    clearTimeout(this.timerHandle);
  };
  _setTemp = () => {
    const { dpState, devInfo } = this.props;
    const dataSource = devInfo.schema.heating.range.map((item: string) => {
      return {
        label: item !== 'closed' ? i18n(item) : i18n(item),
        value: item,
      };
    });
    Popup.picker({
      dataSource,
      title: i18n('gear'),
      cancelText: i18n('cancel'),
      confirmText: i18n('confirm'),
      value: dpState.heating,
      labelOffset: 30,
      footerWrapperStyle: { display: 'none' },
      onValueChange: (value: string) => {
        TYDevice.putDeviceData({ heating: value }).then((res: any) => {
          res.success && Popup.close();
        });
      },
    });
  };
  render() {
    const { dpState, ifShowContent, keepWarm, devInfo } = this.props;
    if (!ifShowContent) return null;
    const range = devInfo.schema.temp_set;
    const myopacity = !dpState.switch || dpState.child_lock ? 0.5 : 1;
    return (
      <View style={styles.flex1}>
        <View style={styles.boxTitle}>
          <TYText style={styles.titleText}>{i18n('keepWarm')}</TYText>
          {keepWarm.includes('temp_set') && (
            <TYText style={[styles.tipsText]}>{i18n('tempset')}</TYText>
          )}
        </View>
        {keepWarm.includes('heating') && (
          <View style={[styles.cookingBox, styles.flex1, { opacity: myopacity }]}>
            <TouchableOpacity
              style={styles.cookingGear}
              disabled={!dpState.switch || dpState.child_lock}
              onPress={() => {
                this._setTemp();
              }}
            >
              <TYText style={styles.gearText}>{i18n(dpState.heating)}</TYText>
            </TouchableOpacity>
          </View>
        )}
        {keepWarm.includes('temp_set') && (
          <View style={[styles.incline, styles.flex1, { opacity: myopacity }]}>
            <View style={styles.setTemp}>
              <TouchableOpacity
                style={styles.addTouch}
                disabled={
                  this.state.limitAction ||
                  dpState.temp_set === range.min ||
                  !dpState.switch ||
                  dpState.child_lock
                }
                onPress={() => {
                  if (dpState.temp_set > range.min) {
                    this.setState({ limitAction: true });
                    this.props.updateDp({ temp_set: dpState.temp_set - 1 });
                    this.timerHandle = setTimeout(() => {
                      this.setState({ limitAction: false });
                    }, 200);
                  }
                }}
              >
                <Image source={imgs.sub} resizeMode="stretch" />
              </TouchableOpacity>
              <UnitText
                value={`${dpState.temp_set}`}
                valueSize={cx(30)}
                unit="celsius"
                unitPaddingLeft={cx(3)}
                unitSize={cx(10)}
              />
              <TouchableOpacity
                disabled={
                  this.state.limitAction ||
                  dpState.temp_set === range.max ||
                  !dpState.switch ||
                  dpState.child_lock
                }
                style={styles.addTouch}
                onPress={() => {
                  if (dpState.temp_set < range.max) {
                    this.setState({ limitAction: true });
                    this.props.updateDp({ temp_set: dpState.temp_set + 1 });
                    this.timerHandle = setTimeout(() => {
                      this.setState({ limitAction: false });
                    }, 200);
                  }
                }}
              >
                <Image source={imgs.add} resizeMode="stretch" />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
)(KeepWarm);
