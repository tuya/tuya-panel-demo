import { createAction, handleActions } from 'redux-actions';

// ActionTypes
const INIT_CLOUD = 'INIT_CLOUD';
const UPDATE_CLOUD = 'UPDATE_CLOUD';
// Actions
export const initCloud = createAction(INIT_CLOUD);
export const updateCloud = createAction(UPDATE_CLOUD);

// Reducers
const cloudState = handleActions(
  {
    [INIT_CLOUD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [UPDATE_CLOUD]: (state, action) => {
      const { payload } = action;
      const { scenes } = state;

      Object.keys(payload).forEach(key => {
        if (key.includes('scene')) {
          const item = payload[key];
          const exist = scenes.find(({ sceneId }) => item.sceneId === sceneId);
          if (exist) {
            // 无修复名称情况，名称不做更新
            // exist.name = item.name;
            exist.value = item.value;
          }
        }
      });

      return {
        ...state,
        ...payload,
        scenes: [...scenes],
      };
    },
  },
  {
    isEditMode: false,
    isEditSceneColor: false, // 管理场景颜色
    isEditScene: false, // 修改亮度，饱合度，速度等
    selectSceneId: 0,
    selectSceneColorIndex: 0,
    scenes: [],
  }
);

export const reducers = {
  cloudState,
};
