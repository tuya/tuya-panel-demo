import { handleActions, createAction } from 'redux-actions';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { getAllDisplayedScene, getAllHiddenScene } from '@api';
import { ISceneItem } from '@interface';

const saveDisplayedSceneList = createAction<ISceneItem[]>('SAVE_DISPLAYED_SCENE_LIST');

const displayedSceneList = handleActions(
  {
    [saveDisplayedSceneList.toString()]: (_state, action) => action.payload,
  },
  [] as ISceneItem[]
);
const saveHiddenSceneList = createAction('SAVE_HIDDEN_SCENE_LIST');

const hiddenSceneList = handleActions<ISceneItem[]>(
  {
    [saveHiddenSceneList.toString()]: (_state, action) => action.payload,
  },
  [] as ISceneItem[]
);

export const actions = {
  saveDisplayedSceneList,
  saveHiddenSceneList,
};

export const reducers = {
  displayedSceneList,
  hiddenSceneList,
};

export const getSceneList = () => async dispatch => {
  try {
    // TYSdk.mobile.showLoading();
    const [displayedList, hiddenList] = await Promise.all([
      getAllDisplayedScene(),
      getAllHiddenScene(),
    ]);
    dispatch(saveDisplayedSceneList(displayedList));
    dispatch(saveHiddenSceneList(hiddenList));
    // TYSdk.mobile.hideLoading();
  } catch (err) {
    // TYSdk.mobile.hideLoading();
    console.log(err);
  }
};
