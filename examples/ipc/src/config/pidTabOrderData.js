/* eslint-disable import/prefer-default-export */
import Res from '../res';
import Strings from '../i18n';
import Notify from '../components/liveBottomBar/notifyFeature/notify';
import PtzModules from '../components/liveBottomBar/ptzZoomFeature/ptzModules';
import CollectPoint from '../components/liveBottomBar/collectPointFeature/collectPoint';
import CloudStorage from '../components/liveBottomBar/cloudStorageFeature';
import PanelView from '../components/liveBottomBar/customFeature/panelView';

const tabData = [
  {
    pid: '1',
    data: [
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
        test: 'tuya_ipc_dev_more',
        key: 'feature',
        imgSource: Res.tabPanel.tabFeature,
        imgTitle: Strings.getLang('tabFeature'),
        component: PanelView,
      },
    ],
  },
];
export default {
  tabData,
};
// export default class PidOrderStore {
//   static tabData = [
//     {
//       pid: '1',
//       data: [
//         {
//           test: 'tuya_ipc_more_message',
//           key: 'notify',
//           imgSource: Res.tabPanel.tabNotify,
//           imgTitle: Strings.getLang('tabNotify'),
//           component: <Notify />,
//         },
//         {
//           test: 'tuya_ipc_more_ptz',
//           key: 'ptzZoom',
//           imgSource: Res.tabPanel.tabPtz,
//           imgTitle: Strings.getLang('tabPtz'),
//           component: <PtzModules />,
//         },
//         {
//           test: 'tuya_ipc_more_point',
//           key: 'point',
//           imgSource: Res.tabPanel.tabPoint,
//           imgTitle: Strings.getLang('tabPoint'),
//           component: <CollectPoint />,
//         },
//         // {
//         //   test: 'tuya_ipc_more_cloud_storage',
//         //   key: 'cloudStorage',
//         //   imgSource: Res.tabPanel.tabCloud,
//         //   imgTitle: Strings.getLang('tabCloud'),
//         //   component: <CloudStorage />,
//         // },
//         {
//           test: 'tuya_ipc_dev_more',
//           key: 'feature',
//           imgSource: Res.tabPanel.tabFeature,
//           imgTitle: Strings.getLang('tabFeature'),
//           component: <PanelView />,
//         },
//       ],
//     },
//   ];
// }
