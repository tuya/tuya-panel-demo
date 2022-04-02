/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/sort-comp */
/* eslint-disable import/no-unresolved */
import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, GlobalToast, Popup, TYText, Dialog, TYSdk } from 'tuya-panel-kit';
import { SingleTimePicker } from '@tuya/tuya-panel-lamp-sdk';
import DpCodes from '@config/dpCodes';
import { parseJSON, formatColorText, rawToBase64 } from '@utils';
import CustomTopBar from '@components/CustomTopBar';
import Api from '@api';
import Icons from '@res/iconfont';
import SettingRow from '@components/SettingRow';
import _ from 'lodash';
import Strings from '@i18n';
import { ColourFormatter } from '@tuya/tuya-panel-lamp-sdk/lib/formatter';
import { WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import rgbSceneFormater from '@config/dragons/rgbSceneFormater';
import _scenes from '@config/default/scenes';
import { CloudTimerProps, IColour, RgbSceneValue } from '@types';
import { handleExecuteCycleValue, weeksIsAllTheSameNumber } from './utils';

const {
  RatioUtils: { convertX: cx },
} = Utils;
const { withTheme } = Utils.ThemeUtils;
const { powerCode, workModeCode, rgbSceneCode, colourCode } = DpCodes;
const CloudTimerCategory = 'category_timer';
const colourFormater = new ColourFormatter();

interface CloudTimerState {
  carouselIndex: number;
  hour: number;
  minute: number;
  weeks: number[];
  dpPowerValue: boolean;
  workMode: string;
  hue: number;
  saturation: number;
  value: number;
  rgbSceneValue: RgbSceneValue;
  executeCycleValue: number;
}

class CloudTimer extends PureComponent<CloudTimerProps, CloudTimerState> {
  constructor(props: CloudTimerProps) {
    super(props);
    const { route } = props;
    const {
      params: {
        index,
        isAdd,
        hour,
        minute,
        weeks,
        dpPowerValue,
        workMode,
        hue,
        saturation,
        value,
        rgbSceneValue,
      },
    } = route;
    const _weeks = isAdd ? [0, 0, 0, 0, 0, 0, 0] : weeks;

    const currHour = new Date().getHours();
    const currMinute = new Date().getMinutes();
    let stateObj: any = {
      hour: currHour,
      minute: currMinute,
      // weeks: [0, 0, 0, 0, 0, 0, 0, 0],
      dpPowerValue: false,
      workMode: WORK_MODE.COLOUR,
      hue: 0,
      saturation: 1000,
      value: 1000,
      rgbSceneValue: _scenes[1][0].value,
      executeCycleValue: this.initExecuteCycleValue(),
      weeks: _weeks,
    };
    if (!isAdd) {
      stateObj = {
        ...stateObj,
        hour,
        minute,
        weeks,
        dpPowerValue,
        workMode,
        hue,
        saturation,
        value,
        rgbSceneValue,
      };
    }
    this.state = stateObj;
  }

  handleBack = () => {
    const { navigation } = this.props;
    const { route } = this.props;
    const {
      params: { onBack },
    } = route;
    onBack();
    navigation.pop();
  };

  handleSave = async () => {
    const { navigation } = this.props;
    const { route } = this.props;
    const {
      params: { isAdd, onBack, onSave, id },
    } = route;
    const { dpPowerValue, hour, minute, weeks, workMode, hue, saturation, value, rgbSceneValue } =
      this.state;
    const weeksArr = [...weeks];
    const loopStr = weeksArr.join('');

    const powerDpId = TYSdk.device.getDpIdByCode(powerCode);
    const colourDpId = TYSdk.device.getDpIdByCode(colourCode);
    const rgbSceneDpId = TYSdk.device.getDpIdByCode(rgbSceneCode);
    const workModeDpId = TYSdk.device.getDpIdByCode(workModeCode);

    const dps: any = {};
    dps[powerDpId] = dpPowerValue;
    if (dpPowerValue) {
      dps[workModeDpId] = workMode;
      if (workMode === WORK_MODE.COLOUR) {
        dps[colourDpId] = colourFormater.format({ hue, saturation, value });
      } else if (workMode === WORK_MODE.SCENE) {
        dps[rgbSceneDpId] = rawToBase64(rgbSceneFormater.format(rgbSceneValue));
      }
    }

    const params = {
      category: CloudTimerCategory,
      loops: loopStr,
      instruct: [
        {
          dps,
          time: `${hour}:${minute}`,
        },
      ],
      aliasName: '',
      isAppPush: false,
      options: {
        checkConflict: 1,
      },
    };
    const error = (response: any) => {
      const err = parseJSON(response);
      GlobalToast.show({
        text: err.message || err.errorMsg,
        d: Icons.error,
        onFinish: GlobalToast.hide,
      });
    };
    const success = (response?: any, updateAll?: boolean) => {
      GlobalToast.show({
        text: Strings.getLang(isAdd ? 'cloud_timer_add_success' : 'cloud_timer_update_success'),
        onFinish: GlobalToast.hide,
      });
      onSave();
    };
    if (isAdd) {
      try {
        const res = await Api.addTimer({ ...params } as any);
        success(res);
      } catch (err) {
        error(err);
      }
    } else {
      try {
        let res: any = {};
        res = await Api.updateTimer({ groupId: id, ...params } as any);
        success('', false);
      } catch (err) {
        error(err);
      }
    }
    navigation.pop();
  };

  handleDelete = () => {
    const { route, navigation } = this.props;
    const {
      params: { id, onSave },
    } = route;

    Dialog.confirm({
      title: Strings.getLang('timer_delete_tip'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      confirmTextStyle: { color: '#DA3737' },
      onConfirm: async (data, { close }) => {
        close();
        try {
          await Api.removeTimer(id, CloudTimerCategory);
          GlobalToast.show({
            text: Strings.getLang('cloud_timer_delete_success'),
            onFinish: GlobalToast.hide,
          });
        } catch (error) {
          const err = parseJSON(error);
          GlobalToast.show({
            text: err.message || err.errorMsg,
            d: Icons.error,
            onFinish: GlobalToast.hide,
          });
        }
        onSave();
        navigation.pop();
      },
    });
  };

  handleTimeChange = (hour: number, minute: number) => {
    this.setState({ hour, minute });
  };

  handleChangeWeeks = (weeks: number[]) => {
    if (_.isEqual([1, 1, 1, 1, 1, 1, 1], weeks)) {
      this.setState({
        executeCycleValue: 1,
      });
    }
    this.setState({ weeks });
  };

  handleChangeColor = (hsv: IColour) => {
    const { hue, saturation, value } = hsv;
    this.setState({ hue, saturation, value });
  };

  handleChangeRgbScene = (value: RgbSceneValue) => {
    this.setState({ rgbSceneValue: value });
  };

  handleChangeLampSwitch = () => {
    const { navigation, theme } = this.props;
    const {
      global: { isDefaultTheme },
    } = theme;
    const { hue, saturation, value, workMode, dpPowerValue, rgbSceneValue } = this.state;
    let popupValue = 0;
    if (dpPowerValue) {
      if (workMode === WORK_MODE.COLOUR) {
        popupValue = 1;
      } else if (workMode === WORK_MODE.SCENE) {
        popupValue = 2;
      }
    }
    Popup.list({
      type: 'radio',
      dataSource: [0, 1, 2].map(i => ({
        key: `${i}`,
        title: Strings.getLang(`timer_action_value_${i}` as any),
        value: i,
      })),
      title: Strings.getLang('timer_action_popup_title'),
      styles: {
        content: {
          backgroundColor: isDefaultTheme ? '#1A1A1A' : '#fff',
        },
      },
      titleWrapperStyle: {
        borderBottomColor: isDefaultTheme ? 'rgba(255,255,255, 0.15)' : 'rgba(0, 0, 0, .05)',
      },
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      value: popupValue,
      footerType: 'singleCancel',
      onMaskPress: ({ close }) => close(),
      onSelect: v => {
        switch (v) {
          case 0:
            this.setState({ dpPowerValue: false });
            break;
          case 1:
            this.setState({ dpPowerValue: true, workMode: WORK_MODE.COLOUR }, () => {
              const routeParams = {
                hue,
                saturation,
                value,
                onSave: this.handleChangeColor,
              };
              navigation.navigate('cloudTimerDimmer', routeParams);
            });
            break;
          case 2:
            this.setState({ dpPowerValue: true, workMode: WORK_MODE.SCENE }, () => {
              const routeParams = {
                onSave: this.handleChangeRgbScene,
                rgbSceneValue,
              };
              navigation.navigate('cloudTimerScene', routeParams);
            });
            break;
          default:
            break;
        }
        Popup.close();
      },
    });
  };

  renderActionText = () => {
    const { dpPowerValue, workMode, hue, rgbSceneValue } = this.state;
    let text = Strings.getLang('timer_action_value_0');
    if (dpPowerValue) {
      if (workMode === WORK_MODE.COLOUR) {
        text = `${Strings.getLang('timer_action_dimmer')}: ${formatColorText(hue)}`;
      } else if (workMode === WORK_MODE.SCENE) {
        const { id } = rgbSceneValue;
        let data: any = {};
        const sceneArr = [..._scenes[1], ..._scenes[2], ..._scenes[3], ..._scenes[4]];
        sceneArr.forEach(sceneItem => {
          if (sceneItem.sceneId === id) {
            data = sceneItem;
          }
        });

        text = !data
          ? `${Strings.getLang('timer_action_scene')}: ${Strings.getLang('scene_undefinded')}`
          : `${Strings.getLang('timer_action_scene')}: ${Strings.getLang(data?.name)}`;
      }
    }
    return text;
  };

  initExecuteCycleValue = () => {
    // 新增默认为once
    const {
      route: {
        params: { isAdd, weeks },
      },
    } = this.props;
    if (isAdd) {
      return 0;
    }
    if (weeksIsAllTheSameNumber(weeks, 0)) {
      return 0;
    }
    if (weeksIsAllTheSameNumber(weeks, 1)) {
      return 1;
    }
    return 2;
  };

  handleChangeCycle = () => {
    const { executeCycleValue, weeks } = this.state;
    const { theme, navigation } = this.props;
    Popup.list({
      type: 'radio',
      dataSource: [0, 1, 2].map(i => ({
        key: `${i}`,
        title: Strings.getLang(`cloud_timer_cycle_${i}` as any),
        value: i,
      })),
      title: Strings.getLang('execute_cycle_popup_title'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      value: executeCycleValue,
      footerType: 'singleCancel',
      iconTintColor: theme.global.brand,
      onMaskPress: ({ close }) => close(),
      onSelect: v => {
        this.setState({ executeCycleValue: Number(v) });
        switch (v) {
          case 0:
            this.setState({ weeks: [0, 0, 0, 0, 0, 0, 0] });
            break;
          case 1:
            this.setState({ weeks: [1, 1, 1, 1, 1, 1, 1] });
            break;
          case 2:
            navigation.push('executeCycle', { weeks, onChange: this.handleChangeWeeks });
            break;
          default:
            break;
        }
        Popup.close();
      },
    });
  };

  render() {
    const { theme, route } = this.props;
    const { hour, minute, weeks, dpPowerValue, executeCycleValue } = this.state;
    const {
      global: { background, fontColor, isDefaultTheme },
    } = theme;
    const {
      params: { id, title, is24Hour, isAdd },
    } = route;

    const settingRowStyle = [
      styles.setting,
      {
        backgroundColor: isDefaultTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      },
    ];
    const arrowIconColor = isDefaultTheme ? '#fff' : '#333';
    return (
      <View style={styles.flex1}>
        <CustomTopBar
          title={title}
          backText={Strings.getLang('cancel')}
          onBack={this.handleBack}
          onSave={this.handleSave}
        />
        <View style={styles.flex1}>
          <View style={styles.timerContainer}>
            <SingleTimePicker
              containerStyle={{ backgroundColor: background }}
              is24Hour={is24Hour}
              hour={hour}
              minute={minute}
              loop={true}
              visibleItemCount={7}
              itemStyle={{ fontSize: 30 }}
              amText={Strings.getLang('schedule_am')}
              pmText={Strings.getLang('schedule_pm')}
              // @ts-ignore
              prefixPosition={Strings.language === 'zh' ? 'left' : 'right'}
              itemTextColor={theme.type === 'dark' ? 'rgba(255,255,255,0.9)' : '#000'}
              selectedItemTextColor={theme.type === 'dark' ? '#FFFFFF' : '#000'}
              dividerColor={
                theme.type === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }
              pickerStyle={{ backgroundColor: 'transparent' }}
              hourPickerStyle={{}}
              minutePickerStyle={{}}
              amPmPickerStyle={{}}
              textSize={30}
              onChange={this.handleTimeChange}
            />
          </View>

          <View
            style={[
              settingRowStyle,
              isDefaultTheme ? {} : { backgroundColor: '#fff', borderRadius: cx(16) },
            ]}
          >
            <SettingRow
              style={[styles.row]}
              contentStyle={{
                borderBottomWidth: 0,
              }}
              arrowIconColor={arrowIconColor}
              rightType="arrow"
              title={Strings.getLang('timer_action_label')}
              valueTextStyle={[
                {
                  color: isDefaultTheme ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)',
                  fontSize: 12,
                },
                dpPowerValue && { color: fontColor },
              ]}
              valueText={this.renderActionText()}
              onPress={this.handleChangeLampSwitch}
            />
          </View>
          <View
            style={[
              settingRowStyle,
              isDefaultTheme ? {} : { backgroundColor: '#fff', borderRadius: cx(16) },
            ]}
          >
            <SettingRow
              style={[styles.row]}
              contentStyle={{
                borderBottomWidth: 0,
              }}
              arrowIconColor={arrowIconColor}
              rightType="arrow"
              title={Strings.getLang('execution_cycle')}
              valueTextStyle={[
                {
                  color: isDefaultTheme ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)',
                  fontSize: 12,
                },
                dpPowerValue && { color: fontColor },
              ]}
              valueText={handleExecuteCycleValue(executeCycleValue, weeks)}
              onPress={this.handleChangeCycle}
            />
          </View>
          {!isAdd && (
            <View
              style={[
                settingRowStyle,
                isDefaultTheme ? {} : { backgroundColor: '#fff', borderRadius: cx(16) },
              ]}
            >
              <TouchableOpacity activeOpacity={0.7} onPress={this.handleDelete} style={styles.btn}>
                <TYText style={styles.btnText}>{Strings.getLang('timer_delete')}</TYText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },

  timerContainer: {
    height: cx(200),
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: cx(32),
    marginBottom: cx(24),
  },
  setting: {
    marginHorizontal: cx(24),
    borderRadius: 16,
    marginBottom: cx(12),
    flexDirection: 'row',
    alignItems: 'center',
    height: cx(70),
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: cx(14),
    color: '#FF453A',
    marginLeft: cx(8),
  },
  row: {
    paddingHorizontal: cx(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default withTheme(CloudTimer);
