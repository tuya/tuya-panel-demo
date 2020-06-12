/* eslint-disable import/prefer-default-export */
import Res from '../res';
import Strings from '../i18n';

export default class PidOrderStore {
  static featureData = [
    {
      pid: '1',
      data: [
        {
          // 隐私模式 105
          key: 'basic_private',
          imgSource: Res.publicImage.basicVideo,
          imgTitle: Strings.getLang('dp_basic_private'),
          tintColor: undefined,
          opacity: 1,
        },
        {
          // 移动追踪开关 161
          key: 'motion_tracking',
          imgSource: Res.publicImage.basicVideo,
          imgTitle: Strings.getLang('dp_motion_tracking'),
          tintColor: undefined,
          opacity: 1,
        },
        {
          // SD卡回放 110
          key: 'sd_status',
          // imgSource: Res.morePanel.sd_status,
          imgSource: Res.publicImage.basicVideo,
          imgTitle: Strings.getLang('dp_sd_status'),
          tintColor: undefined,
          opacity: 1,
        },
        // 服务端配置，调取原生接口
        {
          key: 'cloudStorage',
          imgSource: Res.publicImage.basicVideo,
          imgTitle: Strings.getLang('service_cloudStorage'),
          tintColor: undefined,
          opacity: 1,
        },
        // 永远存在的 多屏预览
        {
          key: 'multiScreen',
          imgSource: Res.publicImage.basicVideo,
          imgTitle: Strings.getLang('forever_multiScreen'),
          tintColor: undefined,
          opacity: 1,
        },
      ],
    },
  ];
}
