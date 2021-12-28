import { TYSdk } from 'tuya-panel-kit';
import {
  EResourceType,
  IDevItemFromApp,
  ISupportLinkageRes,
  IDeviceDPInfo,
  IVoiceSceneItem,
  ISceneForVoiceItem,
  IConditionItem,
  ISceneItem,
  IDevItemFromAPI,
  IRoomItem,
  IDevInstructItem,
  ISaveVoiceScene,
} from '@interface';

const api = (a: string, postData = {}, v = '1.0') => {
  return TYSdk.apiRequest(a, postData, v) as any;
};

/**
 * @language en-US
 * @description Get the device list in the family.
 */
/**
 * @language zh-CN
 * @description 获取家庭下的设备列表
 */
export const getDeviceLists = (): Promise<Array<IDevItemFromApp>> => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDeviceList(resolve, reject);
  });
};

/**
 * @language en-US
 * @description Get the room list in the family.
 */
/**
 * @language zh-CN
 * @description 获取家庭下的房间列表
 */
export const getRoomLists = (): Promise<IRoomItem[]> => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getRoomsInCurrentHome(resolve, reject);
  });
};

/**
 * @language en-US
 * @param {string} name The name that you want to set.
 * @param {string} devId Device id.
 * @description Rename device.
 */
/**
 * @language zh-CN
 * @param {string} name 要设置的名称
 * @param {string} devId 设备id
 * @description 重命名设备
 */
export const renameDevice = (name: string, devId: string) => {
  return new Promise((resolve, reject) => {
    TYSdk.native.renameSubDeviceName(
      {
        devId,
        name,
      },
      resolve,
      reject
    );
  });
};

/**
 * @language en-US
 * @description Get product configuration information.
 */
/**
 * @language zh-CN
 * @description 获取产品的标准化配置信息
 */
export const getDevInstructInfo = (): Promise<IDevInstructItem[]> => {
  return api('tuya.m.product.standard.config.list');
};

/**
 * @language en-US
 * @description Get nickname.
 */
/**
 * @language zh-CN
 * @description 获取中控屏已设置的昵称
 */
export const getNickname = () => {
  return api('tuya.ai.speech.nickname.get', {
    devId: TYSdk.devInfo.devId,
  });
};

/**
 * @language en-US
 * @param {string} name The name that you want to set.
 * @description Set nickname.
 */
/**
 * @language zh-CN
 * @param {string} name 要设置的名称
 * @description 设置中控屏的昵称
 */
export const setNickname = (nickname: string) => {
  return api('tuya.ai.speech.nickname.add', {
    nickname,
    devId: TYSdk.devInfo.devId,
  });
};

/**
 * @language en-US
 * @description Delete nickname.
 */
/**
 * @language zh-CN
 * @description 删除中控屏的昵称
 */
export const deleteNickname = () => {
  return api('tuya.ai.speech.nickname.del', {
    devId: TYSdk.devInfo.devId,
  });
};

/**
 * @language en-US
 * @description Resource recovery display.
 * @param {EResourceType} resourceType Resource Type
 * @param {string[]} resourceIds Resource id list
 */
/**
 * @language zh-CN
 * @description 资源恢复显示
 * @param {EResourceType} resourceType 资源类型
 * @param {string[]} resourceIds 资源id列表
 */
export const restoreResource = (resourceType: EResourceType, resourceIds: Array<string>) =>
  api(
    'tuya.m.screen.restore.resource',
    {
      resourceType,
      resourceIds: JSON.stringify(resourceIds),
      screenId: TYSdk.devInfo.devId,
    },
    '1.0'
  );

/**
 * @language en-US
 * @description Hide resources.
 * @param {EResourceType} resourceType Resource Type
 * @param {string[]} resourceIds Resource id list
 */
/**
 * @description 隐藏资源
 * @param {EResourceType} resourceType 资源类型
 * @param {string[]} resourceIds 资源id列表
 */
export const hideResource = (resourceType: EResourceType, resourceIds: Array<string>) =>
  api(
    'tuya.m.screen.hide.resource',
    {
      resourceType,
      resourceIds: JSON.stringify(resourceIds),
      screenId: TYSdk.devInfo.devId,
    },
    '1.0'
  );

/**
 * @language en-US
 * @description Get all the devices displayed under the central control screen.
 */
/**
 * @language zh-CN
 * @description 获取中控屏下所有展示的设备
 */
export const getAllDisplayedDevice = (): Promise<IDevItemFromAPI[]> =>
  api('tuya.m.screen.device.all', { screenId: TYSdk.devInfo.devId }, '2.0');

/**
 * @language en-US
 * @description Get all the devices hidden under the central control screen.
 */
/**
 * @language zh-CN
 * @description 获取中控屏下所有隐藏的设备
 */
