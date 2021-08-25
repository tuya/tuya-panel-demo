import { useSelector as useSelectorBase, shallowEqual } from 'react-redux';
import { actions as CommonActions } from './modules/common';
import { actions as CustomizeActions } from './modules/customize';
import { ReduxState } from './combine';
import configureStore from './configureStore';

export * from './combine';
export * from './configureStore';

const actions = {
  common: CommonActions,
  customize: CustomizeActions,
};

export { actions };

export const store = configureStore();

export function useSelector<TSelected>(
  selector: (state: ReduxState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return useSelectorBase<ReduxState, TSelected>(selector, equalityFn || shallowEqual);
}
