import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  DeviceEventEmitter,
  Platform,
  StatusBar,
} from 'react-native';
import _ from 'lodash';
import { TYSdk, Toast as ToastView, Utils, TopBar, Dialog } from 'tuya-panel-kit';
import Res from './res';
import { bytesToHex, renderText } from './utils';
import Strings from '../../i18n';
import { bindScene, removeBindData, getCouldBindData } from '../../api';

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

const { convertX: cx, convertY: cy, width } = Utils.RatioUtils;

interface SceneLayoutProps {
  navigator: any;
  queryData: any;
  btnId: number;
  code: string;
  devInfo: any;
  schema: any;
  dpValue: string;
}

interface SceneLayoutState {
  data: any;
  index: number;
  name: string;
  dpState: string;
  error: boolean;
  errorTips: string;
  currentSid: string;
  currentGid: string;
}

class SceneLayout extends Component<SceneLayoutProps, SceneLayoutState> {
  constructor(props: SceneLayoutProps) {
    super(props);
    this.state = {
      data: [],
      index: -1,
      name: '',
      dpState: 'none',
      error: false,
      errorTips: '',
      currentSid: '',
      currentGid: '',
    };
    this.timer = null;
    DeviceEventEmitter.addListener('createScene', state => {
      if (Platform.OS === 'android') {
        if (!state.creatScene) {
          this._showErrorDialog();
        } else {
          this.getData(true);
        }
      } else if (!state) {
        this._showErrorDialog();
      } else {
        this.getData(true);
      }
    });
    DeviceEventEmitter.addListener('refresh', (events: any) => {
      this.props.navigator.pop();
    });
  }

  componentDidMount() {
    this.getData(false);
    const { schema } = this.props;
    const sceneGroupCode = _.get(schema, 'scene_ID_group_ID', 'scene_id_group_id');
    TYEvent.on('dpDataChange', (data: any) => {
      if (data[sceneGroupCode] === '00' || data[sceneGroupCode] === 'AA==') {
        TYNative.hideLoading();
        this.clear();
        this.handlerState();
      }
    });
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('createScene');
    DeviceEventEmitter.removeListener('refresh');
    TYEvent.off('dpDataChange');
    this.clear();
  }

  onChange = () => {
    if (this.state.data.length > 0) {
      this.changeDp();
    }
  };

  onPress = () => {
    const { devInfo } = this.props;
    const src = `tuyaSmart://createScene_allDevices?devId=${devInfo.devId}`;
    TYNative.jumpTo(src);
  };

  getData = (changeIndex: boolean) => {
    const { queryData, btnId } = this.props;
    getCouldBindData()
      .then((data: any) => {
        this.setState({ data });
        if (data.length > 0) {
          if (changeIndex) {
            // 新增的场景
            const _index = data.length - 1;
            this.setState({
              index: _index,
            });
          } else {
            for (let d = 0; d < this.state.data.length; d++) {
              for (let j = 0; j < queryData.length; j++) {
                if (queryData[j].btnId === btnId) {
                  if (this.state.data[d].id === queryData[j].ruleId) {
                    const currentData = this.state.data[d];
                    const { gidIndex } = this.getSid(currentData);
                    const sidGidExist =
                      !!currentData.actions &&
                      _.get(currentData.actions[gidIndex], 'extraProperty.gid');
                    this.setState({
                      index: this.state.data.indexOf(currentData),
                      currentSid: sidGidExist ? currentData.actions[0].extraProperty.sid : '',
                      currentGid: sidGidExist ? currentData.actions[0].extraProperty.gid : '',
                    });
                  }
                }
              }
            }
          }
        }
      })
      .catch(e => {
        this.setState({
          data: [],
          error: true,
          errorTips: Strings.getLang('serverError'),
        });
      });
  };

  getSid = (data: any) => {
    const actionExist = !!data.actions;
    const { actions } = data;
    let isSid = '';
    let gidIndex = 0;
    if (!actionExist) return { isSid, gidIndex };
    for (let i = 0; i < actions.length; i++) {
      if (_.get(actions[i], 'extraProperty.sid')) {
        isSid = !!actions[i].extraProperty.sid;
        gidIndex = i;
        break;
      }
    }
    return { isSid, gidIndex };
  };
  timer: any;