export const getAllHiddenDevice = (): Promise<IDevItemFromAPI[]> =>
  api('tuya.m.screen.device.hide.all', { screenId: TYSdk.devInfo.devId }, '2.0');

/**
 * @language en-US
 * @description Get all displayed scenes under the control screen.
 */
/**
 * @language zh-CN
 * @description 获取中控屏下所有展示的场景
 */
export const getAllDisplayedScene = (): Promise<ISceneItem[]> =>
  api('tuya.m.screen.linkage.rule.all', { screenId: TYSdk.devInfo.devId }, '1.0');

/**
 * @language en-US
 * @description Get all hidden scenes under the control screen.
 */
/**
 * @language zh-CN
 * @description 获取中控屏下所有隐藏的场景
 */
export const getAllHiddenScene = (): Promise<ISceneItem[]> =>
  api('tuya.m.screen.linkage.rule.hide.all', { screenId: TYSdk.devInfo.devId }, '1.0');

/**
 * @language en-US
 * @description Get whether the device has reported rules.
 * @param {string} screenId Central control screen device id
 */
/**
 * @language zh-CN
 * @description 获取中控屏设备是否上报过规则
 * @param {string} screenId 中控屏设备id
 */
export const getIsReportRule = (screenId?: string): boolean =>
  api(
    'tuya.m.screen.whether.report.dev.show.rule',
    {
      screenId: screenId || TYSdk.devInfo.devId,
    },
    '1.0'
  );

/**
 * @language en-US
 * @description Get the list of device IDs and device groups that support the execution of actions (including user and family).
 */
/**
 * @language zh-CN
 * @description 获取支持执行动作的设备ID列表及设备群组列表(包括用户的和家庭的)
 */
export const getSceneLists = (): Promise<ISupportLinkageRes> =>
  api(
    'tuya.m.linkage.dev.group.list',
    {
      gid: TYSdk.devInfo.homeId,
    },
    '3.0'
  );

/**
 * @language en-US
 * @description Get the dp configuration list of the device.
 */
/**
 * @language zh-CN
 * @description 获取设备的dp配置列表
 */
export const getDeviceDpLists = (devId: string): Promise<IDeviceDPInfo[]> =>
  api('tuya.m.action.list', {
    devId,
  });

/**
 * @language en-US
 * @description Get a list of scenes suitable for voice.
 */
/**
 * @language zh-CN
 * @description 获取适用于音箱语音的场景列表
 */
export const getIotSceneList = (): Promise<ISceneForVoiceItem[]> =>
  api('tuya.ai.speech.iot.scene.list', {
    queryJson: {
      devId: TYSdk.devInfo.devId,
    },
  });

/**
 * @language en-US
 * @param {string} id The id of the scene to be delete.
 * @description Delete scene.
 */
/**
 * @language zh-CN
 * @param {string} id 要删除的场景id
 * @description 删除语音情景
 */
export const deleteScene = (id: string) =>
  api('tuya.ai.speech.scene.delete', {
    sceneId: id,
    devId: TYSdk.devInfo.devId,
  });

/**
 * @language en-US
 * @param {string} devId Device id.
 * @description Get the list of trigger conditions of the device.
 */
/**
 * @language zh-CN
 * @param {string} devId 设备id
 * @description 获取设备的触发条件列表
 */
export const getConditionSource = (devId: string): Promise<IConditionItem[]> =>
  api(
    'tuya.m.linkage.condition.source',
    {
      devId,
    },
    '3.0'
  );

/**
 * @language en-US
 * @param {string} sceneId The id of the sound scene to be enabled.
 * @description Enable the sound scene.
 */
/**
 * @language zh-CN
 * @param {string} sceneId 要启用的语音场景id
 * @description 启用语音情景
 */
export const enableVoiceScene = (sceneId: string) =>
  api('tuya.ai.auaora.scene.enable', { sceneId }, '1.0');

/**
 * @language en-US
 * @param {string} sceneId The id of the sound scene to be disable.
 * @description Disable the sound scene.
 */
/**
 * @language zh-CN
 * @param {string} sceneId 要禁用的语音场景id
 * @description 禁用语音情景
 */
export const disableVoiceScene = (sceneId: string) =>
  api('tuya.ai.auaora.scene.disable', { sceneId }, '1.0');

/**
 * @language en-US
 * @description Get the list of the sound scene.
 */
/**
 * @language zh-CN
 * @description 获取家庭下的语音场景列表
 */
export const getVoiceScenes = (): Promise<IVoiceSceneItem[]> =>
  api('tuya.ai.auaora.scope.scene', { scopeId: TYSdk.devInfo.homeId }, '1.0');

/**
 * @language en-US
 * @description Save the sound scene.
 */
/**
 * @language zh-CN
 * @description 保存声音情景
 */
export const saveVoiceScene = (scene: ISaveVoiceScene) =>
  api('tuya.ai.auaora.scene.save', { scene }, '1.0');
