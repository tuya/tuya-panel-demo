import { Dispatch } from 'react';
import { updateCloud as updateCloudAction } from '../modules/cloud';
import { updateUI as updateUIAction } from '../modules/common';

let dispatch: Dispatch<any>;

export const setDispatch = (fun: Dispatch<any>) => {
  dispatch = fun;
};

/**
 * 更新云端配置
 * @param data 数据
 */
export const updateCloud = (data: any) => {
  dispatch(updateCloudAction(data));
};

/**
 * 更新ui配置
 * @param data 数据
 */
export const updateUI = (data: any) => {
  dispatch(updateUIAction(data));
};
