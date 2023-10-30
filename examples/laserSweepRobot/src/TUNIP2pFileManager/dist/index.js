"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
  该文件自动生成，每次都会覆盖
*/
// @ts-nocheck
const tuya_universal_plugin_cli_rn_1 = require("@tuya-rn/tuya_universal_plugin_cli_rn");
/** P2P SDK 初始化
@platform: all
@param params {params: ThingP2PInitConfigParams,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function P2PSDKInit(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'P2PSDKInit', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PInitConfigParams","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PInitConfigParams"}',
    });
}
/** 建立P2P连接
@platform: all
@param params {params: ThingP2PConnectionParams,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function connectDevice(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'connectDevice', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PConnectionParams","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PConnectionParams"}',
    });
}
/** 检查P2P连接
@platform: all
*/
function isP2PActive(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'isP2PActive', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'true',
        className: '{"ios":"TUNIP2pFileManagerThingP2PConnectionParams","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PConnectionParams"}',
    });
}
/** 检查P2P连接
@platform: all
*/
function isP2PActiveSync(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'isP2PActiveSync', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: true,
        className: '{"ios":"TUNIP2pFileManagerThingP2PConnectionParams","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PConnectionParams"}',
    });
}
/** 查询设备相册文件索引列表
@platform: all
@param params {params: ThingP2PAlbum,success: t.SuccessCb<ThingP2PAlbumFileIndexs>,fail: t.FailureCb, complete: any }
*/
function queryAlbumFileIndexs(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'queryAlbumFileIndexs', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PAlbum","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PAlbum"}',
    });
}
/** P2P上传文件
@platform: all
@param params {params: ThingP2PUploadFile,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function uploadFile(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'uploadFile', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PUploadFile","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PUploadFile"}',
    });
}
/** P2P下载文件
@platform: all
@param params {params: ThingP2PDownloadFile,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function downloadFile(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'downloadFile', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PDownloadFile","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PDownloadFile"}',
    });
}
/** P2P下载数据流
@platform: all
@param params {params: ThingP2PDownloadStream,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function downloadStream(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'downloadStream', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PDownloadStream","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PDownloadStream"}',
    });
}
/** 取消传输任务
@platform: all
@param params {params: ThingP2PUploadTask,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function cancelUploadTask(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'cancelUploadTask', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PUploadTask","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PUploadTask"}',
    });
}
/** 取消下载任务
@platform: all
@param params {params: ThingP2PDownloadTask,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function cancelDownloadTask(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'cancelDownloadTask', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PDownloadTask","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PDownloadTask"}',
    });
}
/** 和设备断开连接
@platform: all
@param params {params: ThingP2PDevice,success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function disconnectDevice(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'disconnectDevice', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNIP2pFileManagerThingP2PDevice","android":"com.thingclips.smart.plugin.tunip2pfilemanager.bean.ThingP2PDevice"}',
    });
}
/** P2P SDK 反初始化
@platform: all
@param params {success: t.SuccessCb<t.Null>,fail: t.FailureCb, complete: any }
*/
function deInitSDK(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNIP2pFileManager', 'deInitSDK', Object.assign(Object.assign({}, params), { noParams: true }), {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"null","android":"null"}',
    });
}
/** 连接状态改变回调
@call (body:ThingP2PSessionStatus)=>{}  @param body   ThingP2PSessionStatus
*/
function onSessionStatusChange(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onSessionStatusChange', 'onSessionStatusChange', callback);
}
/** 连接状态改变回调
@call (body:ThingP2PSessionStatus)=>{}  @param body   ThingP2PSessionStatus
*/
function offSessionStatusChange(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onSessionStatusChange', 'offSessionStatusChange', callback);
}
/** 上传进度回调
@call (body:ProgressEvent)=>{}  @param body   ProgressEvent
*/
function onUploadProgressUpdate(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onUploadProgressUpdate', 'onUploadProgressUpdate', callback);
}
/** 上传进度回调
@call (body:ProgressEvent)=>{}  @param body   ProgressEvent
*/
function offUploadProgressUpdate(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onUploadProgressUpdate', 'offUploadProgressUpdate', callback);
}
/** 单个文件下载进度回调
@call (body:DownloadProgressEvent)=>{}  @param body   DownloadProgressEvent
*/
function onDownloadProgressUpdate(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onDownloadProgressUpdate', 'onDownloadProgressUpdate', callback);
}
/** 单个文件下载进度回调
@call (body:DownloadProgressEvent)=>{}  @param body   DownloadProgressEvent
*/
function offDownloadProgressUpdate(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onDownloadProgressUpdate', 'offDownloadProgressUpdate', callback);
}
/** 下载总进度回调
@call (body:DownloadTotalProgressEvent)=>{}  @param body   DownloadTotalProgressEvent
*/
function onDownloadTotalProgressUpdate(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onDownloadTotalProgressUpdate', 'onDownloadTotalProgressUpdate', callback);
}
/** 下载总进度回调
@call (body:DownloadTotalProgressEvent)=>{}  @param body   DownloadTotalProgressEvent
*/
function offDownloadTotalProgressUpdate(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onDownloadTotalProgressUpdate', 'offDownloadTotalProgressUpdate', callback);
}
/** 单文件下载完成事件
@call (body:FileDownloadCompletionEvent)=>{}  @param body   FileDownloadCompletionEvent
*/
function onFileDownloadComplete(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onFileDownloadComplete', 'onFileDownloadComplete', callback);
}
/** 单文件下载完成事件
@call (body:FileDownloadCompletionEvent)=>{}  @param body   FileDownloadCompletionEvent
*/
function offFileDownloadComplete(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onFileDownloadComplete', 'offFileDownloadComplete', callback);
}
/** 收到数据包事件
@call (body:StreamDownloadPacketReceivedEvent)=>{}  @param body   StreamDownloadPacketReceivedEvent
*/
function onStreamPacketReceive(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onStreamPacketReceive', 'onStreamPacketReceive', callback);
}
/** 收到数据包事件
@call (body:StreamDownloadPacketReceivedEvent)=>{}  @param body   StreamDownloadPacketReceivedEvent
*/
function offStreamPacketReceive(callback) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestEvent)('TUNIP2pFileManager', 'onStreamPacketReceive', 'offStreamPacketReceive', callback);
}
const TUNIP2pFileManagerMethods = {
    P2PSDKInit,
    connectDevice,
    isP2PActiveSync,
    isP2PActive,
    queryAlbumFileIndexs,
    uploadFile,
    downloadFile,
    downloadStream,
    cancelUploadTask,
    cancelDownloadTask,
    disconnectDevice,
    deInitSDK,
    onSessionStatusChange,
    offSessionStatusChange,
    onUploadProgressUpdate,
    offUploadProgressUpdate,
    onDownloadProgressUpdate,
    offDownloadProgressUpdate,
    onDownloadTotalProgressUpdate,
    offDownloadTotalProgressUpdate,
    onFileDownloadComplete,
    offFileDownloadComplete,
    onStreamPacketReceive,
    offStreamPacketReceive,
};
const taskMethod = {};
class TTTPlugin {
}
class ThingP2PInitConfigParams {
}
class ThingP2PConnectionParams {
}
class ThingP2PDevice {
}
class ThingP2PAlbum {
}
class ThingP2PAlbumFileIndex {
}
class ThingP2PAlbumFileIndexs {
}
class ThingP2PUploadFile {
}
class ThingP2PDownloadFile {
}
class ThingP2PDownloadStream {
}
class ThingP2PUploadTask {
}
class ThingP2PDownloadTask {
}
class ThingP2PSessionStatus {
}
class ProgressEvent {
}
class DownloadProgressEvent {
}
class DownloadTotalProgressEvent {
}
class FileDownloadCompletionEvent {
}
class StreamDownloadPacketReceivedEvent {
}
const TUNIP2pFileManager = Object.assign(Object.assign(Object.assign({}, TUNIP2pFileManagerMethods), taskMethod), { constants: (0, tuya_universal_plugin_cli_rn_1.getConstants)() });
exports.default = TUNIP2pFileManager;
