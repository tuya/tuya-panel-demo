import { createAction, handleActions } from 'redux-actions';
import { parseCookBookListDatas, formatRecipeDetail } from '../../utils';
import { recipeFetchError } from './toast';
import TYNative from '../../api';
import Strings from '../../i18n';

// ActionTypes
export const UPDATE_RECIPE = 'UPDATE_RECIPE';

// Actions
export const updateRecipes = createAction(UPDATE_RECIPE);

export const setRecipes = datas => dispatch =>
  dispatch(
    updateRecipes({
      all: datas,
    })
  );

export const fetchRecipes = (pid, success, err) => async dispatch => {
  try {
    // error 时回调中会带userInfo
    TYNative.native.showLoading({
      title: Strings.getLang('fetching_recipe'),
    });
    // 获取全部菜谱
    const recipeLists = await TYNative.getRecipes('', 2000, pid);
    console.log('object', recipeLists);
    // 获取收藏菜谱
    const recipeCollectLists = await TYNative.getCollects(pid);
    if ('contentList' in recipeCollectLists) {
      const collectRecipes = formatRecipeDetail(recipeCollectLists, recipeCollectLists.contentList);
      dispatch(setCollectRecipes(collectRecipes));
    }
    let ret = [];
    if ('contentList' in recipeLists) {
      ret = parseCookBookListDatas(recipeLists);
    }
    typeof success === 'function' && success(ret);
    dispatch(setRecipes(ret));
  } catch (error) {
    console.log('error :', error);
    typeof err === 'function' && err(error);
    recipeFetchError(dispatch);
    dispatch(setRecipes([]));
  } finally {
    TYNative.native.hideLoading();
  }
};

export const setCurrentRecipe = data => dispatch =>
  dispatch(
    updateRecipes({
      currentRecipe: data,
    })
  );

export const setCollectRecipes = collect => dispatch =>
  dispatch(
    updateRecipes({
      collect,
    })
  );
export const recipes = handleActions(
  {
    [UPDATE_RECIPE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {
    home: [],
    collect: [],
    all: [],
    currentRecipe: {},
    recipeCache: {},
  }
);

export const reducers = {
  recipes,
};
