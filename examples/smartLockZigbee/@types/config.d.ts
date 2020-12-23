type ConfigKey =
  | 'unlockFingerprint'
  | 'unlockPassword'
  | 'unlockTemp'
  | 'unlockDynamic'
  | 'unlockCard'
  | 'unlockFace'
  | 'unlockKey'
  | 'unlockApp'
  | 'unlockRemote'
  | 'alarm'
  | 'alarmLock'
  | 'remote'
  | 'replyRemote'
  | 'bat'
  | 'residualElectricity'
  | 'reverseLock'
  | 'antiLock'
  | 'childLock'
  | 'hijack'
  | 'openInside'
  | 'bellVolume'
  | 'keyTone'
  | 'doorBell'
  | 'doorBellRing'
  | 'remoteNoPsw'
  | 'remoteNoPswSet'
  | 'isRemoteClose'
  | 'remoteHasPsw'
  | 'language'
  | 'beepVolume'
  | 'motorTorque'
  | 'automaticLock'
  | 'autoLockTime'
  | 'unlockMethodCreate'
  | 'unlockMethodDelete'
  | 'singleUsePassword'
  | 'unlockVoiceRemote';

declare type UserType = { userId: string; [key: string]: any };
declare type ConfigType = {
  [k in ConfigKey]: string;
};

declare type ButtonListType = {
  key: string;
  text: string;
  background: any;
  type?: string;
  renderView?: any;
  length?: number;
  onPress?: () => void;
  imageColor?: { tintColor: string };
};

type UserOpenJurisdiction = {
  remoteOpenState: {
    way: string;
    user: string;
  };
  remoteOpen: boolean;
};
