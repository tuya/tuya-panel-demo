/* eslint-disable import/prefer-default-export */
import Res from '../res';
import Strings from '../i18n';
import Notify from '../components/liveBottomBar/notifyFeature/notify';
import PtzModules from '../components/liveBottomBar/ptzZoomFeature/ptzModules';
import CollectPoint from '../components/liveBottomBar/collectPointFeature/collectPoint';
import CloudStorage from '../components/liveBottomBar/cloudStorageFeature';
import Feed from '../components/liveBottomBar/feedFeature';
import PanelView from '../components/liveBottomBar/customFeature/panelView';

// tab模块初始化配置数据
export const liveBottomTabMenuArr = {
  tabArr: [
    {
      test: 'tuya_ipc_more_message',
      key: 'notify',
      imgSource: Res.tabPanel.tabNotify,
      imgTitle: Strings.getLang('tabNotify'),
      component: Notify,
    },
    {
      test: 'tuya_ipc_more_ptz',
      key: 'ptzZoom',
      imgSource: Res.tabPanel.tabPtz,
      imgTitle: Strings.getLang('tabPtz'),
      component: PtzModules,
    },
    {
      test: 'tuya_ipc_more_point',
      key: 'point',
      imgSource: Res.tabPanel.tabPoint,
      imgTitle: Strings.getLang('tabPoint'),
      component: CollectPoint,
    },
    {
      test: 'tuya_ipc_more_cloud_storage',
      key: 'cloudStorage',
      imgSource: Res.tabPanel.tabCloud,
      imgTitle: Strings.getLang('tabCloud'),
      component: CloudStorage,
    },
    {
      test: 'tuya_ipc_more_feed_pet',
      key: 'feed',
      imgSource: Res.tabPanel.tabFeed,
      imgTitle: Strings.getLang('tabFeed'),
      component: Feed,
    },
    {
      test: 'tuya_ipc_dev_more',
      key: 'feature',
      imgSource: Res.tabPanel.tabFeature,
      imgTitle: Strings.getLang('tabFeature'),
      component: PanelView,
    },
  ],
  needFilterDp: [
    { dpCode: 'ptz_control', iconKey: 'ptzZoom' },
    { dpCode: 'zoom_control', iconKey: 'ptzZoom' },
    { dpCode: 'memory_point_set', iconKey: 'point' },
    { dpCode: 'feed_num', iconKey: 'feed' },
  ],
  needFilterCloudConfig: [{ configName: 'cloudStorage', iconKey: 'cloudStorage' }],
};
