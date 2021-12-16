import { handleActions, createAction } from 'redux-actions';
import { getVoiceScenes } from '@api';
import { IVoiceSceneItem, IVoiceSceneAction, IRuleTriggerConditions } from '@interface';

const saveVoiceSceneList = createAction('SAVE_VOICE_SCENE_LIST');

const setVoiceSceneList = createAction('SET_VOICE_SCENE_LIST');
const saveScene = createAction('SAVE_VOICE_SCENE');
const resetScene = createAction('RESET_VOICE_SCENE');
const saveVoice = createAction('SAVE_VOICE');
const saveAuto = createAction('SAVE_AUTO');
const saveActions = createAction('SAVE_ACTIONS');

const voiceSceneListState = handleActions<IVoiceSceneItem[]>(
  {
    [saveVoiceSceneList.toString()]: (_state, action) => action.payload,
  },
  []
);

const voiceSceneStateInitValue = {
  name: '',
  id: '',
  voiceRules: [] as IRuleTriggerConditions[],
  autoRules: [],
  matchType: '1',
  actions: [] as IVoiceSceneAction[],
};

const voiceSceneState = handleActions(
  {
    [resetScene.toString()]: (_state, _action) => voiceSceneStateInitValue,
    [saveScene.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [saveActions.toString()]: (state, action: any) => ({
      ...state,
      actions: action.payload,
    }),
    [saveVoice.toString()]: (state, action: any) => ({
      ...state,
      voiceRules: action.payload,
    }),
    [saveAuto.toString()]: (state, action: any) => ({
      ...state,
      autoRules: action.payload,
    }),
  },
  voiceSceneStateInitValue
);

export const actions = {
  saveVoiceSceneList,
  setVoiceSceneList,
  saveScene,
  resetScene,
  saveVoice,
  saveAuto,
  saveActions,
};

export const reducers = {
  voiceSceneListState,
  voiceSceneState,
};

export const getVoiceSceneList = () => async dispatch => {
  try {
    const list = await getVoiceScenes();
    dispatch(saveVoiceSceneList(list));
  } catch (err) {
    console.log(err);
  }
};
