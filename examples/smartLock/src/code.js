export const openDoorDpCodes = [
  'unlock_finger',
  'unlock_password', // 普通密码解锁
  'unlock_card', // 卡片解锁
  'unlock_temporary', // 临时密码解锁
  'unlock_dynamic', // 动态开门
  'unlock_key', // 机械钥匙解锁
  'unlock_face', // 人脸识别解锁
  'unlock_hand', // 掌纹解锁
  'unlock_eye', // 	虹膜解锁
  'unlock_finger_vein', // 	指静脉解锁
  // 'open_close', // 开关门事件
  'open_inside', // 门从内侧打开
  'door_opened', // 门被打开
  'unlock_app', // 远程开门
  'unlock_offline_pd', // 离线开门记录
];
export const hideDpCodes = [
  'unlock_key', // 机械钥匙解锁
  // 'open_close', // 开关门事件
  'open_inside', // 门从内侧打开
  'door_opened', // 门被打开
];

export const settingCodes = [
  'doorbell_volume', // 门锁音量
  'key_tone', // 按键音量
  'beep_volume', // 本地门锁导航音量
  'doorbell_song', // 门铃铃声
  'language', // 门锁语音切换
  'automatic_lock', // 自动落锁
  'auto_lock_time', // 延迟落锁
];

export const alarmDpCodes = ['alarm_lock', 'doorbell', 'hijack', 'unlock_offline_clear'];
