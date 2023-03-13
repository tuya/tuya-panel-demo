import { useSelector as useSelectorBase, shallowEqual } from 'react-redux';
import { ReduxState } from '@models/type';

export default function useSelector<TSelected>(
  selector: (state: ReduxState) => TSelected,
  equalityFn: (left: TSelected, right: TSelected) => boolean = shallowEqual
) {
  return useSelectorBase<ReduxState, TSelected>(selector, equalityFn);
}
