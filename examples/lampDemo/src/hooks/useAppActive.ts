import { useEffect } from 'react';
import { usePersistFn, usePrevious } from 'ahooks';
import useAppState from './useAppState';

type Fn = (...args: any) => any;

function useAppActive(fn: Fn) {
  const fnPersist = usePersistFn(fn);

  const appState = useAppState();
  const prevAppState = usePrevious(appState);

  useEffect(() => {
    if (prevAppState === 'background' && appState === 'active') fnPersist();
  }, [appState, prevAppState]);
}

export default useAppActive;
