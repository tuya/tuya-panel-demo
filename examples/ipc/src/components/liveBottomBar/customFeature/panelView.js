/* eslint-disable no-eval */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import produce from 'immer';
import { TYText, TYSdk } from 'tuya-panel-kit';
import CameraManager from '../../nativeComponents/cameraManager';
import DpConfigUtils from '../../../utils/dpConfigUtils';
import PidOrderStore from '../../../config/pidFeatureOrderData';
import { moreFeatureMenu } from '../../../config/panelMoreFeatureInitData';
import Config from '../../../config';
import PanelClick from '../../../config/panelClick';
import { sortPanelConfigData } from '../../../utils';
import { store } from '../../../main';
import { getPanelOpacity, getPanelTintColor } from '../../../utils/panelStatus';
import { isRecordingNow, isMicTalking, closeGlobalLoading } from '../../../config/click';
import Res from '../../../res';
import Strings from '../../../i18n';

const { cx, smallScreen, middlleScreen, is7Plus } = Config;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

class PanelView extends React.Component {
  static propTypes = {
    productId: PropTypes.string.isRequired,
    devInfo: PropTypes.object.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
    isAndriodFullScreenNavMode: PropTypes.bool.isRequired,
    isSupportCloudStorage: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      menuArr: [],
      hoverMenu: 'none',
    };
  }
  componentDidMount() {
    this.getPidPanelConfig();
    TYEvent.on('deviceDataChange', data => {
      const changedp = data.payload;
      if (changedp.basic_nightvision !== undefined) {
        const oldMenuArr = this.state.menuArr;
        const nightVisionModeIndex = _.findIndex(oldMenuArr, item => {
          return item.key === 'basic_nightvision';
        });
        if (changedp.basic_nightvision === '0') {
          oldMenuArr[nightVisionModeIndex].imgSource = Res.customFeature.dpNightVisionAuto;
        } else {
          oldMenuArr[nightVisionModeIndex].imgSource = Res.customFeature.dpNightVision;
        }
        this.setState({
          menuArr: oldMenuArr,
        });
      }
    });
  }
  componentWillReceiveProps() {
    getPanelOpacity();
    getPanelTintColor();
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange');
    TYEvent.off('getSupportStorage');
  }
  getPidPanelConfig = () => {
    const { productId: devicePid } = this.props;
    const pidPanelData = PidOrderStore.featureData;
    const { allMenu, needFilterDp, needFilterCloudConfig } = moreFeatureMenu;
    let realPanelData = [];
    for (let i = 0; i < pidPanelData.length; i++) {
      if (pidPanelData[i].pid === devicePid) {
        realPanelData = pidPanelData[i].data;
        break;
      }
    }
    if (realPanelData.length === 0) {
      realPanelData = allMenu;
    }
    // eslint-disable-next-line max-len
    const newmenuArr = DpConfigUtils.publicDelFilterMenuDp(
      realPanelData,
      needFilterDp,
      needFilterCloudConfig
    );
    const nightVisionModeIndex = _.findIndex(newmenuArr, item => {
      return item.key === 'basic_nightvision';
    });
    // 夜视模式为auto时替换图片 枚举值为0
    if (nightVisionModeIndex !== -1) {
      const nightVisionState = this.props.basic_nightvision;
      if (nightVisionState === '0') {
        newmenuArr[nightVisionModeIndex].imgSource = Res.customFeature.dpNightVisionAuto;
      }
    }

    // 默认不显示panel云存储,若需显示,将showCloudPanel变为true,或通过外部条件进行配置取值，进行变值
    const showCloudPanel = false;
    if (!showCloudPanel) {
      _.remove(newmenuArr, item => {
        return item.key === 'cloudStorage';
      });
    }

    TYEvent.on('getSupportStorage', data => {
      // 这里需要将原数据进行浅拷贝
      const filterCloudDataSource = Array.prototype.slice.call(newmenuArr);
      const { isSupportCloudStorage } = this.props;
      if (!isSupportCloudStorage) {
        _.remove(filterCloudDataSource, item => {
          return item.key === data;
        });
      }
      const finalMenuArrs = this.orderCustomIconByPanelConfig(filterCloudDataSource);
      this.setState({ menuArr: finalMenuArrs });
      closeGlobalLoading();
    });
  };

  orderCustomIconByPanelConfig = newIconArr => {
    let iconArr = Array.prototype.slice.call(newIconArr);
    const needToAdjustOrder = [];
    // let iconOrder = "[{key: "sd_status", order: 5},{key: "generalAlbum", order: 2}]"; 可以自定义排序,也可通过在pid文件更改dp点顺序
    const { devInfo } = this.props;
    const iconOrder = _.get(devInfo, 'panelConfig.fun.iconOrder');
    if (typeof iconOrder !== 'undefined') {
      const iconOrderString = JSON.stringify(iconOrder);
      try {
        const iconOrderConfig = JSON.parse(iconOrderString);
        const arrayIcon = eval(`(${iconOrderConfig})`);
        if (arrayIcon instanceof Array) {
          for (let i = 0; i < arrayIcon.length; i++) {
            const findIndex = _.findIndex(iconArr, o => {
              return o.key === arrayIcon[i].key;
            });
            if (findIndex !== -1) {
              const addItemData = iconArr[findIndex];
              addItemData.order = arrayIcon[i].order;
              iconArr = iconArr.filter(({ key }) => {
                return key !== arrayIcon[i].key;
              });
              needToAdjustOrder.push(addItemData);
            }
          }
        } else {
          CameraManager.showTip(Strings.getLang('icon_order_config_format_err'));
        }
      } catch (e) {
        console.log(e, 'e');
        // 出错，用eval继续解析JSON字符串
        CameraManager.showTip(Strings.getLang('icon_order_config_format_err'));
      }
    }

    if (needToAdjustOrder.length !== 0) {
      const nextStateArr = produce(iconArr, draftState => {
        // 按照顺序从小到大进行排序
        const orderAdjustOrder = needToAdjustOrder.sort(sortPanelConfigData);
        orderAdjustOrder.forEach((item, index) => {
          draftState.splice(orderAdjustOrder[index].order - 1, 0, item);
        });
      });
      return nextStateArr;
    }
    return iconArr;
  };
  panelFeature = (key, type) => {
    const { dpState } = store.getState();
    if (type === 'basic') {
      switch (key) {
        case 'multiScreen':
          PanelClick.enterMultiScreen();
          break;
        case 'generalAlbum':
          PanelClick.enterGeneralAlbum();
          break;
        case 'sd_status':
          PanelClick.enterPlayback();
          break;
        case 'cloudStorage':
          PanelClick.enterCloudStorage();
          break;
        default:
          return false;
      }
    } else if (type === 'switch') {
      const sendValue = !dpState[key];
      if (key === 'basic_private') {
        if (isRecordingNow() || isMicTalking()) {
          return false;
        }
      }
      TYDevice.putDeviceData({
        [key]: sendValue,
      });
    } else if (type === 'switchDialog') {
      const currentDpValue = dpState[key];
      PanelClick.savePopDataToRedux(key, currentDpValue);
    } else if (type === 'customDialog') {
      PanelClick.saveCustomDialogDataToRedux(key);
    } else if (type === 'switchPage') {
      switch (key) {
        // 巡航
        case 'cruise_status':
          PanelClick.enterCruisePage();
          break;
        default:
          return false;
      }
    }
  };
  pressInPanel = key => {
    this.setState({
      hoverMenu: key,
    });
  };
  pressOutPanel = () => {
    this.setState({
      hoverMenu: 'none',
    });
  };
  render() {
    const { menuArr, hoverMenu } = this.state;
    const { isAndriodFullScreenNavMode, panelItemActiveColor } = this.props;
    let panelPadding = isAndriodFullScreenNavMode ? 28 : 10;
    if (smallScreen) {
      panelPadding = 4;
    } else if (middlleScreen) {
      if (is7Plus) {
        panelPadding = 24;
      } else {
        panelPadding = 10;
      }
    }
    return (
      <ScrollView
        contentContainerStyle={styles.panelViewPage}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        {menuArr.map(item => (
          <TouchableWithoutFeedback
            key={item.key}
            onPress={_.throttle(() => this.panelFeature(item.key, item.type), 500)}
            onPressIn={() => this.pressInPanel(item.key)}
            onPressOut={this.pressOutPanel}
            disabled={!getPanelOpacity(item.key)}
          >
            <View
              style={[
                styles.itemBox,
                {
                  paddingVertical: panelPadding,
                  backgroundColor: hoverMenu === item.key ? '#e5e5e5' : 'transparent',
                  opacity: getPanelOpacity(item.key) ? 1 : 0.2,
                },
              ]}
            >
              <Image
                source={item.imgSource}
                style={[
                  styles.panelImg,
                  {
                    tintColor: getPanelTintColor(item.key, item.type)
                      ? panelItemActiveColor
                      : undefined,
                  },
                ]}
              />
              <View style={styles.panelTextBox}>
                <TYText style={styles.panelText}>{item.imgTitle}</TYText>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  panelViewPage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemBox: {
    width: '25%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  panelImg: {
    width: cx(40),
    resizeMode: 'contain',
  },
  panelTextBox: {
    marginTop: cx(4),
    width: cx(60),
  },
  panelText: {
    fontSize: cx(12),
    textAlign: 'center',
  },
});

const mapStateToProps = state => {
  const { dpState, devInfo } = state;
  const {
    showVideoLoad,
    showPopCommon,
    isAndriodFullScreenNavMode,
    panelItemActiveColor,
    isSupportCloudStorage,
  } = state.ipcCommonState;
  const { productId } = devInfo;
  return {
    devInfo,
    showVideoLoad,
    showPopCommon,
    dpState,
    productId,
    isAndriodFullScreenNavMode,
    panelItemActiveColor,
    isSupportCloudStorage,
    basic_nightvision: dpState.basic_nightvision,
  };
};
export default connect(mapStateToProps, null)(PanelView);
