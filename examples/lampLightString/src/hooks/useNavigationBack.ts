import { useCallback } from 'react';
import { TYSdk } from 'tuya-panel-kit';
import { useNavigationState, useNavigation } from '@react-navigation/native';

export default function useNavigationBack() {
  const routesLength = useNavigationState(state => state.routes.length);
  const navigation = useNavigation();

  return useCallback(() => {
    if (routesLength > 1) navigation.goBack();
    else TYSdk.native.back();
  }, [routesLength]);
}