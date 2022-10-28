/* eslint-disable @typescript-eslint/no-empty-function */
import React, { PureComponent } from 'react';
import _ from 'lodash';
import { View, StyleSheet, ScrollView, FlatList, Image, DeviceEventEmitter } from 'react-native';
import { TYSdk, Utils, TYText, Dialog } from 'tuya-panel-kit';
import { commonApi } from '@tuya/tuya-panel-api';
import Res from '../../res';
import DropDown from '../../components/dropDown';
import Tip from './tip';
import Strings from '../../i18n';
import Icon from '../../icons';
import RuleItem from './ruleItem';
import { getDeviceInfo, getIconList, getLength, RequireType } from '../../utils';

const {
  getLinkageDeviceList,
  getBindRuleList,
  bindRule,
  removeRule,
  triggerRule,
  enableRule,
  disableRule,
} = commonApi.linkageApi;
const { convertX: cx, convertY: cy } = Utils.RatioUtils;
interface RuleListProps {
  selectCode: string;
  themeColor: string;
  selectValue: string;
  onTriggle: () => void;
  isNewApp: boolean;
  isDefaultTheme: boolean;
}
interface RuleListState {
  data: any[];
  deviceData: RequireType[];
  scrollEnabled: boolean;
}

export default class RuleList extends PureComponent<RuleListProps, RuleListState> {
  constructor(props: RuleListProps) {
    super(props);
    this.state = {
      data: [],
      deviceData: [],
      scrollEnabled: true,
    };
  }

  async componentDidMount() {
    this.getDeviceLists();
    this.getData();
    TYSdk.event.on('NAVIGATOR_ON_WILL_FOCUS', this.getData);
  }

  componentWillUnmount() {
    this.removeLister();
    TYSdk.event.off('NAVIGATOR_ON_WILL_FOCUS', this.getData);
  }

  getDeviceLists = _.throttle(() => {
    const { themeColor, isNewApp } = this.props;
    const { homeId } = TYSdk.devInfo;
    this.removeLister();
    getLinkageDeviceList({ gid: homeId, sourceType: 'wirelessSwitch' })
      .then((d: RequireType[]) => {
        this.setState({
          deviceData: d,
        });
        if (isNewApp) {
          DeviceEventEmitter.addListener('ty_panel_scene_create', events => {
            const { result, sceneId } = events;
            if (result) {
              switch (events.sceneAction) {
                case 'add':
                  this.bind(sceneId);
                  break;
                default:
                  this.getData();
                  break;
              }
            }
          });
        } else {
          this.oldLister(d, themeColor);
        }
      })
      .catch(() => {
        this.setState({
          deviceData: [],
        });
      });
  }, 2000);

  getData = () => {
    getBindRuleList({
      bizDomain: 'wirelessSwitchBindScene',
      sourceEntityId: TYSdk.devInfo.devId,
      entityType: 2,
    })
      .then((d: RequireType[]) => {
        if (typeof d === undefined) {
          return;
        }
        let dt: RequireType[] = [];
        dt = d
          .map((res: any) => {
            const { associativeEntityId, sourceEntityId, associativeEntityValueList } = res;
            const valueArr = associativeEntityId.split('#');
            return {
              key: `${associativeEntityId}_key`,
              associativeEntityId,
              sourceEntityId,
              dpId: +valueArr[0],
              list: associativeEntityValueList.map((ls: RequireType) => {
                const {
                  triggerRuleEnable,
                  id,
                  actions = null,
                  name,
                  displayColor = '#00CC99',
                  background,
                  triggerRuleId
                } = ls;
                return {
                  triggerRuleEnable,
                  id,
                  actions,
                  name,
                  displayColor,
                  background,
                  needBackground: background !== '',
                  triggerRuleId
                };
              }),
            };
          })
          .filter((ditem: any) => ditem !== null);
        this.setState({
          data: dt,
        });
      })
      .catch(() => {
        this.setState({
          data: [],
        });
      });
  };

