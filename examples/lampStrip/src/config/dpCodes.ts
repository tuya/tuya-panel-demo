import dpCodes from '@tuya/tuya-panel-lamp-sdk/lib/utils/dpCodes';

export default {
  ...dpCodes,
  sleepCode: 'sleep_mode', // 入睡 Sleep
  wakeupCode: 'wakeup_mode', // 唤醒 Wake up
  sceneCode: 'dreamlight_scene_mode', // 幻彩情景 Colorful scene
  micMusicCode: 'dreamlightmic_music_data', // 幻彩本地音乐律动 Colorful local music rhythm
  lightPixelNumberSetCode: 'lightpixel_number_set', // 裁剪实际设置 Actual setting of cropping
  lightPixelCode: 'light_pixel', // 灯带总点数 Total number of light strip points
  lightLengthCode: 'light_length', // 灯带总长度 Total length of light strip
  smearCode: 'paint_colour_data', // 调节涂抹 Adjust smearing
};
