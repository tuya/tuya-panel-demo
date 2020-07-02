import * as ApiUtils from '../../api';
import {
  updateCloud as updateCloudAction,
  updateScenePic as updateScenePicAction,
  updateScene as updateSceneAction,
  removeScene as removeSceneAction,
} from '../modules/cloud';
import { Dispatch } from 'react';

let dispatch: Dispatch<any>;

export const setDispatch = (fun: Dispatch<any>) => {
  dispatch = fun;
};

export const updateCloud = (key: string, data: any) => {
  // 先更新本地store，确保局域网下操作正常
  dispatch(updateCloudAction({ [key]: data }));
  ApiUtils.saveCloudConfig(key, data);
};
