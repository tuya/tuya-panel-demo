import Strings from '@i18n';
import { SceneCategory } from '@types';

export default [
  /** 风景 scenery */

  // 冰岛蓝 Iceland Blue
  {
    id: 21,
    key: 'IcelandBlue',
    category: SceneCategory[0],
    name: Strings.getLang('scene_name_IcelandBlue'),
    value: {
      version: 1,
      id: 21,
      mode: 10,
      speed: 82,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 193, saturation: 970 },
        { hue: 180, saturation: 480 },
        { hue: 181, saturation: 820 },
        { hue: 196, saturation: 990 },
      ],
    },
  },

  // 冰川快车 Glacier Express
  {
    id: 22,
    key: 'GlacierExpress',
    name: Strings.getLang('scene_name_GlacierExpress'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 22,
      mode: 10,
      speed: 100,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 146, saturation: 950 },
        { hue: 198, saturation: 960 },
      ],
    },
  },

  // 云海彩景 Sea of clouds
  {
    id: 23,
    key: 'SeaOfClouds',
    name: Strings.getLang('scene_name_SeaOfClouds'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 23,
      mode: 3,
      speed: 94,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 56, saturation: 470 },
        { hue: 30, saturation: 920 },
        { hue: 213, saturation: 690 },
        { hue: 282, saturation: 1000 },
      ],
    },
  },

  // 海上焰火 Fireworks at sea
  {
    id: 24,
    key: 'FireworksAtSea',
    name: Strings.getLang('scene_name_FireworksAtSea'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 24,
      mode: 2,
      speed: 100,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 178, saturation: 570 },
        { hue: 266, saturation: 1000 },
        { hue: 301, saturation: 1000 },
        { hue: 319, saturation: 1000 },
      ],
    },
  },

  // 雪中小屋 Hut in the Snow
  {
    id: 25,
    key: 'HutInTheSnow',
    name: Strings.getLang('scene_name_HutInTheSnow'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 25,
      mode: 10,
      speed: 84,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 177, saturation: 440 },
        { hue: 192, saturation: 1000 },
      ],
    },
  },

  // 萤火之夜 Firefly night
  {
    id: 26,
    key: 'FireflyNight',
    name: Strings.getLang('scene_name_FireflyNight'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 26,
      mode: 3,
      speed: 75,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 224, saturation: 570 },
        { hue: 265, saturation: 830 },
      ],
    },
  },

  // 北境之国 Northland
  {
    id: 27,
    key: 'Northland',
    name: Strings.getLang('scene_name_Northland'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 27,
      mode: 3,
      speed: 95,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 174, saturation: 570 },
        { hue: 196, saturation: 930 },
        { hue: 249, saturation: 1000 },
      ],
    },
  },

  // 绿草地 Grassland
  {
    id: 28,
    key: 'Grassland',
    name: Strings.getLang('scene_name_Grassland'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 28,
      mode: 10,
      speed: 90,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 820,
      colors: [
        { hue: 157, saturation: 1000 },
        { hue: 142, saturation: 1000 },
      ],
    },
  },

  // 北极光 Northern lights
  {
    id: 29,
    key: 'NorthernLights',
    name: Strings.getLang('scene_name_NorthernLights'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 29,
      mode: 3,
      speed: 82,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 174, saturation: 1000 },
        { hue: 166, saturation: 1000 },
        { hue: 193, saturation: 1000 },
        { hue: 204, saturation: 1000 },
      ],
    },
  },

  // 晚秋 Late autumn
  {
    id: 30,
    key: 'LateAutumn',
    name: Strings.getLang('scene_name_LateAutumn'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 30,
      mode: 10,
      speed: 82,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 25, saturation: 1000 },
        { hue: 34, saturation: 940 },
        { hue: 44, saturation: 910 },
        { hue: 20, saturation: 1000 },
        { hue: 12, saturation: 1000 },
      ],
    },
  },

  // 梦幻流星 Dream meteor
  {
    id: 71,
    key: 'DreamMeteor',
    name: Strings.getLang('scene_name_DreamMeteor'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 71,
      mode: 5,
      speed: 77,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 259, saturation: 690 },
        { hue: 193, saturation: 670 },
      ],
    },
  },

  // 初春 Early spring
  {
    id: 72,
    key: 'EarlySpring',
    name: Strings.getLang('scene_name_EarlySpring'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 72,
      mode: 6,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 334, saturation: 650 },
        { hue: 31, saturation: 730 },
      ],
    },
  },

  // 春游 Spring outing
  {
    id: 73,
    key: 'SpringOuting',
    name: Strings.getLang('scene_name_SpringOuting'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 73,
      mode: 7,
      speed: 14,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 218, saturation: 550 },
        { hue: 338, saturation: 650 },
        { hue: 92, saturation: 550 },
      ],
    },
  },

  // 夜航 Night service
  {
    id: 74,
    key: 'NightService',
    name: Strings.getLang('scene_name_NightService'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 74,
      mode: 8,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 247, saturation: 800 },
        { hue: 41, saturation: 790 },
        { hue: 269, saturation: 560 },
        { hue: 163, saturation: 390 },
      ],
    },
  },

  // 风铃 Wind chime
  {
    id: 75,
    key: 'WindChime',
    name: Strings.getLang('scene_name_WindChime'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 75,
      mode: 9,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 259, saturation: 690 },
        { hue: 65, saturation: 580 },
        { hue: 37, saturation: 750 },
        { hue: 94, saturation: 660 },
      ],
    },
  },

  // 城市之光 City Lights
  {
    id: 76,
    key: 'CityLights',
    name: Strings.getLang('scene_name_CityLights'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 76,
      mode: 12,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 216, saturation: 770 },
        { hue: 193, saturation: 670 },
        { hue: 259, saturation: 690 },
        { hue: 92, saturation: 550 },
      ],
    },
  },

  // 彩色弹珠 Color marbles
  {
    id: 77,
    key: 'ColorMarbles',
    name: Strings.getLang('scene_name_ColorMarbles'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 77,
      mode: 13,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 40, saturation: 1000 },
        { hue: 94, saturation: 660 },
        { hue: 193, saturation: 1000 },
        { hue: 255, saturation: 800 },
      ],
    },
  },

  // 夏日列车 Summer train
  {
    id: 78,
    key: 'SummerTrain',
    name: Strings.getLang('scene_name_SummerTrain'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 78,
      mode: 14,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 62, saturation: 950 },
        { hue: 190, saturation: 920 },
      ],
    },
  },

  // 圣诞夜 Christmas Eve
  {
    id: 79,
    key: 'ChristmasEve',
    name: Strings.getLang('scene_name_ChristmasEve'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 79,
      mode: 15,
      speed: 25,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 188, saturation: 1000 },
        { hue: 45, saturation: 780 },
        { hue: 0, saturation: 1000 },
        { hue: 100, saturation: 600 },
      ],
    },
  },

  // 幻海 Dream Sea
  {
    id: 80,
    key: 'DreamSea',
    name: Strings.getLang('scene_name_DreamSea'),
    category: SceneCategory[0],
    value: {
      version: 1,
      id: 80,
      mode: 16,
      speed: 50,
      segmented: 0,
      loop: 0,
      excessive: 0,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 230, saturation: 710 },
        { hue: 100, saturation: 600 },
        { hue: 281, saturation: 770 },
        { hue: 184, saturation: 570 },
      ],
    },
  },

  /** 生活 life */

  // 游戏 Game
  {
    id: 31,
    key: 'Game',
    name: Strings.getLang('scene_name_Game'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 31,
      mode: 2,
      speed: 95,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 272, saturation: 1000 },
        { hue: 210, saturation: 1000 },
        { hue: 173, saturation: 1000 },
        { hue: 139, saturation: 1000 },
      ],
    },
  },
  // 假日 Holiday
  {
    id: 32,
    key: 'Holiday',
    name: Strings.getLang('scene_name_Holiday'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 32,
      mode: 10,
      speed: 85,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 194, saturation: 880 },
        { hue: 318, saturation: 510 },
        { hue: 255, saturation: 700 },
        { hue: 285, saturation: 1000 },
      ],
    },
  },
  // 工作 Work
  {
    id: 33,
    key: 'Work',
    name: Strings.getLang('scene_name_Work'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 33,
      mode: 3,
      speed: 60,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 191, saturation: 240 },
        { hue: 260, saturation: 230 },
      ],
    },
  },
  // 派对 Party
  {
    id: 34,
    key: 'Party',
    name: Strings.getLang('scene_name_Party'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 34,
      mode: 4,
      speed: 100,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 215, saturation: 920 },
        { hue: 188, saturation: 830 },
        { hue: 55, saturation: 300 },
        { hue: 44, saturation: 630 },
        { hue: 353, saturation: 630 },
      ],
    },
  },
  // 潮流 Trend
  {
    id: 35,
    key: 'Trend',
    name: Strings.getLang('scene_name_Trend'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 35,
      mode: 2,
      speed: 100,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 264, saturation: 750 },
        { hue: 177, saturation: 470 },
        { hue: 205, saturation: 870 },
      ],
    },
  },
  // 运动 Sports
  {
    id: 36,
    key: 'Sports',
    name: Strings.getLang('scene_name_Sports'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 36,
      mode: 10,
      speed: 75,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 188, saturation: 380 },
        { hue: 214, saturation: 850 },
        { hue: 280, saturation: 1000 },
        { hue: 249, saturation: 770 },
      ],
    },
  },
  // 冥想 Meditation
  {
    id: 37,
    key: 'Meditation',
    name: Strings.getLang('scene_name_Meditation'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 37,
      mode: 3,
      speed: 67,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 183, saturation: 530 },
        { hue: 155, saturation: 840 },
        { hue: 205, saturation: 970 },
      ],
    },
  },
  // 约会 Dating
  {
    id: 38,
    key: 'Dating',
    name: Strings.getLang('scene_name_Dating'),
    category: SceneCategory[1],
    value: {
      version: 1,
      id: 38,
      mode: 1,
      speed: 89,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 281, saturation: 710 },
        { hue: 329, saturation: 610 },
        { hue: 205, saturation: 970 },
        { hue: 38, saturation: 1000 },
      ],
    },
  },

  /** 节日 festival */
  // 圣诞节 Christmas
  {
    id: 41,
    key: 'Christmas',
    name: Strings.getLang('scene_name_Christmas'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 41,
      mode: 2,
      speed: 97,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 11, saturation: 1000 },
        { hue: 217, saturation: 1000 },
        { hue: 43, saturation: 1000 },
        { hue: 145, saturation: 1000 },
        { hue: 185, saturation: 1000 },
      ],
    },
  },
  // 情人节 Valentine's Day
  {
    id: 42,
    key: 'ValentinesDay',
    name: Strings.getLang('scene_name_ValentinesDay'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 42,
      mode: 1,
      speed: 100,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 277, saturation: 1000 },
        { hue: 261, saturation: 1000 },
        { hue: 325, saturation: 1000 },
        { hue: 303, saturation: 1000 },
      ],
    },
  },
  // 万圣节 Halloween
  {
    id: 43,
    key: 'Halloween',
    name: Strings.getLang('scene_name_Halloween'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 43,
      mode: 3,
      speed: 90,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 0, saturation: 870 },
        { hue: 278, saturation: 1000 },
        { hue: 218, saturation: 1000 },
        { hue: 179, saturation: 1000 },
        { hue: 149, saturation: 1000 },
      ],
    },
  },
  // 感恩节 Thanksgiving Day
  {
    id: 44,
    key: 'ThanksgivingDay',
    name: Strings.getLang('scene_name_ThanksgivingDay'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 44,
      mode: 10,
      speed: 72,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 61, saturation: 1000 },
        { hue: 268, saturation: 910 },
        { hue: 186, saturation: 730 },
        { hue: 23, saturation: 970 },
      ],
    },
  },
  // 森林日 ForestDay
  {
    id: 45,
    key: 'ForestDay',
    name: Strings.getLang('scene_name_ForestDay'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 45,
      mode: 2,
      speed: 89,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 156, saturation: 990 },
        { hue: 188, saturation: 980 },
        { hue: 123, saturation: 960 },
      ],
    },
  },
  // 母亲节 Mother's Day
  {
    id: 46,
    key: 'MothersDay',
    name: Strings.getLang('scene_name_MothersDay'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 46,
      mode: 3,
      speed: 90,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 318, saturation: 540 },
        { hue: 268, saturation: 860 },
        { hue: 287, saturation: 350 },
      ],
    },
  },
  // 父亲节 Father's day
  {
    id: 47,
    key: 'FathersDay',
    name: Strings.getLang('scene_name_FathersDay'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 47,
      mode: 2,
      speed: 100,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 220, saturation: 660 },
        { hue: 182, saturation: 740 },
        { hue: 225, saturation: 770 },
      ],
    },
  },
  // 足球日 Football day
  {
    id: 48,
    key: 'FootballDay',
    name: Strings.getLang('scene_name_FootballDay'),
    category: SceneCategory[2],
    value: {
      version: 1,
      id: 48,
      mode: 2,
      speed: 94,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 0, saturation: 1000 },
        { hue: 120, saturation: 1000 },
        { hue: 187, saturation: 1000 },
      ],
    },
  },

  /** 心情 mood */
  // 夏日牧歌 Summer idyll
  {
    id: 51,
    key: 'SummerIdyll',
    name: Strings.getLang('scene_name_SummerIdyll'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 51,
      mode: 3,
      speed: 82,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 136, saturation: 800 },
        { hue: 210, saturation: 570 },
        { hue: 251, saturation: 390 },
      ],
    },
  },
  // 海之梦 Dream of the Sea
  {
    id: 52,
    key: 'DreamOfTheSea',
    name: Strings.getLang('scene_name_DreamOfTheSea'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 52,
      mode: 3,
      speed: 93,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 247, saturation: 540 },
        { hue: 309, saturation: 430 },
        { hue: 198, saturation: 520 },
        { hue: 145, saturation: 410 },
      ],
    },
  },
  // 爱与梦幻 Love and dream
  {
    id: 53,
    key: 'LoveAndDream',
    name: Strings.getLang('scene_name_LoveAndDream'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 53,
      mode: 3,
      speed: 82,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 770,
      colors: [
        { hue: 274, saturation: 980 },
        { hue: 304, saturation: 930 },
      ],
    },
  },
  // 春日垂钓 Spring fishing
  {
    id: 54,
    key: 'SpringFishing',
    name: Strings.getLang('scene_name_SpringFishing'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 54,
      mode: 2,
      speed: 73,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 102, saturation: 600 },
        { hue: 60, saturation: 730 },
        { hue: 30, saturation: 1000 },
      ],
    },
  },
  // 霓虹世界 Neon world
  {
    id: 55,
    key: 'NeonWorld',
    name: Strings.getLang('scene_name_NeonWorld'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 55,
      mode: 10,
      speed: 90,
      segmented: 0,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 51, saturation: 880 },
        { hue: 24, saturation: 1000 },
        { hue: 256, saturation: 690 },
        { hue: 227, saturation: 940 },
        { hue: 172, saturation: 480 },
      ],
    },
  },
  // 梦之境 Dreamland
  {
    id: 56,
    key: 'Dreamland',
    name: Strings.getLang('scene_name_Dreamland'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 56,
      mode: 2,
      speed: 87,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 268, saturation: 1000 },
        { hue: 282, saturation: 650 },
        { hue: 327, saturation: 890 },
        { hue: 21, saturation: 1000 },
        { hue: 60, saturation: 560 },
      ],
    },
  },
  // 夏天的风 Summer Wind
  {
    id: 57,
    key: 'SummerWind',
    name: Strings.getLang('scene_name_SummerWind'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 57,
      mode: 3,
      speed: 72,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 1000,
      colors: [
        { hue: 89, saturation: 1000 },
        { hue: 179, saturation: 710 },
      ],
    },
  },
  // 星球之旅 Planet Journey
  {
    id: 58,
    key: 'PlanetJourney',
    name: Strings.getLang('scene_name_PlanetJourney'),
    category: SceneCategory[3],
    value: {
      version: 1,
      id: 58,
      mode: 2,
      speed: 93,
      segmented: 1,
      loop: 1,
      excessive: 1,
      direction: 0,
      expand: 0,
      reserved1: 0,
      reserved2: 0,
      brightness: 770,
      colors: [
        { hue: 180, saturation: 940 },
        { hue: 284, saturation: 1000 },
        { hue: 232, saturation: 730 },
        { hue: 198, saturation: 950 },
      ],
    },
  },
];
