/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable no-eval */
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import produce from 'immer';
import { connect } from 'react-redux';
import { Tab, TYText, TYSdk } from 'tuya-panel-kit';
import CameraManager from '../nativeComponents/cameraManager';
import DpConfigUtils from '../../utils/dpConfigUtils';
import PidOrderStore from '../../config/pidTabOrderData';
import { liveBottomTabMenuArr } from '../../config/panelTableFeatureInitData';
import { isExistTabConfig, closeGlobalLoading } from '../../config/click';
import { sortPanelConfigData } from '../../utils';
import Config from '../../config';
import Strings from '../../i18n';

const { cx, isIphoneX, winWidth } = Config;

const TYEvent = TYSdk.event;

class LiveControlConfig extends React.Component {
  static propTypes = {
    productId: PropTypes.string.isRequired,
    defaultTable: PropTypes.string,
    devInfo: PropTypes.object.isRequired,
    isShare: PropTypes.bool,
    baseHeight: PropTypes.number.isRequired,
    isSupportCloudStorage: PropTypes.bool.isRequired,
  };
  static defaultProps = {
    isShare: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      activeTab: isExistTabConfig(props.defaultTable, props.isShare),
      tabArr: [],
    };
    this.cancelLoading = null;
  }

  componentWillMount() {
    this.getPidPanelConfig();
  }
  componentWillUnmount() {
    TYEvent.off('getSupportStorage');
    clearTimeout(this.cancelLoading);
  }

  getPidPanelConfig = () => {
    const devicePid = this.props.productId;
    const pidPanelData = PidOrderStore.tabData;
    const { tabArr, needFilterDp, needFilterCloudConfig } = liveBottomTabMenuArr;
    let realPanelData = [];
    for (let i = 0; i < pidPanelData.length; i++) {
      if (pidPanelData[i].pid === devicePid) {
        realPanelData = pidPanelData[i].data;
        break;
      }
    }
    if (realPanelData.length === 0) {
      realPanelData = tabArr;
    }
    const newTabArr = DpConfigUtils.publicDelFilterMenuDp(
      realPanelData,
      needFilterDp,
      needFilterCloudConfig
    );
    // 此功能点配置是在有云存储的条件下, 展示功能菜单中的云存储还是tab菜单中的云存储,默认显示tab云存储, false表示显示Tab云存储
    const showCloudPanel = false;
    if (showCloudPanel) {
      _.remove(newTabArr, item => {
        return item.key === 'cloudStorage';
      });
    }
    TYEvent.on('getSupportStorage', data => {
      // 这里需要将原数据进行浅拷贝
      const { isSupportCloudStorage } = this.props;
      const filterCloudDataSource = Array.prototype.slice.call(newTabArr);
      if (!isSupportCloudStorage) {
        _.remove(filterCloudDataSource, item => {
          return item.key === data;
        });
      }
      const finalTabArrss = this.orderCustomTabByPanelConfig(filterCloudDataSource);
      this.setState({ tabArr: finalTabArrss });
      closeGlobalLoading();
    });
  };
  orderCustomTabByPanelConfig = newTabArr => {
    let tabArr = Array.prototype.slice.call(newTabArr);
    const needToAdjustOrder = [];
    const { devInfo } = this.props;
    // let tabOrder = "[{key: "ptzZoom", order: 3},{key: "notify", order: 5}]"; 可以自定义排序,也可通过在pid文件更改dp点顺序
    const tabOrder = _.get(devInfo, 'panelConfig.fun.tabOrder');
    if (typeof tabOrder !== 'undefined') {
      const tabOrderString = JSON.stringify(tabOrder);
      try {
        const tabOrderConfig = JSON.parse(tabOrderString);
        const arrayTab = eval(`(${tabOrderConfig})`);
        if (arrayTab instanceof Array) {
          for (let i = 0; i < arrayTab.length; i++) {
            const findIndex = _.findIndex(tabArr, o => {
              return o.key === arrayTab[i].key;
            });
            if (findIndex !== -1) {
              const addItemData = tabArr[findIndex];
              addItemData.order = arrayTab[i].order;
              tabArr = tabArr.filter(({ key }) => {
                return key !== arrayTab[i].key;
              });
              needToAdjustOrder.push(addItemData);
            }
          }
        } else {
          CameraManager.showTip(Strings.getLang('tab_order_config_format_err'));
        }
      } catch (e) {
        console.log(e, 'e');
        // 出错，用eval继续解析JSON字符串
        CameraManager.showTip(Strings.getLang('tab_order_config_format_err'));
      }
    }
    if (needToAdjustOrder.length !== 0) {
      const nextStateArr = produce(tabArr, draftState => {
        // 按照顺序从小到大进行排序
        const orderAdjustOrder = needToAdjustOrder.sort(sortPanelConfigData);
        orderAdjustOrder.forEach((item, index) => {
          draftState.splice(orderAdjustOrder[index].order - 1, 0, item);
        });
      });
      return nextStateArr;
    }

    return tabArr;
  };
  changetab = value => {
    // 由于Tab内部引用组件在外进行定义，这里使用分发事件，获取事件
    value === 'notify' && TYEvent.emit('reGetMsgList');
    value === 'cloudStorage' && TYEvent.emit('reGetCloudList');
    this.setState({
      activeTab: value,
    });
  };
  customTab = item => {
    const { activeTab } = this.state;
    return (
      <View style={styles.customTabBox}>
        <View style={{ height: cx(24), justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={item.imgSource}
            style={{
              width: cx(24),
              resizeMode: 'contain',
              tintColor: item.key === activeTab ? 'black' : '#959595',
            }}
          />
        </View>
        <TYText
          numberOfLines={1}
          style={{
            color: item.key === activeTab ? '#333' : '#959595',
            fontSize: 12,
          }}
        >
          {item.imgTitle}
        </TYText>
      </View>
    );
  };

  render() {
    const { activeTab, tabArr } = this.state;
    const { baseHeight } = this.props;
    const exceptTabContent = isIphoneX ? 92 + 80 : 72 + 80;
    const tabContentHeight = baseHeight - exceptTabContent;
    return (
      <View style={{ flex: 1 }}>
        {tabArr.length !== 0 ? (
          <Tab
            swipeable={true}
            activeKey={activeTab}
            onChange={this.changetab}
            style={styles.liveControlConfigPage}
            tabBarStyle={styles.tabBarStyle}
            tabBarPosition="bottom"
            tabBarUnderlineStyle={{ height: 0 }}
          >
            {tabArr.map(item => {
              return (
                <Tab.TabPane
                  key={item.key}
                  tab={this.customTab(item)}
                  style={styles.panelContent}
                  accessibilityLabel={item.test || ''}
                >
                  <item.component tabContentHeight={tabContentHeight} />
                </Tab.TabPane>
              );
            })}
          </Tab>
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  liveControlConfigPage: {
    width: winWidth,
    backgroundColor: '#f5f5f5',
  },
  tabBarStyle: {
    height: isIphoneX ? 80 : 60,
    paddingBottom: isIphoneX ? 20 : 0,
    backgroundColor: '#fff',
  },
  panelContent: {
    flex: 1,
    height: '100%',
  },
  customTabBox: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
const mapStateToProps = state => {
  const { isShare, productId } = state.devInfo;
  const { isSupportCloudStorage } = state.ipcCommonState;
  return {
    isShare,
    isSupportCloudStorage,
    productId,
    devInfo: state.devInfo,
  };
};

export default connect(mapStateToProps, null)(LiveControlConfig);
