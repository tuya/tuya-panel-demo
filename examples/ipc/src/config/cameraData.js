/* eslint-disable import/prefer-default-export */
import Res from '../res';
// 视频清晰度字典
export const clarityDic = {
  1: 'SS', // 省流量
  2: 'SD', // 标清
  4: 'HD', // 高清
  6: 'UD', // 超清
  8: 'SSP', // 超超清
};

export const decodeClarityDic = {
  SS: 1, // 省流量
  SD: 2, // 标清
  HD: 4, // 高清
  UD: 6, // 超清
  SSP: 8, // 超超清
};

export const notifyImgIcon = {
  ipc_motion: Res.notify.ipcMotion,
  ipc_doorbell: Res.notify.ipcDoorBell,
  ipc_passby: Res.notify.ipcPassby,
  ipc_linger: Res.notify.ipcLinger,
  ipc_leave_msg: Res.notify.ipcLeaveMsg,
  ipc_connected: Res.notify.ipcConnected,
  ipc_unconnected: Res.notify.ipcUnConnected,
  ipc_refuse: Res.notify.ipcRefuse,
};
