"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConstants = exports.rnRegisterEvent = exports.rnRequestEvent = exports.rnRequestMethod = exports.omit = exports.reducerCallback = exports.reducerResult = exports.isSupportTTT = exports.isJSON = void 0;
/* eslint-disable no-param-reassign */
const react_native_1 = require("react-native");
let Event = {};
const compareVersion = (v1, v2) => {
    if (typeof v1 !== 'string')
        return false;
    if (typeof v2 !== 'string')
        return false;
    const newV1 = v1.split('.');
    const newV2 = v2.split('.');
    const k = Math.min(newV1.length, newV2.length);
    for (let i = 0; i < k; ++i) {
        const res1 = parseInt(newV1[i], 10);
        const res2 = parseInt(newV2[i], 10);
        if (res1 > res2)
            return 1;
        if (res1 < res2)
            return -1;
    }
    return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
};
function isJSON(args) {
    return (typeof args === 'string' && !args.indexOf('{') && args.lastIndexOf('}') === args.length - 1);
}
exports.isJSON = isJSON;
function isSupportTTT() {
    return react_native_1.NativeModules && react_native_1.NativeModules.TYRCTPBTBridgeManager;
}
exports.isSupportTTT = isSupportTTT;
function reducerResult(res) {
    const result = isJSON(res) ? JSON.parse(res) : res;
    const { data, errorMsg, errorCode } = result, rest = __rest(result, ["data", "errorMsg", "errorCode"]);
    if (errorCode !== 0) {
        return Object.assign({ errorMsg, errorCode }, rest);
    }
    return data;
}
exports.reducerResult = reducerResult;
function reducerCallback(callback = {
    success: null,
    fail: null,
    complete: null,
}) {
    const { success = null, fail = null, complete = null } = callback;
    const completeFail = (args) => {
        if (fail) {
            fail(reducerResult(args));
            complete && complete(reducerResult(args));
        }
    };
    const completeSuccess = (args) => {
        if (success) {
            success(reducerResult(args));
            complete && complete(reducerResult(args));
        }
    };
    return { completeSuccess, completeFail };
}
exports.reducerCallback = reducerCallback;
const omit = (object, keys) => {
    const shallowCopy = Object.assign({}, object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        delete shallowCopy[key];
    }
    return shallowCopy;
};
exports.omit = omit;
// 方法
function rnRequestMethod(moduleName, funName, params, meta) {
    try {
        const { success = null, fail = null, complete = null } = params, noCallbackParams = __rest(params, ["success", "fail", "complete"]);
        const { completeSuccess, completeFail } = reducerCallback({ success, fail, complete });
        const { hasSync = false, className = '' } = meta;
        const classNameParse = JSON.parse(className);
        let callClassName = classNameParse[react_native_1.Platform.OS];
        if (compareVersion('5.65', react_native_1.NativeModules.TYRCTPublicManager.mobileInfo.appRnVersion) === -1) {
            if (react_native_1.Platform.OS === 'ios') {
                callClassName = callClassName.replace('TYUni', 'TUNI');
                callClassName = callClassName.replace(/TY/g, 'Thing');
                callClassName = callClassName.replace(/Tuya/g, 'Thing');
            }
            else {
                callClassName = callClassName.replace(/.tuya./, '.thingclips.');
                callClassName = callClassName.replace(/tyuni/g, 'tuni');
                callClassName = callClassName.replace(/TY/g, 'Thing');
                callClassName = callClassName.replace(/Tuya/g, 'Thing');
            }
            moduleName = moduleName.replace(/TYUni/g, 'TUNI');
            funName = funName.replace(/TY/g, '');
        }
        const hasParams = noCallbackParams.noParams
            ? null
            : JSON.stringify({ data: Object.assign({}, noCallbackParams), className: callClassName });
        if (typeof hasSync === 'boolean' && !!hasSync) {
            funName = funName.replace(/Sync/g, '');
            return new Promise((resolve, reject) => {
                react_native_1.NativeModules.TYRCTPBTBridgeManager.universalApi(moduleName, funName, hasParams, (resultData) => {
                    resolve(reducerResult(resultData));
                }, (errorData) => {
                    resolve(reducerResult(errorData));
                });
            });
        }
        return react_native_1.NativeModules.TYRCTPBTBridgeManager.universalApi(moduleName, funName, hasParams, completeSuccess, completeFail);
    }
    catch (error) {
        console.log(`${moduleName}.${funName} request error!`, error);
        throw error;
    }
}
exports.rnRequestMethod = rnRequestMethod;
const eventEmitter = isSupportTTT()
    ? new react_native_1.NativeEventEmitter(react_native_1.NativeModules.TYRCTPBTBridgeManager)
    : null;
eventEmitter &&
    eventEmitter.addListener('eventHandler', body => {
        const { data, eventName: resEventName } = body;
        const result = isJSON(data) ? JSON.parse(data) : data;
        react_native_1.DeviceEventEmitter.emit(resEventName, result);
    });
// 事件
function rnRequestEvent(moduleName, eventName, functionName, callback) {
    if (compareVersion('5.65', react_native_1.NativeModules.TYRCTPublicManager.mobileInfo.appRnVersion) === -1) {
        moduleName = moduleName.replace(/TYUni/g, 'TUNI');
        eventName = eventName.replace(/TY/g, '');
    }
    if (functionName && functionName.startsWith('on')) {
        Event[eventName] = react_native_1.DeviceEventEmitter.addListener(`${moduleName}.${eventName}`, data => {
            typeof callback === 'function' && callback(data);
        });
    }
    if (functionName && functionName.startsWith('off')) {
        Event && Event[eventName] && Event[eventName].remove();
        Event = (0, exports.omit)(Event, [eventName]);
        typeof callback === 'function' && callback();
    }
}
exports.rnRequestEvent = rnRequestEvent;
// registerEvent
function rnRegisterEvent(moduleName, eventName, funName, params, meta, callback) {
    if (compareVersion('5.65', react_native_1.NativeModules.TYRCTPublicManager.mobileInfo.appRnVersion) === -1) {
        moduleName = moduleName.replace(/TYUni/g, 'TUNI');
        eventName = eventName.replace(/TY/g, '');
        funName = funName.replace(/TY/g, '');
    }
    if (funName.startsWith('on')) {
        if (!Event[eventName]) {
            rnRequestMethod(moduleName, funName, Object.assign(Object.assign({}, params), { success: () => {
                    Event[eventName] = react_native_1.DeviceEventEmitter.addListener(`${moduleName}.${eventName}`, data => {
                        typeof callback === 'function' && callback(data);
                    });
                }, fail: failRes => {
                    typeof callback === 'function' && callback(reducerResult(failRes));
                } }), meta);
        }
        else {
            Event[eventName] = react_native_1.DeviceEventEmitter.addListener(`${moduleName}.${eventName}`, data => {
                typeof callback === 'function' && callback(data);
            });
        }
    }
    if (funName.startsWith('off')) {
        rnRequestMethod(moduleName, funName, params, meta);
        Event && Event[eventName] && Event[eventName].remove();
        Event = (0, exports.omit)(Event, [eventName]);
        typeof callback === 'function' && callback();
    }
}
exports.rnRegisterEvent = rnRegisterEvent;
const getConstants = () => {
    if (isSupportTTT()) {
        const { constants } = react_native_1.NativeModules.TYRCTPBTBridgeManager;
        return isJSON(constants) ? JSON.parse(constants) : constants;
    }
    return {};
};
exports.getConstants = getConstants;
