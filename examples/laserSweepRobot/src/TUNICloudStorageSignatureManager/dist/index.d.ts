import * as t from '@tuya-native/tuya-plugin-meta/lib/types';
/** 生成云存储签名URL
@platform: all
@param params {params: CloudStorageSignatureParams,success: t.SuccessCb<CloudStorageSignatureResponse>,fail: t.FailureCb, complete: any }
*/
declare function generateSignedUrl(params: {
    params: CloudStorageSignatureParams;
    success: t.SuccessCb<CloudStorageSignatureResponse>;
    fail: t.FailureCb;
    complete: any;
}): void | Promise<any>;
declare class CloudStorageSignatureParams {
    /**
     * file path
     */
    path: string;
    /**
     * expiration
     */
    expiration: string;
    /**
     * region
     */
    region: string;
    /**
     * token
     */
    token: string;
    /**
     * sk
     */
    sk: string;
    /**
     * provider
     */
    provider: string;
    /**
     * endpoint
     */
    endpoint: string;
    /**
     * ak
     */
    ak: string;
    /**
     * bucket
     */
    bucket: string;
}
declare class CloudStorageSignatureResponse {
    /**
     * signed url
     */
    signedUrl: string;
}
declare const TUNICloudStorageSignatureManager: {
    constants: Record<string, any>;
    generateSignedUrl: typeof generateSignedUrl;
};
export default TUNICloudStorageSignatureManager;
