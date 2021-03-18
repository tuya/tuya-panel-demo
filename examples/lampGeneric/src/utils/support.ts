import _get from 'lodash/get';
import { TYSdk } from 'tuya-panel-kit';
import dpCodes from '../config/dpCodes';
import { getCloudFun } from '../api';

/**
 * 功能支持工具类
 */
// interface ISupportUtils {
//   isSupportWhite: (isForce?: boolean) => boolean; // 支持白光
//   isSupportBright: (isForce?: boolean) => boolean; // 支持白光亮度
//   isSupportTemp: (isForce?: boolean) => boolean; // 支持色温
//   isSupportColour: (isForce?: boolean) => boolean; // 支持彩光
//   isSupportScene: (isForce?: boolean) => boolean; // 支持场景
//   isSupportCountdown: (isForce?: boolean) => boolean; // 支持倒计时
//   isSupportMusic: (isForce?: boolean) => boolean; // 支持音乐
//   isSupportRhythm: (isForce?: boolean) => boolean; // 支持生物节律
//   isGroupDevice: () => boolean;
//   isZigbeeDevice: () => boolean;
//   isSignMeshDivice: () => boolean;
//   isWifiDivice: () => boolean;
//   hasCapability: (id: number) => boolean;
// }

const cache: any = {};

const {
  brightCode,
  temperatureCode,
  colourCode,
  workModeCode,
  sceneCode,
  countdownCode,
  musicCode,
} = dpCodes;

const supportDp = (code: string) => {
  const { schema } = TYSdk.devInfo;
  return !!schema[code];
};

const supportWorkMode = (code: string) => {
  const { schema } = TYSdk.devInfo;
  const workModeRange: string[] = _get(schema[workModeCode], 'range') || [];
  return workModeRange.includes(code);
};

const isSupportByDpAndWorkMode = (
  code: string,
  dpCode: string,
  workmode: string,
  isForce: boolean
) => {
  if (!isForce) {
    if (cache[code]) {
      return cache[code];
    }
  }
  // 云端配置
  const cloudSupport: boolean | null = getCloudFun(code, null);
  // 是否存在相关dp
  const isDpSupport = supportDp(dpCode);
  const isInWorkMode = supportWorkMode(workmode);
  // 没有相关dp支持
  let isSupport = false;
  if (isDpSupport && isInWorkMode) {
    if (cloudSupport !== false) {
      isSupport = true;
    }
  }
  cache[code] = isSupport;
  return isSupport;
};

const isSupportByDp = (code: string, dpCode: string, isForce: boolean) => {
  if (!isForce) {
    if (cache[code]) {
      return cache[code];
    }
  }
  // 云端配置
  const cloudSupport: boolean | null = getCloudFun(code, null);
  // 是否存在相关dp
  const isDpSupport = supportDp(dpCode);
  // 没有相关dp支持
  let isSupport = false;
  if (isDpSupport) {
    if (cloudSupport !== false) {
      isSupport = true;
    }
  }
  cache[code] = isSupport;
  return isSupport;
};

const SupportUtils = {
  isGroupDevice() {
    return !!TYSdk.devInfo.groupId;
  },
  isSupportBright(isForce = false) {
    return isSupportByDpAndWorkMode('isSupportBright', brightCode, 'white', isForce);
  },
  isSupportTemp(isForce = false) {
    return isSupportByDpAndWorkMode('isSupportTemp', temperatureCode, 'white', isForce);
  },
  isSupportColour(isForce = false) {
    return isSupportByDpAndWorkMode('isSupportColour', colourCode, 'colour', isForce);
  },
  isSupportScene(isForce = false) {
    return isSupportByDpAndWorkMode('isSupportScene', sceneCode, 'scene', isForce);
  },
  isSupportMusic(isForce = false) {
    return isSupportByDpAndWorkMode('isSupportMusic', musicCode, 'music', isForce);
  },
  isSupportCountdown(isForce = false) {
    return isSupportByDp('isSupportCountdown', countdownCode, isForce);
  },
  isSupportWhite(isForce = false) {
    const code = 'isSupportWhite';
    if (!isForce) {
      if (cache[code]) {
        return cache[code];
      }
    }
    // 云端配置
    const cloudSupport: boolean | null = getCloudFun(code, null);
    // 是否存在相关dp
    const isSupportBright = SupportUtils.isSupportBright(true);
    const isSupportTemp = SupportUtils.isSupportTemp(true);

    let isSupport = false;
    if (isSupportBright || isSupportTemp) {
      // 有相关dp支持，但云端未开启不支持该功能
      if (cloudSupport !== false) {
        isSupport = true;
      }
    }
    cache[code] = isSupport;
    return cache[code];
  },
  isSupportWorkMode(code: string) {
    return supportWorkMode(code);
  },
  isSupportDp(dpCode: string, isForce = false) {
    const code = `isSupport_${dpCode}`;
    if (!isForce) {
      if (cache[code]) {
        return cache[code];
      }
    }
    // 云端配置
    const cloudSupport: boolean | null = getCloudFun(code, null);
    const isSupportDp = supportDp(dpCode);

    let isSupport = false;
    if (isSupportDp) {
      // 有相关dp支持，但云端未开启不支持该功能
      if (cloudSupport !== false) {
        isSupport = true;
      }
    }
    cache[code] = isSupport;
    return cache[code];
  },
  hasCapability(id: number) {
    // eslint-disable-next-line no-bitwise
    return (TYSdk.devInfo.capability & (1 << id)) > 0;
  },
  isZigbeeDevice() {
    return SupportUtils.hasCapability(12);
  },
  isSignMeshDivice() {
    return SupportUtils.hasCapability(15);
  },
  isWifiDivice() {
    return SupportUtils.hasCapability(1);
  },
};

export default SupportUtils;