  goto = (d: RequireType[], themeColor: string) => {
    const { isDefaultTheme } = this.props;
    TYSdk.Navigator.push({
      id: 'sceneList',
      title: Strings.getLang('selectSmart'),
      deviceData: d,
      themeColor,
      isDefaultTheme,
    });
  };

  removeLister() {
    const { isNewApp } = this.props;
    DeviceEventEmitter.removeListener(isNewApp ? 'ty_panel_scene_create' : 'createScene', () => { });
    !isNewApp && DeviceEventEmitter.removeListener('editAuto', () => { });
  }

  oldLister(d: RequireType[], themeColor: string) {
    DeviceEventEmitter.addListener('createScene', () => {
      this.goto(d, themeColor);
    });
    DeviceEventEmitter.addListener('editAuto', () => {
      this.getData();
    });
  }

  bind = (ruleId: string) => {
    const { selectValue, selectCode, themeColor } = this.props;
    const id = TYSdk.device.getDpIdByCode(selectCode);
    bindRule({
      associativeEntityId: `${id}#${selectValue}`,
      ruleId,
      entitySubIds: id,
      expr: [[`$dp${id}`, '==', selectValue]],
      bizDomain: 'wirelessSwitchBindScene',
    })
      .then(() => {
        this.getData();
      })
      .catch(() => {
        Dialog.alert({
          title: Strings.getLang('bindError'),
          confirmText: Strings.getLang('confirm'),
          confirmTextStyle: { fontWeight: 'bold', color: themeColor },
          onConfirm: () => {
            Dialog.close();
            triggerRule({ ruleId: id });
          },
        });
      });
  };

  remove = (id: string, associativeEntityId: string) => {
    const { themeColor } = this.props;
    Dialog.confirm({
      headerStyle: { flexDirection: 'column', height: cx(82) },
      title: Strings.getLang('confirmDeleteTip'),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancels'),
      cancelTextStyle: { color: '#333' },
      confirmTextStyle: { fontWeight: 'bold', color: themeColor },
      onConfirm: () => {
        Dialog.close();
        removeRule({
          bizDomain: 'wirelessSwitchBindScene',
          sourceEntityId: TYSdk.devInfo.devId,
          associativeEntityId,
          associativeEntityValue: id,
        })
          .then(() => {
            this.getData();
          })
          .catch(() => {
            TYSdk.mobile.simpleTipDialog(Strings.getLang('removeError'), () => { });
          });
      },
    });
  };

  editRule = (id: string) => {
    const src = `tuyaSmart://editScene?sceneId=${id}`;
    TYSdk.native.jumpTo(src);
  };

  _handleToToggle = (enabled: boolean, id: string) => {
    const { themeColor } = this.props;
    const fun = enabled ? enableRule : disableRule;
    fun({ ruleId: id })
      .then(() => {
        this.getData();
      })
      .catch(() => {
        Dialog.alert({
          title: Strings.getLang(enabled ? 'enableError' : 'disableError'),
          confirmText: Strings.getLang('confirm'),
          confirmTextStyle: { fontWeight: 'bold', color: themeColor },
          onConfirm: () => {
            Dialog.close();
            triggerRule({ ruleId: id });
          },
        });
      });
  };

