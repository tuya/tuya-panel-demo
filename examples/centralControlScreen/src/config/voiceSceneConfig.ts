import Res from '@res';
import Strings from '@i18n';
import { EActionType } from '@interface';

export const statementInfo = {
  music: {
    data: ['播放音乐', '播放周杰伦的歌曲', '播放周杰伦的夜曲'],
    tip: '请输入你想让智能音箱播放的歌',
    showTimer: true,
  },
  response: {
    data: ['晚安哦，做个好梦', '早上好啊，又是元气满满的一天', '你真是世界上最美的人'],
    tip: '请输入你想让智能音箱说的话',
  },
  weather: {
    data: ['播报今天天气', '播报明天天气'],
    tip: '请输入天气信息',
  },
  news: {
    data: ['播报新闻', '播报社会新闻', '播报娱乐新闻'],
    tip: '请输入新闻信息',
    showTimer: true,
  },
  story: {
    data: ['播放白雪公主与七个小矮人', '播放灰姑娘'],
    tip: '请输入故事信息',
    showTimer: true,
  },
};

export const statements = [
  {
    id: 'device',
    text: Strings.getLang('action_device'),
    icon: Res.devices,
    action: EActionType.smartHome,
  },
  {
    id: 'scene',
    text: Strings.getLang('action_scene'),
    icon: Res.iconScenes,
    action: EActionType.appScene,
  },

  {
    id: 'response',
    text: Strings.getLang('action_response'),
    icon: Res.response,
    action: EActionType.tts,
  },

  {
    id: 'weather',
    text: Strings.getLang('action_weather'),
    icon: Res.weather,
    action: EActionType.weather,
  },
  {
    id: 'news',
    text: Strings.getLang('action_news'),
    icon: Res.news,
    action: EActionType.news,
  },
  {
    id: 'story',
    text: Strings.getLang('action_story'),
    icon: Res.story,
    action: EActionType.story,
  },
];

export const conditionsCfg = [
  {
    id: 'say',
    text: Strings.getLang('conditions_say'),
    icon: Res.say,
  },
  {
    id: 'device',
    text: Strings.getLang('conditions_device'),
    icon: Res.devices,
  },
];

export const conditionType = [
  {
    label: Strings.getLang('conditions_all'),
    value: '2',
  },
  {
    label: Strings.getLang('conditions_each'),
    value: '1',
  },
];
