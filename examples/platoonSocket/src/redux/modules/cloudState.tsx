import { handleActions, createAction } from 'redux-actions';
import Strings from '../../i18n';
import { getDpsInfos, updateDpNames } from '../../api';

// actionTypes
export const SWITCH_NAME_CHANGE = 'SWITCH_NAME_CHANGE';
// actions
export const changeSwitchName = createAction(SWITCH_NAME_CHANGE);

export const getDpName = (codes: any) => async (dispatch: any) => {
  try {
    const dpsInfo = await getDpsInfos();
    const filteredDps = dpsInfo.filter((d: any) => codes.indexOf(d.code) !== -1);
    filteredDps.forEach((dps: any) => {
      dispatch(
        changeSwitchName({
          code: dps.code,
          name: dps.name || Strings.getDpLang(dps.code),
        })
      );
    });
  } catch (err) {
    console.log('updateDpName Error: ', err);
  }
};

export const updateDpName = ({ code, name }: { code: string; name: string }) => async dispatch => {
  try {
    await updateDpNames(code, name);
    dispatch(changeSwitchName({ code, name }));
  } catch (err) {
    console.log('updateDpName Error: ', err);
  }
};
const defaultSocketState = {
  socketNames: {},
};
// reducer
const socketState = handleActions(
  {
    [SWITCH_NAME_CHANGE]: (state, action) => {
      const { code, name } = action.payload;
      return {
        ...state,
        socketNames: {
          ...state.socketNames,
          [code]: name,
        },
      };
    },
  },
  defaultSocketState
);
export const reducers = {
  socketState,
};