  clear = () => {
    this.timer && clearTimeout(this.timer);
  };

  changeDp = () => {
    // 直接解绑
    if (this.state.index === -1) {
      this.unbind();
      return;
    }
    this.bind();
  };

  select = (index: number) => {
    if (this.state.index !== index) {
      this.setState({
        index,
      });
    } else if (this.state.index === -1) {
      this.setState({
        index,
      });
    } else {
      this.setState({
        index: -1,
      });
    }
  };

  query = () => {
    for (let j = 0; j < this.props.queryData.length; j++) {
      if (this.props.queryData[j].btnId === this.props.btnId) {
        return true;
      }
    }
    return false;
  };

  phonePress = () => {
    if (this.state.index == -1) {
      this.unbind();
      return;
    }
    this.bind();
  };

  handlerState = () => {
    const { dpState, data, index } = this.state;
    const { code, btnId, devInfo, dpValue } = this.props;
    if (dpState === 'unbinding') {
      if (!this.query()) {
        DeviceEventEmitter.emit('refresh', {});
        return;
      }
      removeBindData(btnId)
        .then(d => {
          DeviceEventEmitter.emit('refresh', {});
          this.nativeScrenRefresh();
        })
        .catch(e => {
          this.setState({ error: true, errorTips: Strings.getLang('serverError') });
        });
    } else if (dpState === 'binding') {
      const postData = {
        devId: devInfo.devId, // 设备id(场景面板设备)
        btnId, // 按钮id
        ruleId: data[index].id, // 场景规则ID
        dpId: +TYDevice.getDpIdByCode(code),
        dpValue,
      };
      bindScene(postData)
        .then((d: any) => {
          DeviceEventEmitter.emit('refresh', {});
          this.nativeScrenRefresh();
        })
        .catch((e: any) => {
          const err = typeof e === 'string' ? JSON.parse(e) : e;
          const error = err.message || err.errorMsg || err;
          this.setState({ error: true, errorTips: error });
        });
    }
    this.setState({
      dpState: 'none',
    });
  };

  nativeScrenRefresh = () => {
    if (Platform.OS === 'android') {
    } else {
      TYNative.jumpTo('tuyaSmart://sceneUiUpdate');
    }
  };

  // 语音包中文协议
  renderDefalutLable = () => {
    if (this.props.btnId === 0) return '回家';
    if (this.props.btnId === 1) return '会客';
    if (this.props.btnId === 2) return '晚餐';
    if (this.props.btnId === 3) return '影音';
    return '';
  };

  sendDp = (ssid: any, gid: any) => {
    let lable = this.state.name;
    const { currentGid } = this.state;
    const { schema } = this.props;
    if (ssid === 0) {
      lable = '待配';
    }
    const str = [
      parseInt(this.props.btnId, 10),
      parseInt(ssid === 0 ? currentGid : gid, 10),
      parseInt(ssid, 10),
      renderText(lable, 0),
      renderText(lable, 1),
    ];
    const bytes = bytesToHex(str);
    const sceneGroupCode = _.get(schema, 'dpSceneIDGroupID.code', 'scene_id_group_id');
    TYDevice.putDeviceData({
      [sceneGroupCode]: bytes,
    });
    this.clear();
    this.timer = setTimeout(() => {
      if (this.state.dpState !== 'none') {
        this.setState({
          error: true,
          errorTips: Strings.getLang('dperror'),
        });
        TYNative.hideLoading();
      }
    }, 7000);
    TYNative.showLoading();
  };

