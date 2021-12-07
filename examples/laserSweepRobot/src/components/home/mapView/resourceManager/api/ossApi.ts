import { TYLaserManager } from './nativeApi';

/**
 *  更新鉴权
 *
 * @param {string} devId
 * @returns {Promise<string>} bucket云存储桶信息
 */
export const updateAuthentication = (devId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    TYLaserManager.updateCloudConfig(devId, resolve, reject);
  });
};

/**
 * 获取最近一次地图文件数据
 *
 * @returns {Promise<{ mapPath: string; routePath: string }>} { mapPath, routePath }
 * mapPath: 地图数据云端的bin文件路径
 * routePath: 路径bin文件路径
 */
export const getLatestMapFile = (
  devId: string
): Promise<{ mapPath: string; routePath: string }> => {
  return new Promise((resolve, reject) => {
    TYLaserManager.getSweeperCurrentPath(devId, resolve, reject);
  });
};

/**
 * 获取完整oss下载链接
 *
 * @param {string} bucket 权限验证
 * @param {string} filePath 文件相对路径
 * @returns {Promise<string>} fileUrl 文件的Url
 */
export const getCloudFileUrl = (bucket: string, filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    TYLaserManager.getCloudFileUrl(bucket, filePath, resolve, reject);
  });
};
