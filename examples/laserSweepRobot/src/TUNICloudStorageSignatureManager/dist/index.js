"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
  该文件自动生成，每次都会覆盖
*/
// @ts-nocheck
const tuya_universal_plugin_cli_rn_1 = require("@tuya-rn/tuya_universal_plugin_cli_rn");
/** 生成云存储签名URL
@platform: all
@param params {params: CloudStorageSignatureParams,success: t.SuccessCb<CloudStorageSignatureResponse>,fail: t.FailureCb, complete: any }
*/
function generateSignedUrl(params) {
    return (0, tuya_universal_plugin_cli_rn_1.rnRequestMethod)('TUNICloudStorageSignatureManager', 'generateSignedUrl', params, {
        available: '1.0.0',
        platform: 'all',
        container: 'all',
        deprecated: '',
        hasSync: 'false',
        className: '{"ios":"TUNICloudStorageSignatureManagerCloudStorageSignatureParams","android":"com.thingclips.smart.plugin.tunicloudstoragesignaturemanager.bean.CloudStorageSignatureParams"}',
    });
}
const TUNICloudStorageSignatureManagerMethods = {
    generateSignedUrl,
};
const taskMethod = {};
class TTTPlugin {
}
class CloudStorageSignatureParams {
}
class CloudStorageSignatureResponse {
}
const TUNICloudStorageSignatureManager = Object.assign(Object.assign(Object.assign({}, TUNICloudStorageSignatureManagerMethods), taskMethod), { constants: (0, tuya_universal_plugin_cli_rn_1.getConstants)() });
exports.default = TUNICloudStorageSignatureManager;
