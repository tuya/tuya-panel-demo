export default {
  unlockFingerprint: 'unlock_fingerprint', // 指纹解锁
  unlockPassword: 'unlock_password', // 普通密码解锁
  unlockTemp: 'unlock_temporary', // 临时密码解锁
  unlockDynamic: 'unlock_dynamic', // 动态密码解锁
  unlockCard: 'unlock_card', // 卡片解锁
  unlockFace: 'unlock_face', // 人脸识别解锁
  unlockKey: 'unlock_key', // 钥匙解锁
  unlockApp: 'unlock_app', // App远程解锁
  unlockRemote: 'unlock_remote',
  alarm: 'alarm', // 报警
  alarmLock: 'alarm_lock', // 兼容报警dp
  remote: 'unlock_request', // 远程开门倒计时
  replyRemote: 'reply_unlock_request', //  远超开门请求回复
  bat: 'battery_state', // 电量状态
  residualElectricity: 'residual_electricity', // 电量剩余百分比
  reverseLock: 'reverse_lock', // 反锁状态
  childLock: 'child_lock', // 童锁
  antiLock: 'anti_lock_outside', // 上提反锁
  hijack: 'hijack', // 劫持报警
  openInside: 'open_inside', // 从门内侧打开门锁
  bellVolume: 'doorbell_volume', // 门锁音量
  keyTone: 'key_tone', // 按键音量
  doorBell: 'doorbell', // 门铃呼叫 兼容dp
  doorBellRing: 'doorbell_ring', // 门铃呼叫
  remoteNoPsw: 'remote_no_dp_key', // 远程开门-无需密码
  remoteNoPswSet: 'remote_no_pd_setkey', // 远程开门-无需密码设置
  isRemoteClose: 'remote_unlock_switch', // 禁用远程开门
  remoteHasPsw: 'remote_unlock', // 含密远程开门指令
  language: 'language', // 门锁语言切换
  beepVolume: 'beep_volume', // 门锁本地导航音量
  motorTorque: 'motor_torque',
  automaticLock: 'automatic_lock',
  autoLockTime: 'auto_lock_time',
  unlockMethodCreate: 'unlock_method_create',
  unlockMethodDelete: 'unlock_method_delete',
  singleUsePassword: 'single_use_password',
  unlockVoiceRemote: 'unlock_voice_remote', // 远程语音解锁
};
