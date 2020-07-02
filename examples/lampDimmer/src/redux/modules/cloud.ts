import { handleActions, createAction } from 'redux-actions';

// ActionTypes
const INIT_CLOUD = 'INIT_CLOUD';
const UPDATE_CLOUD = 'UPDATE_CLOUD';
const UPDATE_SCENE_PIC = 'UPDATE_SCENE_PIC';
const UPDATE_SCENE_DATA = 'UPDATE_SCENE_DATA';
const REMOVE_SCENE_DATA = 'REMOVE_SCENE_DATA';

// actions
export const initCloud = createAction(INIT_CLOUD);
export const updateCloud = createAction(UPDATE_CLOUD);
export const updateScenePic = createAction(UPDATE_SCENE_PIC);
export const updateScene = createAction(UPDATE_SCENE_DATA);
export const removeScene = createAction(REMOVE_SCENE_DATA);

// reducer
const cloudState = handleActions(
  {
    [INIT_CLOUD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [UPDATE_CLOUD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [UPDATE_SCENE_PIC]: (state, action) => {
      const { sceneId, pic, picMiddle, picBig, isDefault } = action.payload;
      const { scenes } = state;
      const exit = scenes.find(scene => {
        if (scene.sceneId === sceneId) {
          scene.pic = pic;
          scene.picMiddle = picMiddle || pic;
          scene.picBig = picBig || pic;
          scene.isDefault = isDefault || false;

          return true;
        }

        return false;
      });

      // 添加
      if (!exit) {
        scenes.push(action.payload);
      }

      return { ...state, scenes: [...scenes] };
    },
    [UPDATE_SCENE_DATA]: (state, action) => {
      const data = action.payload;
      const { scenes } = state;
      scenes.find(scene => {
        if (scene.sceneId === data.sceneId) {
          Object.assign(scene, data);
          return true;
        }

        return false;
      });
      return { ...state, scenes: [...scenes] };
    },
    [REMOVE_SCENE_DATA]: (state, action) => {
      const sceneId = action.payload;
      const { scenes } = state;
      const newList = scenes.filter(scene => scene.sceneId !== sceneId);
      return { ...state, scenes: newList };
    },
  },
  {
    scenes: [],
    colourPresets: [],
    whitePresets: [],
    showCountDown: false,
    totalCountDown: 0, // 倒计时总时间
    isOpenMike: false,
    defaultScenes: [],
  }
);

export const reducers = {
  cloudState,
};
