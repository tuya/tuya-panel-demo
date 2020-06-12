/* eslint-disable no-loop-func */
/* eslint-disable no-undef */
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import CameraManager from '../components/nativeComponents/cameraManager';
import { isSupportCloudStorage } from '../redux/modules/ipcCommon';
import { getAuduioType } from '../config/click';
import { store } from '../main';

const TYEvent = TYSdk.event;

export default class DpConfigUtils {
  /**
   * 动态化配置面板
   * @param {*} arr 表示获取的展示面板数组
   * @param {*} dpConfigs 获取到的dp点
   * @param {*} panels 所有本地的配置点
   */

  // 进入面板刚开始就进行数据进行处理,对原数组进行删减操作, 不需要进行浅拷贝。
  // 对于从云端获取的配置，因为异步方法且不是Promise,通过分发-监听其回调事件，再对返回数组进行删减操作
  static publicDelFilterMenuDp = (nativeArr, needFilterDp, needFilterCloundConfig) => {
    const { devInfo } = store.getState();
    const { schema, isShare } = devInfo;
    // 如果是分享的设备,不展示收藏点和更多功能,先对这两点进行删除。
    if (isShare) {
      _.remove(nativeArr, item => {
        return item.key === 'point' || item.key === 'feature';
      });
    }
    needFilterDp.forEach(item => {
      filterArrDp(item.dpCode, item.iconKey, nativeArr, schema);
    });
    // dp点过滤完之后,过滤云端配置
    const ret = filterServeConfig(needFilterCloundConfig, nativeArr);
    return ret;
  };
  // 进入面板刚开始就进行数据进行处理,对原数组进行增加操作, 例如麦克风的功能,体验上应该从无到有,应该在必备功能点之上进行增加,需要进行浅拷贝。
  static publicAddFilterMenuDp = (nativeArr, needFilterDp, needFilterCloundConfig) => {
    // 这里对数组进行浅拷贝,保证每次拿到的数据都是原数据
    const arr = Array.prototype.slice.call(nativeArr);
    const state = store.getState();
    const { schema } = state.devInfo;
    needFilterDp.forEach(item => {
      filterArrDp(item.dpCode, item.iconKey, arr, schema);
    });
    // dp点过滤完之后,过滤云端配置
    const ret = filterServeConfig(needFilterCloundConfig, arr);
    return ret;
  };

  // 函数前面添加一个static关键字，表明这是一个静态方法，不会被实例继承，只能通过类来调用
}
// 定义过滤Dp的方法
const filterArrDp = (dpCode, keyName, arr, schema) => {
  // 这里对ptz_control和zoom_control Dp点进行单独过滤;
  if (dpCode === 'ptz_control' || dpCode === 'zoom_control') {
    if (!('ptz_control' in schema) && !('zoom_control' in schema)) {
      _.remove(arr, item => {
        return item.key === keyName;
      });
    }
  } else if (!(`${dpCode}` in schema)) {
    _.remove(arr, item => {
      return item.key === keyName;
    });
  }
};

const filterServeConfig = (filterServerArr, arr) => {
  for (let i = 0; i < filterServerArr.length; i++) {
    if (filterServerArr[i].configName === 'cloudStorage') {
      CameraManager.isSupportedCloudStorage(msg => {
        // 判断云存储这里,都分发事件,在每个回调里单独写
        if (!msg) {
          TYEvent.emit('getSupportStorage', 'cloudStorage');
        } else {
          store.dispatch(isSupportCloudStorage({ isSupportCloudStorage: true }));
          TYEvent.emit('getSupportStorage', 'cloudStorage');
        }
      });
    } else if (filterServerArr[i].configName === 'mic') {
      // 是否支持对讲必须要在connect成功之后
      // 有麦克风采取过滤配置点为添加法,页面优化，因为是否有对讲是通过p2pConnected之后才能调取connected方法进行判定,不然结果不准
      if (arr[0].hasMic) {
        CameraManager.isSupportedTalk(result => {
          if (result) {
            getAuduioType();
          }
        });
      }
    }
  }
  return arr;
};
