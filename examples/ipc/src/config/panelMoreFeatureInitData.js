/* eslint-disable import/prefer-default-export */
import Res from '../res';
import Strings from '../i18n';
// 更多菜单模块初始化配置数据
export const moreFeatureMenu = {
  allMenu: [
    {
      // SD卡回放 110
      test: 'tuya_ipc_more_playback',
      key: 'sd_status',
      // imgSource: Res.morePanel.sd_status,
      imgSource: Res.customFeature.dpSdStatus,
      imgTitle: Strings.getLang('ipc_panel_button_playBack'),
      type: 'basic',
    },
    // 服务端配置，调取原生接口
    {
      test: 'tuya_ipc_more_cloud',
      key: 'cloudStorage',
      imgSource: Res.customFeature.serveCloudStorage,
      imgTitle: Strings.getLang('ipc_panel_button_cloudStorage'),
      type: 'basic',
    },
    // 永远存在的 多屏预览
    // {
    //   test: 'tuya_ipc_more_mult',
    //   key: 'multiScreen',
    //   imgSource: Res.customFeature.dpMultScreen,
    //   imgTitle: Strings.getLang('ipc_panel_button_multiScreen'),
    //   type: 'basic',
    // },
    // 永远存在的 通用相册
    {
      test: 'tuya_ipc_more_album',
      key: 'generalAlbum',
      imgSource: Res.customFeature.dpGeneralAlbum,
      imgTitle: Strings.getLang('ipc_panel_button_generalAlbum'),
      type: 'basic',
    },
    {
      // 隐私模式 105
      test: 'tuya_ipc_more_private',
      key: 'basic_private',
      imgSource: Res.customFeature.dpPrivate,
      imgTitle: Strings.getLang('ipc_panel_button_private'),
      type: 'switch',
    },
    {
      // WDR开关 107
      test: 'tuya_ipc_more_wdr',
      key: 'basic_wdr',
      imgSource: Res.customFeature.dpWdr,
      imgTitle: Strings.getLang('dp_basic_wdr'),
      type: 'switch',
    },
    {
      // 夜视模式夜视开关 124
      test: 'tuya_ipc_more_nightvision_mode',
      key: 'nightvision_mode',
      imgSource: Res.customFeature.dpNightVision,
      imgTitle: Strings.getLang('ipc_nightmode_button'),
      type: 'switchDialog',
    },
    {
      // 红外夜视开关 108
      test: 'tuya_ipc_more_nightvision',
      key: 'basic_nightvision',
      imgSource: Res.customFeature.dpNightVision,
      imgTitle: Strings.getLang('ipc_nightvision_button'),
      type: 'switchDialog',
    },
    {
      // 微光全彩开关 180
      test: 'tuya_ipc_more_shimmer',
      key: 'basic_shimmer',
      imgSource: Res.customFeature.dpShimmer,
      imgTitle: Strings.getLang('ipc_panel_button_shimmer'),
      type: 'switch',
    },
    {
      // 抗闪烁 188
      test: 'tuya_ipc_more_flicker',
      key: 'basic_anti_flicker',
      imgSource: Res.customFeature.dpAntiFlicker,
      imgTitle: Strings.getLang('ipc_panel_button_anti_flicker'),
      type: 'switchDialog',
    },
    {
      // 设备音量控制 160
      test: 'tuya_ipc_more_volumn',
      key: 'basic_device_volume',
      imgSource: Res.customFeature.serveVolume,
      imgTitle: Strings.getLang('ipc_panel_button_device_volume'),
      type: 'customDialog',
    },
    {
      // 移动追踪开关 161
      test: 'tuya_ipc_more_tracking',
      key: 'motion_tracking',
      imgSource: Res.customFeature.dpTracking,
      imgTitle: Strings.getLang('ipc_panel_button_motion_tracking'),
      type: 'switch',
    },
    {
      // 移动侦测开关 134
      test: 'tuya_ipc_more_motion',
      key: 'motion_switch',
      imgSource: Res.customFeature.dpMotion,
      imgTitle: Strings.getLang('ipc_panel_button_motion_switch'),
      type: 'switch',
    },
    {
      // PIR开关及灵敏度 152
      test: 'tuya_ipc_more_pir',
      key: 'pir_switch',
      imgSource: Res.customFeature.dpPir,
      imgTitle: Strings.getLang('ipc_pir_button'),
      type: 'switchDialog',
    },
    {
      // 声音侦测开关 139
      test: 'tuya_ipc_more_decibel',
      key: 'decibel_switch',
      imgSource: Res.customFeature.dpDecibel,
      imgTitle: Strings.getLang('ipc_panel_button_decibel_switch'),
      type: 'switch',
    },
    {
      // 巡航 179
      test: 'tuya_ipc_more_cruise',
      key: 'cruise_status',
      imgSource: Res.customFeature.dpCruise,
      imgTitle: Strings.getLang('ipc_panel_button_cruise'),
      type: 'switchPage',
    },
    {
      // 智能画框开关 198
      test: 'tuya_ipc_more_outline',
      key: 'ipc_object_outline',
      imgSource: Res.customFeature.ipcOutLine,
      imgTitle: Strings.getLang('ipc_panel_button_object_outline'),
      type: 'switch',
    },
    // {
    //   // 温度设置  dp暂定
    //   key: 'temp_setting',
    //   imgSource: Res.customFeature.dpTempSetting,
    //   imgTitle: Strings.getLang('ipc_panel_button_temp_setting'),
    //   type: 'switchDialog',
    // },
    // {
    //   // 湿度设置  dp暂定
    //   key: 'humility_setting',
    //   imgSource: Res.customFeature.dpHumility,
    //   imgTitle: Strings.getLang('ipc_panel_button_humility_setting'),
    //   type: 'switchDialog',
    // },
    {
      // 灯光控制 138
      test: 'tuya_ipc_more_floodlight',
      key: 'floodlight_switch',
      imgSource: Res.customFeature.dpFloodLight,
      imgTitle: Strings.getLang('ipc_light_button'),
      type: 'customDialog',
    },
    // {
    //   // 蜂鸣器 159
    //   key: 'siren_switch',
    //   imgSource: Res.customFeature.dpSiren,
    //   imgTitle: Strings.getLang('ipc_panel_button_siren_switch'),
    //   type: 'switchDialog',
    // },
    {
      // 摇篮曲 dp234
      test: 'tuya_ipc_more_lullaby',
      key: 'ipc_lullaby',
      imgSource: Res.customFeature.dpLullaby,
      imgTitle: Strings.getLang('ipc_lullaby_button'),
      type: 'customDialog',
    },
    // {
    //   // 工作模式 189
    //   key: 'ipc_work_mode',
    //   imgSource: Res.customFeature.dpLullaby,
    //   imgTitle: Strings.getLang('ipc_panel_button_work_mode'),
    //   type: 'switchDialog',
    // },
    // {
    //   // 指示灯开关 101
    //   key: 'basic_indicator',
    //   imgSource: Res.customFeature.dpIndicator,
    //   imgTitle: Strings.getLang('dp_basic_indicator'),
    //   tintColor: undefined,
    //   opacity: 1,
    // },
    // {
    //   // 画面翻转 103
    //   key: 'basic_flip',
    //   imgSource: Res.customFeature.dpFlip,
    //   imgTitle: Strings.getLang('dp_basic_flip'),
    //   tintColor: undefined,
    //   opacity: 1,
    // },
    // {
    //   // 时间水印开关 104
    //   key: 'basic_osd',
    //   imgSource: Res.play_back,
    //   imgTitle: Strings.getLang('dp_basic_osd'),
    //   tintColor: undefined,
    //   opacity: 1,
    // },
  ],
  needFilterDp: [
    { dpCode: 'sd_status', iconKey: 'sd_status' },
    { dpCode: 'basic_private', iconKey: 'basic_private' },
    { dpCode: 'basic_wdr', iconKey: 'basic_wdr' },
    { dpCode: 'basic_nightvision', iconKey: 'basic_nightvision' },
    { dpCode: 'nightvision_mode', iconKey: 'nightvision_mode' },
    { dpCode: 'basic_shimmer', iconKey: 'basic_shimmer' },
    { dpCode: 'basic_anti_flicker', iconKey: 'basic_anti_flicker' },
    { dpCode: 'basic_device_volume', iconKey: 'basic_device_volume' },
    { dpCode: 'motion_tracking', iconKey: 'motion_tracking' },
    { dpCode: 'motion_switch', iconKey: 'motion_switch' },
    { dpCode: 'pir_switch', iconKey: 'pir_switch' },
    { dpCode: 'decibel_switch', iconKey: 'decibel_switch' },
    { dpCode: 'cruise_status', iconKey: 'cruise_status' },
    { dpCode: 'ipc_object_outline', iconKey: 'ipc_object_outline' },
    { dpCode: 'temp_setting', iconKey: 'temp_setting' },
    { dpCode: 'humility_setting', iconKey: 'humility_setting' },
    { dpCode: 'floodlight_switch', iconKey: 'floodlight_switch' },
    { dpCode: 'siren_switch', iconKey: 'siren_switch' },
    { dpCode: 'ipc_lullaby', iconKey: 'ipc_lullaby' },
    { dpCode: 'ipc_work_mode', iconKey: 'ipc_work_mode' },
    // { dpCode: 'basic_indicator', iconKey: 'basic_indicator' },
    // { dpCode: 'basic_flip', iconKey: 'basic_flip' },
    // { dpCode: 'basic_osd', iconKey: 'basic_osd' },
  ],
  needFilterCloudConfig: [{ configName: 'cloudStorage', iconKey: 'cloudStorage' }],
};
