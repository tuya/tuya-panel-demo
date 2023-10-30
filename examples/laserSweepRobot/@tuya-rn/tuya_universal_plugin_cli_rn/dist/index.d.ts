export declare function isJSON(args: any): boolean;
export declare function isSupportTTT(): boolean;
export declare function reducerResult(res?: string | Record<string, any>): string | Record<string, any> | undefined;
export declare function reducerCallback(callback?: {
    success?: ((arg?: string | Record<string, any>) => void) | null;
    fail?: ((arg?: string | Record<string, any>) => void) | null;
    complete?: ((arg?: string | Record<string, any>) => void) | null;
}): any;
export declare const omit: (object: Record<string, unknown>, keys: string[]) => Record<string, unknown>;
export declare function rnRequestMethod(moduleName: string, funName: string, params: Record<string, any>, meta: {
    available: string;
    platform: string;
    container: string;
    deprecated: string;
    hasSync: string | boolean;
    className: string;
}): void | Promise<any>;
export declare function rnRequestEvent(moduleName: string, eventName: string, functionName: string, callback: (params?: any) => void): void;
export declare function rnRegisterEvent(moduleName: string, eventName: string, funName: string, params: Record<string, any>, meta: {
    available: string;
    platform: string;
    container: string;
    deprecated: string;
    hasSync: string | boolean;
    className: string;
}, callback: (params?: any) => void): void;
export declare const getConstants: () => Record<string, any>;
