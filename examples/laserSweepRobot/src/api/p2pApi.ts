/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import moment from 'moment';
import { TYSdk, Utils } from 'tuya-panel-kit';
import Strings from '@i18n';
import { protocolUtil } from '@protocol';
import TUNIP2pFileManager from '../TUNIP2pFileManager/dist';

const { logger } = protocolUtil;

interface ErrorCbParams {
  errorMsg: string;
  errorCode: string | number;
  innerError: {
    errorCode: string | number;
    errorMsg: string;
  };
}
/**
 * P2P 工具类
 */
export default class P2pApi {
  // P2p连接状态
  isConnected: boolean;

  offSessionStatusChange: () => void;

  constructor() {
    this.isConnected = false;
  }

  /**
   * 获取用户信息
   * @returns
   */
  getUserInfo = () => {
    return new Promise((resolve, reject) => {
      TYSdk.native.apiRNRequest(
        {
          a: 'tuya.m.user.info.get',
          postData: {},
          v: '1.0',
        },
        d => {
          resolve(Utils.JsonUtils.parseJSON(d));
        },
        e => {
          logger.info(e);
          reject(e);
        }
      );
    });
  };

  /**
   * 设备断开之后的重连
   */
  reconnectP2p = (successCb?: () => void) => {
    /**
     * 监听到断开事件后
     * 连接成功后设置flag为true
     * 并清除定时器
     */
    this.isConnected = false;
    if (!this.isConnected) {
      logger.info('【P2pApi】==> 开始P2P重连', moment().format('YYYY-MM-DD HH:mm:ss'));

      this.connectDevice(
        () => {
          this.isConnected = true;
          if (this.isConnected) {
            typeof successCb === 'function' && successCb();
          }
        },
        () => {},
        err => {
          if (!this.isConnected) {
            logger.info('【P2pApi】==> P2P重连失败', moment().format('YYYY-MM-DD HH:mm:ss'));
            setTimeout(() => {
              this.reconnectP2p(successCb);
            }, 3000);
          }
        }
      );
    }
  };

  /**
   * 初始化P2P SDK
   * @param id 用户Id
   * @returns
   */
  initP2pSdk = async () => {
    const userInfo = await this.getUserInfo();
    const { id } = userInfo as any;
    return new Promise<boolean>((resolve, reject) => {
      try {
        TUNIP2pFileManager.P2PSDKInit({
          userId: id,
          success: () => {
            logger.info('【P2pApi】==> P2PSDKInit success');
            resolve(true);
          },
          fail: (params: ErrorCbParams) => {
            logger.info('【P2pApi】==> P2PSDKInit fail', params);
            resolve(false);
          },
        });
      } catch (e) {
        reject(false);
      }
    });
  };

  /**
   * 连接设备
   * @returns
   */
  connectDevice = (successCb?: () => void, failCb?: () => void, completeCb?: () => void) => {
    return new Promise<boolean>((resolve, reject) => {
      try {
        TUNIP2pFileManager.connectDevice({
          deviceId: TYSdk.devInfo.devId,
          timeout: 5000,
          mode: 0,
          success: () => {
            logger.info('【P2pApi】==> connectDevice success');
            this.isConnected = true;
            typeof successCb === 'function' && successCb();
            resolve(true);
          },
          fail: (err: ErrorCbParams) => {
            logger.info('【P2pApi】==> connectDevice failed', err);

            if (err?.innerError?.errorCode === '-23') {
              // todo your's
            }
            typeof failCb === 'function' && failCb();
            resolve(false);
          },
          complete: () => {
            typeof completeCb === 'function' && completeCb();
          },
        });
      } catch (e) {
        reject(false);
      }
    });
  };

  /**
   * 断开P2P设备连接
   * @returns
   */
  disconnectDevice = () => {
    return new Promise<boolean>((resolve, reject) => {
      try {
        TUNIP2pFileManager.disconnectDevice({
          deviceId: TYSdk.devInfo.devId,
          success: () => {
            this.isConnected = false;
            logger.info('【P2pApi】==> disconnectDevice, success');
            resolve(true);
          },
          fail: () => {
            resolve(false);
          },
        });
      } catch (e) {
        reject(false);
      }
    });
  };

  /**
   * 开始P2p流传输
   * @param files
   * @param albumName
   * @param filePath
   * @param successCb
   * @param failedCb
   * @returns
   */
  downloadStream = (
    files: { files: Array<string> },
    albumName: string,
    successCb?: () => void,
    failedCb?: () => void
  ) => {
    try {
      if (this.isConnected) {
        return new Promise((resolve, reject) => {
          TUNIP2pFileManager.downloadStream({
            deviceId: TYSdk.devInfo.devId,
            albumName,
            jsonfiles: JSON.stringify(files),
            success: () => {
              logger.info('【P2pApi】==> downloadStream success');
              typeof successCb === 'function' && successCb();
              resolve(true);
            },
            fail: (error: ErrorCbParams) => {
              logger.info('【P2pApi】==> downloadStream fail', error);
              setTimeout(() => {
                typeof failedCb === 'function' && failedCb();
              }, 500);
              reject(error);
            },
            complete: () => {},
          });
        });
      }
    } catch (e) {
      logger.info(e);
    }
  };

