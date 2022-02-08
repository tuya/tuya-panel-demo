import c from './dpCodes';

const openDoorDpCodes = [
  c.unlockBle,
  c.unlockPassword,
  c.unlockCard,
  c.unlockFingerprint,
  c.unlockFace,
  c.unlockEye,
  c.unlockHand,
  c.unlockFingerVein,
  c.unlockTemporary,
  c.unlockOfflinePd,
  c.unlockDynamic,
  c.unlockDoubleKit,
  c.unlockRecordCheck,
  c.unlockKey,
  c.unlockPhoneRemote,
  c.unlockVoiceRemote,
  c.openInside,
  c.unlockBleIbeacon,
];

const closeDoorDpCodes = [c.lockRecord, c.manualLock];

const openModeDpCodes = [
  c.unlockFingerprint,
  c.unlockPassword,
  c.unlockCard,
  c.unlockFace,
  c.unlockFingerVein,
  c.unlockHand,
];

const settingCodes = [c.doorbellSong, c.language];

const alarmDpCodes = [c.alarmLock, c.doorbell, c.hijack];

export default {
  openDoorDpCodes,
  closeDoorDpCodes,
  openModeDpCodes,
  settingCodes,
  alarmDpCodes,
};
