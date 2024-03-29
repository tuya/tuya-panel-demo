export default {
  en: {
    me: 'Me',
    loading: 'loading',
    confirm: 'Confirm',
    cancel: 'Cancel',

    temp: 'Temporary',
    family: 'Member management',
    smartScene: 'Smart Scenes',
    set: 'Set',

    home_alarmMode: 'Arm Away Enabled',
    home_findDev: 'Can not find the lock. Click here',

    family_title: 'member',
    shareUserNotPre: 'No permission',
    set_sec: 'sec',
    set_min: 'min',

    opening: 'Unlocking',
    closing: 'Locking',
    lockClose: 'Lock close',
    lockOpen: 'Lock opened',
    openTimeOut: 'Timed out. Please try again.',
    operateSuccess: 'Operate success',
    operateFailed: 'Operate failed',

    noConnectDevice: 'Bluetooth is not connected, click the link',
    bleConnecting: 'Bluetooth Connecting',
    bleConnectFailed: 'Bluetooth connect failed',
    bleConnectSuccess: 'Bluetooth connect success',
    connectBle: 'ble connecting {0}s',

    set_timePeriodChoose: 'Period',
    set_videoTitle: 'Installation Video',
    set_copyLink: 'Copy Link',
    set_bookTitle: 'Electronic User Manual',
    set_unlockSwitchTip:
      'Once enabled, you must use a combination of unlocking methods to unlock the door.',
    set_selectUnlockSwitch: 'Verification Method',
    set_switchVerifyLockTip:
      'Once enabled, your unlocking permission is verified when you lock the door.',
    set_armingModeTip:
      'Once enabled, an alert is triggered if the door is unlocked from the inside.',
    set_muteModeTip: 'Unmute the alerts of the lock and mobile phone.',
    set_guideTip: 'Operation Guidance',
    set_lastDay: 'Next Day',
    set_unlock_remote: 'Remote Unlocking',
    set_voiceTip:
      'The voice password is verified when you unlock the door through a voice speaker.',
    set_confirmCloseRemoteTitle: 'Are you sure you want to disable remote unlocking?',
    set_confirmCloseRemoteSubTitle: 'Once disabled, remote voice unlocking cannot be used.',

    // 日志相关
    subPage_log_dev_bind: 'Bind device',
    subPage_log_member_schedule_update: 'Modify',
    subPage_log_suffix_custom: 'Time limit to be customized', // customized
    subPage_log_suffix_permanent: 'Time limit to be permanent',
    subPage_log_unlock_add: 'Add {0} to {1}',
    subPage_log_unlock_del: 'Delete {0} of {1}',
    subPage_log_temp_pwd_create: 'Add Custom Code',
    subPage_log_temp_pwd_del: 'Delete Custom Code',
    subPage_log_temp_pwd_meta_update: 'Modify Custom Code time to',
    subPage_log_temp_pwd_name_update: 'Modify Custom Code name to',
    subPage_log_offline_pwd_clear_achieve: 'Clear all offline password acquisition',
    subPage_log_offline_pwd_clear_single_achieve: 'Clear a single offline password to obtain',
    subPage_log_offline_pwd_name_update: 'Modify',
    remote_voice_pwd_setting: 'Door lock remote voice password setting operation',
    remote_voice_pwd_setting_true: 'Open',
    remote_voice_pwd_setting_close: 'Close',
    subPage_log_unlock_ble: 'Unlock by Bluetooth',
    subPage_log_unlock_password: 'Unlock with Code',
    subPage_log_unlock_temporary: 'Unlock with Custom Code',
    subPage_log_unlock_dynamic: 'Unlock with Dynamic Code',
    subPage_log_unlock_offline_pd: 'Unlock with Temp Code',
    subPage_log_unlock_offline_clear: 'Offline password clear all reports',
    subPage_log_unlock_offline_clear_single: 'Offline password clear single report',
    subPage_log_unlock_fingerprint: 'Unlock with Fingerprint',
    subPage_log_unlock_card: 'Unlock with Card',
    subPage_log_unlock_key: 'Unlock with Mechanical Key',
    subPage_log_unlock_face: 'Unlock with Face',
    subPage_log_unlock_eye: 'Unlock with Iris',
    subPage_log_unlock_hand: 'Unlock with Palm Print',
    subPage_log_unlock_finger_vein: 'Unlock with Finger Vein',
    subPage_log_unlock_double: 'Combination unlocking',
    subPage_log_lock_record: 'Close lock record',
    subPage_log_unlock_record_check: 'Unlock with Accessories',
    subPage_log_dynamic_pwd_achieve: 'get dynamic password',
    subPage_log_open_inside: 'Unlock from Inside',
    subPage_log_unlock_phone_remote: 'Remote Unlock',
    subPage_log_unlock_voice_remote: 'Remote Voice Unlcok',
    subPage_log_unlock_ble_ibeacon: 'Bluetooth Near-Field Unlock',
    subPage_log_use: 'Use',
    subPage_log_offline_pwd_achieve: 'Get',
    subPage_log_offline_pwd_achieve_1: 'One-Time Code',
    subPage_log_offline_pwd_achieve_0: 'Time-Limited Code',
    subPage_log_unlock_double_kit: 'Combined Unlock',
    subPage_log_to: 'to',
    subPage_log_offline_pwd_name_update_1: 'One-Time Code name',
    subPage_log_offline_pwd_name_update_0: 'Time-Limited Code name',
    subPage_log_offline_pwd_name_update_8: 'Clearing Code name',
    subPage_log_offline_pwd_name_update_9: 'All clearing Code name',

    subPage_log_module_1: 'Activate the module',

    HISTORY_LOCK_UNDEFINED: 'Undefined method to close the lock',
    HISTORY_LOCK_VOICE_REMOTE: 'Remote voice lock',
    HISTORY_LOCK_APP_REMOTE: 'Remote mobile phone lock is closed',
    HISTORY_LOCK_AUTO: 'Automatically close the lock',
    HISTORY_LOCK_LOCAL_MANUAL: 'Local manual lock lock',
    HISTORY_LOCK_FITTINGS: 'Door lock accessories close lock',
    HISTORY_LOCK_APP: 'app long press to close the lock',
    HISTORY_LOCK_GEO_FENCE: 'Geofence lock',

    logs_noLogs: 'No logs.',
  },
  zh: {
    me: '我',
    loading: '加载中',
    confirm: '确认',
    cancel: '取消',

    temp: '临时',
    family: '成员管理',
    smartScene: '智能应用',
    set: '设置',

    home_alarmMode: '离家布防已开启',
    home_findDev: '找不到锁，点这里',

    family_title: '成员',
    shareUserNotPre: '无权限',
    set_min: '分',
    set_sec: '秒',

    opening: '开锁中...',
    closing: '关锁中...',
    lockClose: '锁已关',
    lockOpen: '锁已开',
    openTimeOut: '超时，请重试',
    operateSuccess: '操作成功',
    operateFailed: '操作失败',

    noConnectDevice: '蓝牙未连接，点击连接',
    bleConnecting: '蓝牙连接中...',
    bleConnectFailed: '蓝牙连接失败',
    bleConnectSuccess: '蓝牙连接成功',
    connectBle: '蓝牙连接中 {0}秒',

    set_timePeriodChoose: '时间设置',
    set_videoTitle: '安装视频',
    set_copyLink: '复制链接',
    set_bookTitle: '电子说明书',
    set_unlockSwitchTip: '开启后，多种开锁方式结合使用才能开锁',
    set_selectUnlockSwitch: '验证方式',
    set_switchVerifyLockTip: '开启后，关门需要校验开门权限',
    set_armingModeTip: '开启后，从内面板开门将触发告警提醒',
    set_muteModeTip: '开启设备报警和手机报警的声音',
    set_guideTip: '引导操作',
    set_lastDay: '次日',
    set_unlock_remote: '远程开锁',
    set_voiceTip: '语音音响开门需验证此密码',
    set_confirmCloseRemoteTitle: '确定要关闭远程开锁?',
    set_confirmCloseRemoteSubTitle: '关闭后语音密码开门将不能使用',

    // 日志
    subPage_log_member_schedule_update: '修改',
    subPage_log_suffix_custom: '时效为自定义', // customized
    subPage_log_suffix_permanent: '时效为永久',
    subPage_log_dev_bind: '绑定设备',
    subPage_log_unlock_add: '给 {0} 添加 {1}',
    subPage_log_unlock_del: '删除 {0} 的 {1}',
    subPage_log_temp_pwd_create: '新增自定义密码',
    subPage_log_temp_pwd_del: '删除自定义临时密码',
    subPage_log_temp_pwd_meta_update: '修改自定义密码时效',
    subPage_log_temp_pwd_name_update: '修改自定义临时密码名称',
    subPage_log_offline_pwd_clear_achieve: '获取所有密码清空码',
    subPage_log_offline_pwd_clear_single_achieve: '获取单个密码清空码',
    subPage_log_offline_pwd_name_update: '修改',
    remote_voice_pwd_setting: '操作门锁远程语音密码',
    remote_voice_pwd_setting_true: '开启',
    remote_voice_pwd_setting_close: '关闭',
    subPage_log_unlock_ble: '手机蓝牙 开锁',
    subPage_log_unlock_password: '密码开锁',
    subPage_log_unlock_temporary: '自定义临时密码 开锁',
    subPage_log_unlock_dynamic: '动态密码 开锁',
    subPage_log_unlock_offline_pd: '离线密码 开锁',
    subPage_log_unlock_offline_clear: '清空离线密码所有上报',
    subPage_log_unlock_offline_clear_single: '清空离线密码单个上报',
    subPage_log_unlock_fingerprint: '指纹开锁',
    subPage_log_unlock_card: '门卡开锁',
    subPage_log_unlock_key: '机械钥匙 开锁',
    subPage_log_unlock_face: '人脸开锁',
    subPage_log_unlock_eye: '虹膜开锁',
    subPage_log_unlock_hand: '掌纹开锁',
    subPage_log_unlock_finger_vein: '指静脉开锁',
    subPage_log_unlock_double: '组合开锁',
    subPage_log_lock_record: '关锁记录',
    subPage_log_unlock_record_check: '门锁配件 开锁',
    subPage_log_dynamic_pwd_achieve: '获取动态密码',
    subPage_log_open_inside: '门从内侧打开',
    subPage_log_unlock_phone_remote: '远程 开锁',
    subPage_log_unlock_voice_remote: '远程语音 开锁',
    subPage_log_unlock_ble_ibeacon: '手机蓝牙靠近 开锁',
    subPage_log_use: '使用',
    subPage_log_offline_pwd_achieve: '获取',
    subPage_log_offline_pwd_achieve_1: '单次密码',
    subPage_log_offline_pwd_achieve_0: '限时密码',
    subPage_log_unlock_double_kit: '组合开锁',
    subPage_log_to: '为',
    subPage_log_offline_pwd_name_update_1: '单次密码名称',
    subPage_log_offline_pwd_name_update_0: '限时密码名称',
    subPage_log_offline_pwd_name_update_8: '单次清空密码名称',
    subPage_log_offline_pwd_name_update_9: '所有清空密码名称',

    subPage_log_module_1: '激活模组',

    HISTORY_LOCK_UNDEFINED: '未定义方式关锁',
    HISTORY_LOCK_VOICE_REMOTE: '远程语音关锁',
    HISTORY_LOCK_APP_REMOTE: '远程手机关锁',
    HISTORY_LOCK_AUTO: '自动关锁',
    HISTORY_LOCK_LOCAL_MANUAL: '本地手动关锁',
    HISTORY_LOCK_FITTINGS: '门锁配件关锁',
    HISTORY_LOCK_APP: 'app长按关锁',
    HISTORY_LOCK_GEO_FENCE: '地理围栏关锁',

    logs_noLogs: '暂无日志',
  },
};