  /**
   * 监听p2p传输数据流
   * @param callback
   * @returns
   */
  onP2pStreamPacketReceive = (callback: { (...args: any[]): void }) => {
    TUNIP2pFileManager.onStreamPacketReceive(callback);
    return () => {
      // 反注册监听
      TUNIP2pFileManager.offStreamPacketReceive(callback);
    };
  };

  /**
   * 开始下载文件
   * files : {"files":["filesname1", "filesname2", "filesname3" ]}
   */
  downloadFile = (
    files: { files: Array<string> },
    albumName: string,
    filePath: string,
    successCb?: () => void,
    failedCb?: () => void
  ) => {
    try {
      if (this.isConnected) {
        return new Promise((resolve, reject) => {
          TUNIP2pFileManager.downloadFile({
            deviceId: TYSdk.devInfo.devId,
            albumName,
            filePath,
            jsonfiles: JSON.stringify(files),
            success: () => {
              logger.info('【P2pApi】==> downloadFile success');
              typeof successCb === 'function' && successCb();
              resolve(true);
            },
            fail: (params: ErrorCbParams) => {
              logger.info('【P2pApi】==> downloadFile fail', params);
              setTimeout(() => {
                typeof failedCb === 'function' && failedCb();
              }, 500);
              resolve(false);
            },
            complete: () => {},
          });
        });
      }
    } catch (e) {
      logger.info(e);
    }
  };

  /**
   * 注册下载监听事件
   * @param callback
   * @returns
   */
  onDownloadProgressUpdate = (callback: { (...args: any[]): void }) => {
    TUNIP2pFileManager.onDownloadProgressUpdate(callback);
    return () => {
      // 反注册监听
      TUNIP2pFileManager.offDownloadProgressUpdate(callback);
    };
  };

  /**
   * 注册多文件下载进度监听
   * @param callback
   * @returns
   */
  onDownloadTotalProgressUpdate = (callback: { (...args: any[]): void }) => {
    TUNIP2pFileManager.onDownloadTotalProgressUpdate(callback);
    return () => {
      // 反注册监听
      TUNIP2pFileManager.offDownloadTotalProgressUpdate(callback);
    };
  };

  /**
   * 注册单文件下载进度完成监听
   * @param callback
   * @returns
   */
  onFileDownloadComplete = (callback: { (...args: any[]): void }) => {
    TUNIP2pFileManager.onFileDownloadComplete(callback);
    return () => {
      // 反注册监听
      TUNIP2pFileManager.offFileDownloadComplete(callback);
    };
  };

  /**
   * 注册设备因为其他异常断开连接的事件
   * @returns
   */
  onSessionStatusChange = (callback: { (...args: any[]): void }) => {
    TUNIP2pFileManager.onSessionStatusChange(callback);
    this.offSessionStatusChange = () => {
      // 反注册监听
      TUNIP2pFileManager.offSessionStatusChange(callback);
    };
    return this.offSessionStatusChange;
  };

  /**
   * 取消进行下载
   * @returns
   */
  cancelDownloadTask = () => {
    return new Promise((resolve, reject) => {
      try {
        TUNIP2pFileManager.cancelDownloadTask({
          deviceId: TYSdk.devInfo.devId,
          success: () => {
            resolve(true);
          },
          fail: () => {
            reject(false);
          },
        });
      } catch (e) {
        logger.info('【P2pApi】==> cancelDownloadTask occur error', e);
        reject(false);
      }
    });
  };

  /**
   * 查询设备相册文件列表
   * @param albumName
   * @returns
   */
  queryAlbumFileIndexs = (albumName: string) => {
    return new Promise((resolve, reject) => {
      TUNIP2pFileManager.queryAlbumFileIndexs({
        deviceId: TYSdk.devInfo.devId,
        albumName,
        success: (params: { count: number; items: any[] }) => {
          logger.log('【P2pApi】==> queryAlbumFileIndexs', params);
          resolve(params);
        },
        fail: (params: ErrorCbParams) => {
          logger.log('【P2pApi】==> queryAlbumFileIndexs', params);
          resolve(null);
        },
      });
    });
  };

  /**
   * P2p SDK 销毁
   * @returns
   */
  deInitP2PSDK = async () => {
    // 先销毁断开监听
    typeof this.offSessionStatusChange === 'function' && this.offSessionStatusChange();
    // 销毁初始化时,先进行断连操作
    if (this.isConnected) {
      await this.disconnectDevice();
    }
    return new Promise<boolean>((resolve, reject) => {
      try {
        TUNIP2pFileManager.deInitSDK({
          success: () => {
            logger.info('【P2pApi】==> deInitP2pSDK success');
            resolve(true);
          },
          fail: () => {
            resolve(false);
          },
          complete: () => {
            resolve(true);
          },
        });
      } catch (e) {
        reject(false);
      }
    });
  };
}
