/* eslint-disable import/prefer-default-export */
import Res from '../res';
import Strings from '../i18n';

// 基础模块初始化菜单
export const liveBottomBasicMenuArr = {
  basicArr: [
    {
      hasMic: true, // 是否有mic配置
      key: 'fullScreen',
      test: 'tuya_ipc_fullscreen',
      imgSource: Res.publicImage.basicFullScreen,
      imgTitle: Strings.getLang('bottom_fullScreen'),
    },
    {
      test: 'tuya_ipc_snap',
      key: 'capture',
      imgSource: Res.publicImage.basicCutScreen,
      imgTitle: Strings.getLang('bottom_capture'),
    },
    {
      test: 'tuya_ipc_record_on',
      key: 'video',
      imgSource: Res.publicImage.basicVideo,
      imgTitle: Strings.getLang('bottom_video'),
    },
    {
      test: 'tuya_ipc_basic_expand',
      key: 'more',
      imgSource: Res.publicImage.basicFeatureClose,
      imgTitle: Strings.getLang('bottom_more_close'),
    },
  ],
  needFilterDp: [],
  needFilterCloudConfig: [
    {
      configName: 'mic',
      iconKey: 'mic',
      test: 'tuya_ipc_full_talk_on',
      key: 'mic',
      imgSource: Res.publicImage.basicOneWayTalk,
      imgTitle: Strings.getLang('bottom_oneway_talk'),
    },
  ],
};
