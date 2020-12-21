import { TYSdk } from 'tuya-panel-kit';
export const getOpenListNeedDpId = (config: configType): string[] => {
  const {
    unlockFingerprint,
    unlockPassword,
    unlockTemp,
    unlockDynamic,
    unlockCard,
    unlockFace,
    unlockKey,
    unlockRemote,
  } = config;
  const dpIds = [
    unlockFingerprint,
    unlockPassword,
    unlockTemp,
    unlockDynamic,
    unlockCard,
    unlockFace,
    unlockKey,
    unlockRemote,
  ].map(item => {
    return TYSdk.device.getDpIdByCode(item);
  });
  return dpIds;
};
