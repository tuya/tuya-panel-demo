/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { decode } from 'js-base64';
import { TYSdk, Utils } from 'tuya-panel-kit';
import TUNICloudStorageSignatureManager from '../TUNICloudStorageSignatureManager/dist';

export class OssApi {
  layBin: string;

  routeBin: string;

  navBin: string;

  modelConfig: any;

  constructor() {
    this.layBin = '/layout/lay.bin';
    this.routeBin = '/route/rou.bin';
    this.navBin = '/route/nav.bin';
  }

  /**
   * 获取云存储配置
   * @param devId
   * @param type
   * @returns
   */
  updateAuthentication = (devId: string, type = 'Common') => {
    return new Promise(async (resolve, reject) => {
      TYSdk.apiRequest(`${decode('dHV5YQ==')}.m.dev.storage.config.get`, { type, devId })
        .then((response: any) => {
          const model =
            typeof response === 'string' ? Utils.JsonUtils.parseJSON(response) : response;
          this.modelConfig = model;
          resolve(model.bucket || '');
        })
        .catch(e => {
          reject(e);
        });
    });
  };

  /**
   * 获取最近一次地图文件数据
   * @returns {Promise<{ mapPath: string; routePath: string }>} { mapPath, routePath }
   * mapPath: 地图数据云端的bin文件路径
   * routePath: 路径bin文件路径
   */
  getLatestMapFile = (devId: string): Promise<{ mapPath: string; routePath: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.modelConfig) {
          await this.updateAuthentication(devId);
        }
        if (this.modelConfig.pathConfig) {
          const mapBinPath = this.modelConfig.pathConfig.common + this.layBin;
          const routeBinPath = this.modelConfig.pathConfig.common + this.routeBin;
          resolve({ mapPath: mapBinPath, routePath: routeBinPath });
        } else {
          resolve({ mapPath: '', routePath: '' });
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * 获取完整oss下载链接
   * @param {string} bucket 权限验证
   * @param {string} filePath 文件相对路径
   * @returns {Promise<string>} fileUrl 文件的Url
   */
  getCloudFileUrl = (bucket: string, filePath: string): Promise<string> => {
    try {
      if (!this.modelConfig) {
        return Promise.resolve('');
      }
      return new Promise((resolve, reject) => {
        TUNICloudStorageSignatureManager.generateSignedUrl({
          bucket,
          path: filePath,
          expiration: this.modelConfig.expiration,
          region: this.modelConfig.region,
          token: this.modelConfig.token,
          sk: this.modelConfig.sk,
          provider: this.modelConfig.provider,
          endpoint: this.modelConfig.endpoint,
          ak: this.modelConfig.ak,
          success: (data: { signedUrl: string }) => {
            const { signedUrl } = data;
            let cloudFileUrl = signedUrl;
            if (signedUrl.indexOf('http') === -1) {
              cloudFileUrl = `https://${signedUrl}`;
            }
            resolve(cloudFileUrl);
          },
          fail: (failInfo: { (...args: any[]): void }) => {
            resolve('');
          },
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

// 以实例化对象向外导出
const ossApiInstance = new OssApi();

export default ossApiInstance;
