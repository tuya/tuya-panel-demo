import Res from '@res';
import { saveDeviceCloudData, getDeviceCloudData, panelManager } from '@utils';
import { TYSdk } from 'tuya-panel-kit';
import { Battery } from '@interface';

const GUIDE_FLAG = 'guideFlag';
/**
 * @param ele 电量
 * @returns icon
 */
export const getEleIcon = (ele: number | Battery) => {
  const mapTable = {
    low: Res.ele_02,
    poweroff: Res.ele_01,
    medium: Res.ele_05,
    high: Res.ele_08,
  };
  const eleIcon = typeof ele === 'number' ? eleFormat(ele) : mapTable[ele];
  return eleIcon;
};

const eleFormat = (ele: number) => {
  switch (true) {
    case ele === 0:
      return Res.ele_0;
    case 0 < ele && ele < 10:
      return Res.ele_01;
    case 10 <= ele && ele < 20:
      return Res.ele_02;
    case 20 <= ele && ele < 30:
      return Res.ele_03;
    case 30 <= ele && ele < 40:
      return Res.ele_04;
    case 40 <= ele && ele < 50:
      return Res.ele_05;
    case 50 <= ele && ele < 60:
      return Res.ele_06;
    case 60 <= ele && ele < 80:
      return Res.ele_07;
    case 80 <= ele && ele <= 100:
      return Res.ele_08;
    default:
      return Res.ele_05;
  }
};

export const saveGuideFlag = (flag: boolean) => {
  saveDeviceCloudData(GUIDE_FLAG, { guideFlag: flag });
};

export const getGuideFlag = async () => {
  try {
    const data = await getDeviceCloudData(GUIDE_FLAG);
    return data;
  } catch (e) {
    console.warn(e);
    return false;
  }
};

export const getDpsWithDevId = (ids: number[]) => {
  const { devId } = TYSdk.devInfo;
  return new Promise((resolve, reject) => {
    panelManager.getDpsWithDevId(
      devId,
      ids,
      (success: any) => {
        resolve(success);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
};