  bind() {
    const { currentSid } = this.state;
    const { schema, devInfo } = this.props;
    const isZigBeeDevice = _.get(schema, 'scene_ID_group_ID') || _.get(schema, 'scene_id_group_id');
    const { isSid, gidIndex } = this.getSid(this.state.data[this.state.index]);
    const needPush = isZigBeeDevice && isSid;
    if (needPush) {
      // zigbee 的虚拟设备直接绑定 真实设备下发dp 收到上报后绑定
      if (devInfo.devId.slice(0, 5) === 'vdevo') {
        this.setState(
          {
            dpState: 'binding',
          },
          () => {
            this.handlerState();
          }
        );
      } else {
        this.setState({
          dpState: 'binding',
        });
        this.sendDp(
          this.state.data[this.state.index].actions[gidIndex || 0].extraProperty.sid,
          this.state.data[this.state.index].actions[gidIndex || 0].extraProperty.gid
        );
      }
    } else {
      // zigbee 切 wifi 需要下发上一个zigbee的gid_sid
      TYNative.hideLoading();
      this.setState(
        {
          dpState: 'binding',
        },
        () => {
          if (isZigBeeDevice && currentSid !== '') {
            this.sendDp(0);
          } else {
            this.handlerState();
          }
        }
      );
    }
  }

  unbind = () => {
    const { currentSid } = this.state;
    const { schema, devInfo } = this.props;
    const isZigBeeDevice = _.get(schema, 'scene_ID_group_ID') || _.get(schema, 'scene_id_group_id');
    const needPush = isZigBeeDevice && currentSid !== '';
    if (needPush) {
      // zigbee 的虚拟设备直接解除绑定
      if (devInfo.devId.slice(0, 5) === 'vdevo') {
        this.setState(
          {
            dpState: 'unbinding',
          },
          () => {
            TYNative.hideLoading();
            this.handlerState();
          }
        );
      } else {
        this.setState({
          dpState: 'unbinding',
        });
        this.sendDp(0);
      }
    } else {
      this.setState(
        {
          dpState: 'unbinding',
        },
        () => {
          TYNative.hideLoading();
          this.handlerState();
        }
      );
    }
  };

  renderItem = (item: any, index: number) => {
    return (
      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            this.select(index);
          }}
        >
          <View style={[styles.image, { marginTop: cx(16) }]}>
            <Image style={styles.image} source={{ uri: item.background }} />
            <View style={[styles.mask]} />
            <Text style={styles.itemName}>{item.name}</Text>
            {this.state.index === index && <Image source={Res.selectIcon} style={styles.select} />}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  _showErrorDialog = () => {
    Dialog.confirm({
      title: Strings.getLang('add_fail'),
      subTitle: Strings.getLang('errordes'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('retry'),
      onConfirm: () => {
        Dialog.close();
        this.onPress();
      },
    });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
        <StatusBar barStyle="default" />
        <TopBar
          leftActions={[
            {
              name: 'backIos',
              color: '#333',
              onPress: () => this.props.navigator.pop(),
            },
          ]}
          title={this.props.devInfo.name}
          actions={[
            {
              source: Strings.getLang('complete'),
              color: '#333',
              onPress: () => this.onChange(),
            },
          ]}
        />
        <View style={{ flex: 1, marginTop: cy(17) }}>
          <TouchableWithoutFeedback onPress={() => this.onPress()}>
            <View style={styles.item}>
              <Text style={styles.lable}>{Strings.getLang('addScene')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={Res.go} style={styles.goIcon} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          <FlatList
            style={{ width, flex: 1 }}
            data={this.state.data}
            renderItem={({ item, index }) => this.renderItem(item, index)}
            numColumns={2}
            keyExtractor={(item, index) => index}
          />
          <ToastView
            text={this.state.errorTips}
            show={this.state.error}
            showPosition="top"
            onFinish={() => {
              this.setState({ error: false });
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    width,
    height: cy(56),
    flexDirection: 'row',
    paddingHorizontal: cx(16),
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lable: {
    color: '#22242C',
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  goIcon: {
    tintColor: '#C5CDD3',
  },
  image: {
    width: cx(163),
    height: cx(120),
    borderRadius: 5,
    marginHorizontal: cx(8),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: cx(163),
    height: cx(120),
    borderRadius: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  select: {
    position: 'absolute',
    right: 11,
    bottom: 9,
    backgroundColor: 'transparent',
  },
  itemName: {
    position: 'absolute',
    top: 32,
    left: 16,
    width: 119,
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 16,
    fontWeight: '600',
  },
});

const mapStateToProps = (state: any) => {
  return {
    schema: state.devInfo.schema,
    devInfo: state.devInfo,
  };
};

export default connect(mapStateToProps)(SceneLayout);
