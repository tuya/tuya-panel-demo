import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePersistFn } from 'ahooks';

export { AppStateStatus };

function useAppState(): AppStateStatus {
  const [appState, setAppState] = useState(AppState.currentState);

  const onChange = usePersistFn((newState: AppStateStatus) => {
    setAppState(newState);
  });

  useEffect(() => {
    AppState.addEventListener('change', onChange);

    return () => {
      AppState.removeEventListener('change', onChange);
    };
  }, []);

  return appState;
}

export default useAppState;
