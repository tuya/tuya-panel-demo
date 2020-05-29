import React, { PureComponent } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TYText, Popup } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from '../config/styles';
import { updateDp } from '../redux/modules/common';
import { DpState } from '../config/interface';
import { defaultThemeColor } from '../config/boxConfig';
import { i18n } from '../utils';
import { ReduxType } from '../redux/combine';
import { TYDevice } from '../api';

interface MainProps {
  cooking: string[];
  ifShowContent: boolean;
  dpState: DpState;
  devInfo: { [key: string]: any };
  updateDp: (obj: { [key: string]: any }) => void;
}
class Cooking extends PureComponent<MainProps> {
  _setCookingLevel = () => {
    const { dpState } = this.props;
    const dataSource = _.get(this.props.devInfo, 'schema.cook_mode.range')
      .map((item: string) => {
        if (item !== 'closed') {
          return { label: i18n(item), value: item };
        }
      })
      .filter((item: any) => !item !== true);
    Popup.picker({
      dataSource,
      title: i18n('gear'),
      cancelText: i18n('cancel'),
      confirmText: i18n('confirm'),
      value: dpState.cook_mode,
      onConfirm: (value: string) => {
        TYDevice.putDeviceData({ cook_mode: value }).then((res: any) => {
          res.success && Popup.close();
        });
      },
    });
  };
  render() {
    const { dpState, ifShowContent, cooking, devInfo } = this.props;
    if (!ifShowContent) return null;
    return (
      <View style={styles.flex1}>
        <View style={styles.boxTitle}>
          <TYText style={styles.titleText}>{i18n('cooking')}</TYText>
          {cooking.includes('stove_temp') && (
            <TYText style={[styles.tipsText, { color: '#FFF400' }]}>
              {i18n('discTemp')} |{' '}
              {0 || dpState.stove_temp / Math.pow(10, devInfo.schema.capacity_current.scale)}
              {devInfo.schema.stove_temp.unit}
            </TYText>
          )}
        </View>
        {cooking.includes('cook_mode') && (
          <View
            style={[
              styles.cookingBox,
              styles.flex1,
              {
                opacity: dpState.switch_cooking && dpState.switch && !dpState.child_lock ? 1 : 0.5,
              },
            ]}
          >
            <TouchableOpacity
              disabled={!dpState.switch_cooking || !dpState.switch || dpState.child_lock}
              style={styles.cookingGear}
              onPress={() => {
                this._setCookingLevel();
              }}
            >
              <TYText style={styles.gearText}>{i18n(dpState.cook_mode)}</TYText>
            </TouchableOpacity>
          </View>
        )}
        {cooking.includes('switch_cooking') && (
          <View
            style={[
              styles.incline,
              styles.flex1,
              {
                opacity: dpState.switch_cooking && dpState.switch && !dpState.child_lock ? 1 : 0.3,
              },
            ]}
          >
            <TouchableOpacity
              disabled={!dpState.switch_cooking || !dpState.switch || dpState.child_lock}
              style={styles.cookingButton}
              onPress={() => {
                dpState.switch_cooking && this.props.updateDp({ switch_cooking: false });
              }}
            >
              <TYText style={[styles.cookingText, { color: defaultThemeColor }]}>
                {i18n('closeCooking')}
              </TYText>
            </TouchableOpacity>
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
)(Cooking);