  _handleToTriggle = (id: string, ls: any) => {
    const { deviceData } = this.state;
    const { themeColor, onTriggle } = this.props;
    const deviceIcons = getIconList(ls, deviceData);
    if (deviceIcons.length <= 0) {
      Dialog.alert({
        title: Strings.getLang('smartAction'),
        subTitle: Strings.getLang('noUse'),
        confirmText: Strings.getLang('confirm'),
        confirmTextStyle: { fontWeight: 'bold', color: themeColor },
        onConfirm: () => {
          Dialog.close();
          onTriggle();
          triggerRule({ ruleId: id });
        },
      });
      return;
    }
    Dialog.custom({
      title: Strings.getLang('smartAction'),
      content: (
        <View style={styles.content}>
          <FlatList
            data={deviceIcons}
            keyExtractor={(_item: RequireType, index: number) => `${index}`}
            renderItem={this._renderDeviceItem}
          />
        </View>
      ),
      cancelText: Strings.getLang('cancels'),
      confirmText: Strings.getLang('confirm'),
      confirmTextStyle: { fontWeight: 'bold', color: themeColor },
      onConfirm: () => {
        Dialog.close();
        onTriggle();
        triggerRule({ ruleId: id });
      },
      style: { backgroundColor: '#FFFFFF', borderRadius: 8 },
      headerStyle: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      },
      footerWrapperStyle: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      },
    });
  };

  _renderDeviceItem = ({ item }: any) => {
    const { themeColor } = this.props;
    return <Tip themeColor={themeColor} {...item} />;
  };

  renderItem = ({ item }: any) => {
    const { associativeEntityId } = item;
    const valueArr = associativeEntityId.split('#');
    const { selectCode, isDefaultTheme } = this.props;
    const { deviceData } = this.state;
    const dpValue = valueArr[1];
    const leg = getLength(item.list, deviceData);
    return (
      <View style={styles.itemContent}>
        <DropDown
          title={Strings.getDpLang(selectCode, dpValue)}
          maxHeight={leg}
          content={() => this.renderItems(item)}
          isDefaultTheme={isDefaultTheme}
          topStyle={styles.topStyle}
          iconPath={Icon.arrow}
          themeColor="rgba(0,0,0,.2)"
          titleStyle={styles.titleStyle}
          size={14}
        />
      </View>
    );
  };

  renderItems = (item: any) => {
    const { isDefaultTheme, themeColor, isNewApp } = this.props;
    const { deviceData } = this.state;
    const { list, associativeEntityId } = item;
    return list.map((ls: any, index: number) => {
      const { triggerRuleEnable, id, name, displayColor, needBackground, background,triggerRuleId } = ls;
      const { icon, devLength } = getDeviceInfo(deviceData, ls);
      return (
        <RuleItem
          key={`${id}_ruleKey`}
          themeColor={displayColor === '' ? themeColor : `#${displayColor}`}
          devLength={devLength}
          showIcon={icon}
          name={name}
          isDefaultTheme={isDefaultTheme}
          enabled={triggerRuleEnable}
          needBackground={needBackground}
          background={background}
          changeEnabled={() => this._handleToToggle(!triggerRuleEnable, triggerRuleId)}
          onPress={() => this._handleToTriggle(id, ls)}
          needEnable={true}
          index={index}
          scrollEnabledChange={(data: any) => this.setState(data)}
          removeRule={() => this.remove(id, associativeEntityId)}
          editRule={() => this.editRule(id)}
          isNewApp={isNewApp}
        />
      );
    });
  };

  render() {
    const { data, scrollEnabled } = this.state;
    const { selectCode, isDefaultTheme } = this.props;
    const id = TYSdk.device.getDpIdByCode(selectCode);
    const currentData = _.filter(data, d => +d.dpId === +id);
    return (
      <View style={styles.root}>
        {currentData.length > 0 ? (
          <ScrollView
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: cx(130),
            }}
          >
            <FlatList
              data={currentData}
              scrollEnabled={false}
              keyExtractor={(item: any) => item.key}
              showsVerticalScrollIndicator={false}
              renderItem={this.renderItem}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyContent}>
            <Image
              source={Res.empty}
              style={[styles.empty, { tintColor: isDefaultTheme ? '#848484' : '#d9d9d9' }]}
            />
            <TYText style={[styles.addTip, isDefaultTheme && { color: 'rgba(255,255,255,.3)' }]}>
              {Strings.getLang('addTip')}
            </TYText>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: cy(20),
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: cx(87),
  },
  itemContent: {
    minHeight: cx(30),
    width: cx(343),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 18,
  },
  titleStyle: {
    color: 'rgba(0,0,0,.9)',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  empty: {
    width: cx(164),
    height: cx(110),
  },
  addTip: {
    backgroundColor: 'transparent',
    color: 'rgba(0,0,0,.3)',
    fontSize: 12,
    lineHeight: 17,
  },
  topStyle: {
    width: cx(339),
    height: cx(30),
    paddingHorizontal: cx(0),
  },
  content: {
    width: '100%',
    maxHeight: cx(216),
  },
});
