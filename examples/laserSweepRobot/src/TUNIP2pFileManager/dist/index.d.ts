import * as t from '@tuya-native/tuya-plugin-meta/lib/types';
/** P2P SDK 初始化
@platform: all
@param params {params: ThingP2PInitConfigParams,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function P2PSDKInit(params: {
    params: ThingP2PInitConfigParams;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 建立P2P连接
@platform: all
@param params {params: ThingP2PConnectionParams,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function connectDevice(params: {
    params: ThingP2PConnectionParams;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 检查P2P连接
@platform: all
*/
declare function isP2PActive(params: {
    params: ThingP2PConnectionParams;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 检查P2P连接
@platform: all
*/
declare function isP2PActiveSync(params: ThingP2PConnectionParams): void | Promise<any>;
/** 查询设备相册文件索引列表
@platform: all
@param params {params: ThingP2PAlbum,success: t.SuccessCb<ThingP2PAlbumFileIndexs>,fail: t.FailureCb, complete: any }
*/
declare function queryAlbumFileIndexs(params: {
    params: ThingP2PAlbum;
    success: t.SuccessCb<ThingP2PAlbumFileIndexs>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** P2P上传文件
@platform: all
@param params {params: ThingP2PUploadFile,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function uploadFile(params: {
    params: ThingP2PUploadFile;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** P2P下载文件
@platform: all
@param params {params: ThingP2PDownloadFile,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function downloadFile(params: {
    params: ThingP2PDownloadFile;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** P2P下载数据流
@platform: all
@param params {params: ThingP2PDownloadStream,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function downloadStream(params: {
    params: ThingP2PDownloadStream;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 取消传输任务
@platform: all
@param params {params: ThingP2PUploadTask,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function cancelUploadTask(params: {
    params: ThingP2PUploadTask;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 取消下载任务
@platform: all
@param params {params: ThingP2PDownloadTask,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function cancelDownloadTask(params: {
    params: ThingP2PDownloadTask;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 和设备断开连接
@platform: all
@param params {params: ThingP2PDevice,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function disconnectDevice(params: {
    params: ThingP2PDevice;
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** P2P SDK 反初始化
@platform: all
@param params {success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
declare function deInitSDK(params?: {
    success: t.SuccessCb<t.Null>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
/** 连接状态改变回调
@call (body:ThingP2PSessionStatus)=>{}  @param body   ThingP2PSessionStatus
*/
declare function onSessionStatusChange(callback: any): void;
/** 连接状态改变回调
@call (body:ThingP2PSessionStatus)=>{}  @param body   ThingP2PSessionStatus
*/
declare function offSessionStatusChange(callback: any): void;
/** 上传进度回调
@call (body:ProgressEvent)=>{}  @param body   ProgressEvent
*/
declare function onUploadProgressUpdate(callback: any): void;
/** 上传进度回调
@call (body:ProgressEvent)=>{}  @param body   ProgressEvent
*/
declare function offUploadProgressUpdate(callback: any): void;
/** 单个文件下载进度回调
@call (body:DownloadProgressEvent)=>{}  @param body   DownloadProgressEvent
*/
declare function onDownloadProgressUpdate(callback: any): void;
/** 单个文件下载进度回调
@call (body:DownloadProgressEvent)=>{}  @param body   DownloadProgressEvent
*/
declare function offDownloadProgressUpdate(callback: any): void;
/** 下载总进度回调
@call (body:DownloadTotalProgressEvent)=>{}  @param body   DownloadTotalProgressEvent
*/
declare function onDownloadTotalProgressUpdate(callback: any): void;
/** 下载总进度回调
@call (body:DownloadTotalProgressEvent)=>{}  @param body   DownloadTotalProgressEvent
*/
declare function offDownloadTotalProgressUpdate(callback: any): void;
/** 单文件下载完成事件
@call (body:FileDownloadCompletionEvent)=>{}  @param body   FileDownloadCompletionEvent
*/
declare function onFileDownloadComplete(callback: any): void;
/** 单文件下载完成事件
@call (body:FileDownloadCompletionEvent)=>{}  @param body   FileDownloadCompletionEvent
*/
declare function offFileDownloadComplete(callback: any): void;
/** 收到数据包事件
@call (body:StreamDownloadPacketReceivedEvent)=>{}  @param body   StreamDownloadPacketReceivedEvent
*/
declare function onStreamPacketReceive(callback: any): void;
/** 收到数据包事件
@call (body:StreamDownloadPacketReceivedEvent)=>{}  @param body   StreamDownloadPacketReceivedEvent
*/
declare function offStreamPacketReceive(callback: any): void;
declare class ThingP2PInitConfigParams {
    /**
     * 用户id
     */
    userId: string;
}
declare class ThingP2PConnectionParams {
    /**
     * 设备id
     */
    deviceId: string;
    /**
     * 连接模式,0:INTERNET  1:LAN
     */
    mode: t.Integer;
    /**
     * 超时时长,单位：ms,设置0会设置成默认值，Internet：15000ms， Lan：3000ms
     */
    timeout: t.Integer;
}
declare class ThingP2PDevice {
    /**
     * 设备id
     */
    deviceId: string;
}
declare class ThingP2PAlbum {
    /**
     * 设备id
     */
    deviceId: string;
    /**
     * albumName 和设备端约定字段
     */
    albumName: string;
}
declare class ThingP2PAlbumFileIndex {
    /**
     * idx 唯一标识，设备提供
     */
    idx: t.Integer;
    /**
     * channel 通道号
     */
    channel: t.Integer;
    /**
     * type 文件类型，0: 图片，2: mp4, 3: 全景拼接文件
     */
    type: t.Integer;
    /**
     * dir 0: 文件，1: 文件夹。保留字段，目前都是 0
     */
    dir: t.Integer;
    /**
     * filename 文件名，带有文件后缀
     */
    filename: string;
    /**
     * createTime 文件创建时间
     */
    createTime: t.Integer;
    /**
     * duration 视频文件时长
     */
    duration: t.Integer;
}
declare class ThingP2PAlbumFileIndexs {
    /**
     * 文件个数
     */
    count: t.Integer;
    /**
     * 文件索引
     */
    items: Array<ThingP2PAlbumFileIndex>;
}
declare class ThingP2PUploadFile {
    /**
     * 设备id
     */
    deviceId: string;
    /**
     * albumName 和设备端约定字段
     */
    albumName: string;
    /**
     * 文件本地路径
     */
    filePath: string;
    /**
     * 扩展字段
     */
    extData?: string;
    /**
     * 扩展字段长度
     */
    extDataLength?: t.Integer;
}
declare class ThingP2PDownloadFile {
    /**
     * 设备id
     */
    deviceId: string;
    /**
     * albumName 和设备端约定字段
     */
    albumName: string;
    /**
     * 下载文件本地存储路径
     */
    filePath: string;
    /**
     * 下载的文件名称，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     */
    jsonfiles: string;
}
declare class ThingP2PDownloadStream {
    /**
     * 设备id
     */
    deviceId: string;
    /**
     * albumName 和设备端约定字段
     */
    albumName: string;
    /**
     * 下载的文件名称，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     */
    jsonfiles: string;
}
declare class ThingP2PUploadTask {
    /**
     * 设备id
     */
    deviceId: string;
}
declare class ThingP2PDownloadTask {
    /**
     * 设备id
     */
    deviceId: string;
}
declare const TUNIP2pFileManager: {
    constants: Record<string, any>;
    P2PSDKInit: typeof P2PSDKInit;
    connectDevice: typeof connectDevice;
    isP2PActiveSync: typeof isP2PActiveSync;
    isP2PActive: typeof isP2PActive;
    queryAlbumFileIndexs: typeof queryAlbumFileIndexs;
    uploadFile: typeof uploadFile;
    downloadFile: typeof downloadFile;
    downloadStream: typeof downloadStream;
    cancelUploadTask: typeof cancelUploadTask;
    cancelDownloadTask: typeof cancelDownloadTask;
    disconnectDevice: typeof disconnectDevice;
    deInitSDK: typeof deInitSDK;
    onSessionStatusChange: typeof onSessionStatusChange;
    offSessionStatusChange: typeof offSessionStatusChange;
    onUploadProgressUpdate: typeof onUploadProgressUpdate;
    offUploadProgressUpdate: typeof offUploadProgressUpdate;
    onDownloadProgressUpdate: typeof onDownloadProgressUpdate;
    offDownloadProgressUpdate: typeof offDownloadProgressUpdate;
    onDownloadTotalProgressUpdate: typeof onDownloadTotalProgressUpdate;
    offDownloadTotalProgressUpdate: typeof offDownloadTotalProgressUpdate;
    onFileDownloadComplete: typeof onFileDownloadComplete;
    offFileDownloadComplete: typeof offFileDownloadComplete;
    onStreamPacketReceive: typeof onStreamPacketReceive;
    offStreamPacketReceive: typeof offStreamPacketReceive;
};
export default TUNIP2pFileManager;
