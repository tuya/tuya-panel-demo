import dpCodes from '@tuya-rn/tuya-native-lamp-elements/lib/utils/dpCodes';

export default {
  ...dpCodes,
  sleepCode: 'sleep_mode', // 入睡
  wakeupCode: 'wakeup_mode', // 唤醒
  sceneCode: 'dreamlight_scene_mode', // 幻彩情景
  micMusicCode: 'dreamlightmic_music_data', // 幻彩本地音乐律动
  lightPixelNumberSetCode: 'lightpixel_number_set', // 裁剪实际设置
  lightPixelCode: 'light_pixel', // 灯带总点数
  lightLengthCode: 'light_length', // 灯带总长度
  smearCode: 'paint_colour_data', // 调节涂抹
};
