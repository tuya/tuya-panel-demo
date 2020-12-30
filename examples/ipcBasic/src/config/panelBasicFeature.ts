import Res from '@res';

const getBasicMenuData = (nextProps: any, openMoreControl: boolean) => {
  const initMenu: any = [
    {
      show: true,
      key: 'fullScreen',
      test: 'tuya_ipc_fullscreen',
      imgSource: Res.publicImage.basicFullScreen,
    },
    {
      show: true,
      test: 'tuya_ipc_snap',
      key: 'capture',
      imgSource: Res.publicImage.basicCutScreen,
    },
    {
      show: nextProps.isSupportMic,
      test: 'tuya_ipc_talk_on',
      key: 'mic',
      imgSource: !nextProps.isTwoWayTalk
        ? Res.publicImage.basicOneWayTalk
        : Res.publicImage.basicTwoWayTalk,
    },
    {
      show: true,
      test: 'tuya_ipc_record_on',
      key: 'video',
      imgSource: Res.publicImage.basicVideo,
    },
    {
      show: true,
      test: 'tuya_ipc_basic_expand',
      key: 'more',
      imgSource: openMoreControl
        ? Res.publicImage.basicFeatureOpen
        : Res.publicImage.basicFeatureClose,
    },
  ];
  return initMenu;
};
export default {
  getBasicMenuData,
};
