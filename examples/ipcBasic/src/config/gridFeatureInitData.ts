import Res from '@res';
import Strings from '@i18n';

const getGridMenu = (schema, isSupportCloudStorage) => [
  {
    show: schema.sd_status !== undefined,
    key: 'sd_status',
    imgSource: Res.customFeature.dpSdStatus,
    imgTitle: Strings.getLang('ipc_panel_button_playBack'),
    type: 'basic',
    shareOpen: true,
  },
  {
    show: isSupportCloudStorage,
    key: 'cloudStorage',
    imgSource: Res.customFeature.serveCloudStorage,
    imgTitle: Strings.getLang('ipc_panel_button_cloudStorage'),
    type: 'basic',
    shareOpen: true,
  },
  {
    show: true,
    key: 'generalAlbum',
    imgSource: Res.customFeature.dpGeneralAlbum,
    imgTitle: Strings.getLang('ipc_panel_button_generalAlbum'),
    type: 'basic',
    shareOpen: true,
  },
  {
    show: true,
    key: 'generalTheme',
    imgSource: Res.customFeature.ipcThemeIcon,
    imgTitle: Strings.getLang('ipc_panel_button_theme'),
    type: 'basic',
    shareOpen: true,
  },
  {
    // 隐私模式 105
    show: schema.basic_private !== undefined,
    key: 'basic_private',
    imgSource: Res.customFeature.dpPrivate,
    imgTitle: Strings.getLang('ipc_panel_button_private'),
    type: 'switch',
    shareOpen: false,
  },
  {
    show: true,
    key: 'telephone_alarm',
    imgSource: Res.customFeature.dpTelephoneAlarm,
    imgTitle: Strings.getLang('ipc_panel_button_telephone_alarm'),
    type: 'basic',
    shareOpen: true,
  },
  {
    show: schema.basic_nightvision !== undefined,
    key: 'basic_nightvision',
    imgSource: Res.customFeature.dpNightVision,
    imgTitle: Strings.getLang('ipc_nightvision_button'),
    type: 'switchDialog',
    shareOpen: false,
  },
  {
    show: true,
    key: 'customDialogFeat1',
    imgSource: Res.customFeature.ipcCustomPage,
    imgTitle: Strings.getLang('ipc_panel_button_custom_dialog'),
    type: 'customDialog',
    shareOpen: true,
  },
  {
    show: true,
    key: 'rnCustomPage',
    imgSource: Res.customFeature.ipcCustomPage,
    imgTitle: Strings.getLang('ipc_panel_button_custom_page'),
    type: 'switchPage',
    shareOpen: true,
  },
];

export default {
  getGridMenu,
};
